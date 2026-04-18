import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable, Subject, BehaviorSubject,
  interval, of, forkJoin, Subscription,
} from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';

export interface Equipement {
  id:      number;
  nom:     string;
  etat:    string;
  typeNom: string;
  icon:    string;
}

export interface Piece {
  id:          number;
  nom:         string;
  typeNom:     string;
  icon:        string;
  equipements: Equipement[];
}

export interface AiSuggestion {
  equipementId: number;
  equipment:    string;
  nom:          string;
  piece:        string;
  pieceId:      number;
  confidence:   number;
  message:      string;
  icon:         string;
}

export interface FeedbackPayload {
  equipment:   string;
  confirmed:   boolean;
  temperature: number;
  is_daylight: number;
  day_type:    string;
}

export interface MissedNotification {
  equipementId: number;
  equipment:    string;
  nom:          string;
  piece:        string;
  icon:         string;
  message:      string;
  confidence:   number;
  missedAt:     string;
}

@Injectable({ providedIn: 'root' })
export class AiNotificationService {

  private readonly aiUrl  = 'http://localhost:8001';
  private readonly apiUrl = 'http://localhost:5297/api';

  private suggestionsSubject      = new BehaviorSubject<AiSuggestion[]>([]);
  suggestions$                    = this.suggestionsSubject.asObservable();

  private missedCountSubject      = new BehaviorSubject<number>(0);
  missedCount$                    = this.missedCountSubject.asObservable();

  private panelSubject            = new Subject<void>();
  panelToggle$                    = this.panelSubject.asObservable();

  private equipementAllumeSubject = new Subject<number>();
  equipementAllume$               = this.equipementAllumeSubject.asObservable();

  dismissed = new Set<string>();

  private ws:            WebSocket | null = null;
  private wsConnected    = false;
  private wsStarted      = false;
  private reconnectTimer: any;
  private wsParams: any  = null;

  private pollingSub:    Subscription | null = null;
  private pollingStarted = false;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  updateMissedCount(count: number) { this.missedCountSubject.next(count); }
  togglePanel()                    { this.panelSubject.next(); }
  emitEquipementAllume(id: number) { this.equipementAllumeSubject.next(id); }
  dismissSuggestion(id: string)    { this.dismissed.add(id); }
  isDismissed(id: string): boolean { return this.dismissed.has(id); }


  startWebSocket(params?: any): void {
    if (this.wsStarted) return;
    this.wsStarted = true;
    if (params) {
      this.wsParams = params;
    }
    this.connectWS();
  }

  private connectWS(): void {
    const token  = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') ?? 'guest';

    if (!token) {
      console.warn('⚠️ Pas de token → fallback polling direct');
      this.wsStarted = false;
      this.startPollingFallback();
      return;
    }

    // ✅ Les testParams sont envoyés dans l'URL WebSocket
    const p = this.wsParams ?? {};
    const queryParams = new URLSearchParams({
      token:       token,
      hour:        String(p.hour        ?? new Date().getHours()),
      temperature: String(p.temperature ?? 20),
      is_daylight: String(p.is_daylight ?? 0),
      is_holiday:  String(p.is_holiday  ?? 0),
      is_weekend:  String(p.is_weekend  ?? 0),
      day_type:    p.day_type           ?? 'workday',
    });

    this.ws = new WebSocket(
      `ws://localhost:8001/ws/notifications/${userId}?${queryParams.toString()}`
    );

    this.ws.onopen = () => {
      console.log('✅ WebSocket connecté avec params :', this.wsParams);
      this.wsConnected = true;
      clearTimeout(this.reconnectTimer);
      this.stopPollingFallback();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'ping') {
          this.ws?.send('pong');
          return;
        }

        if (data.type === 'batch') {
          if (!data.notifications || data.notifications.length === 0) {
            console.log('📭 Batch vide reçu — aucune prédiction active');
            // ✅ Ne pas vider les suggestions existantes si le batch est vide
            return;
          }

          this.getPieces().pipe(
            catchError(() => {
              console.error('❌ getPieces() échoué dans onmessage');
              return of([]);
            })
          ).subscribe(pieces => {
            if (!pieces.length) return;
            const mapped = this.mapNotifications(data.notifications, pieces);
            if (mapped.length > 0) {
              this.suggestionsSubject.next(mapped);
            }
          });
        }

      } catch (e) {
        console.error('❌ WS parse error', e);
      }
    };

    this.ws.onclose = (event) => {
      console.warn(`⚠️ WebSocket fermé (code: ${event.code}) — fallback polling`);
      this.wsConnected = false;

      if (event.code === 4001) {
        console.error('🔒 Token invalide — pas de reconnexion');
        this.startPollingFallback();
        return;
      }

      this.startPollingFallback();

      this.reconnectTimer = setTimeout(() => {
        console.log('🔄 Tentative de reconnexion WebSocket...');
        this.wsStarted = false;
        this.startWebSocket(this.wsParams);
      }, 5000);
    };

    this.ws.onerror = (err) => {
      console.error('❌ WS erreur :', err);
      this.ws?.close();
    };
  }


  private startPollingFallback(): void {
    if (this.pollingStarted) return;
    this.pollingStarted = true;
    console.log('🔄 Polling fallback démarré (30s)');

    this.loadSuggestionsHTTP(this.wsParams).subscribe(data => {
      if (!this.wsConnected) this.suggestionsSubject.next(data);
    });

    this.pollingSub = interval(30000).pipe(
      switchMap(() => this.loadSuggestionsHTTP(this.wsParams)),
      catchError(() => of([]))
    ).subscribe(data => {
      if (!this.wsConnected) this.suggestionsSubject.next(data);
    });
  }

  private stopPollingFallback(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub     = null;
      this.pollingStarted = false;
      console.log('⏹️ Polling fallback arrêté (WS reconnecté)');
    }
  }


  private loadSuggestionsHTTP(params?: any): Observable<AiSuggestion[]> {
    const defaultParams = {
      hour:        new Date().getHours(),
      temperature: 20,
      is_daylight: 0,
      is_holiday:  0,
      is_weekend:  0,
      day_type:    'workday',
    };
    const resolvedParams = params ?? defaultParams;

    return forkJoin({
      pieces:      this.getPieces().pipe(catchError(() => of([]))),
      predictions: this.testPrediction(resolvedParams).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ pieces, predictions }) => {
        if (!predictions?.suggestions?.length) return [];
        return this.mapNotifications(predictions.suggestions, pieces as Piece[]);
      })
    );
  }


  private mapNotifications(notifications: any[], pieces: Piece[]): AiSuggestion[] {
    const TYPE_TO_MODEL: Record<string, string> = {
      'Lampe':       'Lumiere_ON',
      'Climatiseur': 'Clim_ON',
      'Chauffage':   'Chauffage_ON',
    };
    const MODEL_TO_ICON: Record<string, string> = {
      'Lumiere_ON':   'lightbulb',
      'Clim_ON':      'ac_unit',
      'Chauffage_ON': 'thermostat',
    };

    const confidenceMap: Record<string, number> = {};
    const predictedON = new Set<string>();

    notifications.forEach(n => {
      predictedON.add(n.equipment);
      confidenceMap[n.equipment] = n.confidence ?? n.confidence_score ?? 0;
    });

    const suggestions: AiSuggestion[] = [];
    pieces.forEach(piece => {
      piece.equipements.forEach(equip => {
        const modelKey = TYPE_TO_MODEL[equip.typeNom];
        if (modelKey && predictedON.has(modelKey) && equip.etat?.toLowerCase() === 'off') {
          suggestions.push({
            equipementId: equip.id,
            equipment:    modelKey,
            nom:          equip.nom,
            piece:        piece.nom,
            pieceId:      piece.id,
            confidence:   confidenceMap[modelKey] ?? 0,
            message:      `Voulez-vous allumer ${equip.nom} dans ${piece.nom} ?`,
            icon:         MODEL_TO_ICON[modelKey] ?? 'power',
          });
        }
      });
    });

    const seen = new Set<number>();
    return suggestions.filter(s => {
      if (seen.has(s.equipementId)) return false;
      seen.add(s.equipementId);
      return true;
    });
  }


  getPieces(): Observable<Piece[]> {
    return this.http.get<Piece[]>(`${this.apiUrl}/pieces`, {
      headers: this.getHeaders(),
    });
  }

  testPrediction(params: any): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/predict/test`, {
      params: params as Record<string, string | number>,
    });
  }

  sendFeedback(payload: FeedbackPayload): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/feedback`, null, {
      params: {
        equipment: payload.equipment,
        confirmed: payload.confirmed ? 'true' : 'false',
        day_type:  payload.day_type,
      },
    });
  }

  sendBatchFeedback(payload: any): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/feedback/batch`, payload);
  }

  allumerEquipement(equipementId: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/equipement/${equipementId}/etat`,
      { etat: 'On' },
      { headers: this.getHeaders() },
    );
  }

  saveMissedNotif(userId: string, notif: MissedNotification): Observable<any> {
    return this.http.post(`${this.aiUrl}/notifications/missed`, { userId, notif });
  }

  getMissedNotifs(userId: string): Observable<{ missed: MissedNotification[] }> {
    return this.http.get<{ missed: MissedNotification[] }>(
      `${this.aiUrl}/notifications/missed/${userId}`
    );
  }

  deleteMissedNotif(userId: string, equipementId: number): Observable<any> {
    return this.http.delete(
      `${this.aiUrl}/notifications/missed/${userId}/${equipementId}`
    );
  }


  resetService(): void {
    this.wsStarted   = false;
    this.wsConnected = false;
    this.wsParams    = null;
    this.ws?.close();
    clearTimeout(this.reconnectTimer);
    this.stopPollingFallback();
    this.suggestionsSubject.next([]);
    this.missedCountSubject.next(0);
    this.dismissed.clear();
  }
}