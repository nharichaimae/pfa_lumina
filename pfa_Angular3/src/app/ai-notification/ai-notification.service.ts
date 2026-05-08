import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Observable, Subject, BehaviorSubject,
  interval, of, forkJoin, Subscription,
} from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';



export interface Equipement {
  id: number;
  nom: string;
  etat: string;
  typeNom: string;
  icon: string;
}

export interface Piece {
  id: number;
  nom: string;
  typeNom: string;
  icon: string;
  equipements: Equipement[];
}

export interface AiSuggestion {
  equipementId: number;
  equipment: string;
  nom: string;
  piece: string;
  pieceId: number;
  confidence: number;
  message: string;
  icon: string;
}

export interface FeedbackPayload {
  equipment: string;
  confirmed: boolean;
  temperature: number;
  is_daylight: number;
  day_type: string;
}

export interface MissedNotification {
  equipementId: number;
  equipment: string;
  nom: string;
  piece: string;
  icon: string;
  message: string;
  confidence: number;
  missedAt: string;
}


@Injectable({ providedIn: 'root' })
export class AiNotificationService {

  private readonly aiUrl = 'http://localhost:8001';
  private readonly apiUrl = 'http://localhost:5297/api';

  // =========================
  // 🔐 AUTH / BLOCK IA
  // =========================
  private iaBlocked = false;

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  isBlockedIA(userId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `http://localhost:8080/api/admin/isBlockedIA/${userId}`
    ).pipe(
      catchError(() => of(true))
    );
  }

  // =========================
  // STREAMS
  // =========================
  private suggestionsSubject = new BehaviorSubject<AiSuggestion[]>([]);
  suggestions$ = this.suggestionsSubject.asObservable();

  private missedCountSubject = new BehaviorSubject<number>(0);
  missedCount$ = this.missedCountSubject.asObservable();

  private panelSubject = new Subject<void>();
  panelToggle$ = this.panelSubject.asObservable();

  private equipementAllumeSubject = new Subject<number>();
  equipementAllume$ = this.equipementAllumeSubject.asObservable();

  private closePanelSubject = new Subject<void>();
  closePanel$ = this.closePanelSubject.asObservable();

  dismissed = new Set<string>();

  // =========================
  // WS + POLLING
  // =========================
  private ws: WebSocket | null = null;
  private wsConnected = false;
  private wsStarted = false;
  private reconnectTimer: any;
  private wsParams: any = null;

  private pollingSub: Subscription | null = null;
  private pollingStarted = false;

  constructor(private http: HttpClient) {}

  // =========================
  // HEADERS
  // =========================
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // =========================
  // BASIC ACTIONS
  // =========================
  updateMissedCount(count: number) {
    this.missedCountSubject.next(count);
  }

  togglePanel() {
    this.panelSubject.next();
  }

  emitEquipementAllume(id: number) {
    this.equipementAllumeSubject.next(id);
  }

  dismissSuggestion(id: string) {
    this.dismissed.add(id);
  }

  isDismissed(id: string): boolean {
    return this.dismissed.has(id);
  }

  // =========================
  // START WS
  // =========================
  startWebSocket(params?: any): void {

    if (!this.isAuthenticated) {
      console.warn('⛔ Non authentifié');
      this.resetService();
      return;
    }

    const userId = Number(localStorage.getItem('userId'));

    this.isBlockedIA(userId).subscribe(blocked => {

      this.iaBlocked = blocked;

      if (blocked) {
        console.warn('🚫 IA BLOQUÉE');
        this.suggestionsSubject.next([]);
        this.stopPollingFallback();
        this.ws?.close();
        return;
      }

      if (this.wsStarted) return;

      this.wsStarted = true;
      if (params) this.wsParams = params;

      this.connectWS();
    });
  }

  // =========================
  // WS CONNECT
  // =========================
  private connectWS(): void {

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId') ?? 'guest';

    if (!token) {
      this.startPollingFallback();
      return;
    }

    const p = this.wsParams ?? {};

    const queryParams = new URLSearchParams({
      token,
      hour: String(p.hour ?? new Date().getHours()),
      temperature: String(p.temperature ?? 20),
      is_daylight: String(p.is_daylight ?? 0),
      is_holiday: String(p.is_holiday ?? 0),
      is_weekend: String(p.is_weekend ?? 0),
      day_type: p.day_type ?? 'workday',
    });

    this.ws = new WebSocket(
      `ws://localhost:8001/ws/notifications/${userId}?${queryParams}`
    );

    this.ws.onopen = () => {
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

          if (this.iaBlocked) return;
          if (!data.notifications?.length) return;

          this.getPieces().subscribe(pieces => {
            const mapped = this.mapNotifications(data.notifications, pieces);
            this.suggestionsSubject.next(mapped);
          });
        }

      } catch {}
    };

    this.ws.onclose = () => {
      this.wsConnected = false;
      this.startPollingFallback();

      if (this.iaBlocked) return;

      this.reconnectTimer = setTimeout(() => {
        this.wsStarted = false;
        this.startWebSocket(this.wsParams);
      }, 5000);
    };
  }

  // =========================
  // POLLING FALLBACK
  // =========================
  private startPollingFallback(): void {

    if (!this.isAuthenticated) return;
    if (this.pollingStarted || this.iaBlocked) return;

    this.pollingStarted = true;

    this.pollingSub = interval(30000).pipe(
      switchMap(() => this.loadSuggestionsHTTP(this.wsParams)),
      catchError(() => of([]))
    ).subscribe(data => {
      if (!this.wsConnected && !this.iaBlocked) {
        this.suggestionsSubject.next(data);
      }
    });
  }

  private stopPollingFallback(): void {
    this.pollingSub?.unsubscribe();
    this.pollingSub = null;
    this.pollingStarted = false;
  }

  // =========================
  // HTTP LOAD
  // =========================
  private loadSuggestionsHTTP(params?: any): Observable<AiSuggestion[]> {

    if (!this.isAuthenticated || this.iaBlocked) return of([]);

    const defaultParams = {
      hour: new Date().getHours(),
      temperature: 20,
      is_daylight: 0,
      is_holiday: 0,
      is_weekend: 0,
      day_type: 'workday',
    };

    const resolvedParams = params ?? defaultParams;

    return forkJoin({
      pieces: this.getPieces().pipe(catchError(() => of([]))),
      predictions: this.testPrediction(resolvedParams).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ pieces, predictions }) => {
        if (!predictions?.suggestions?.length) return [];
        return this.mapNotifications(predictions.suggestions, pieces as Piece[]);
      })
    );
  }

  // =========================
  // API
  // =========================
  getPieces(): Observable<Piece[]> {
    if (!this.isAuthenticated) return of([]);

    return this.http.get<Piece[]>(`${this.apiUrl}/pieces`, {
      headers: this.getHeaders(),
    });
  }

  testPrediction(params: any): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/predict/test`, {
      params: params as any,
    });
  }

  sendFeedback(payload: FeedbackPayload): Observable<any> {
    return this.http.post(`${this.aiUrl}/feedback`, null, {
      params: {
        equipment: payload.equipment,
        confirmed: String(payload.confirmed),
        day_type: payload.day_type,
      },
    });
  }

  sendBatchFeedback(payload: any): Observable<any> {
    return this.http.post(`${this.aiUrl}/feedback/batch`, payload);
  }

  allumerEquipement(id: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/equipement/${id}/etat`,
      { etat: 'On' },
      { headers: this.getHeaders() }
    );
  }

  saveMissedNotif(userId: string, notif: MissedNotification): Observable<any> {
    return this.http.post(`${this.aiUrl}/notifications/missed`, { userId, notif });
  }

  getMissedNotifs(userId: string): Observable<any> {
    return this.http.get(`${this.aiUrl}/notifications/missed/${userId}`);
  }

  deleteMissedNotif(userId: string, equipementId: number): Observable<any> {
    return this.http.delete(`${this.aiUrl}/notifications/missed/${userId}/${equipementId}`);
  }

  // =========================
  // RESET
  // =========================
  resetService(): void {
    this.closePanelSubject.next();
    this.wsStarted = false;
    this.wsConnected = false;
    this.wsParams = null;
    this.ws?.close();
    clearTimeout(this.reconnectTimer);
    this.stopPollingFallback();
    this.suggestionsSubject.next([]);
    this.missedCountSubject.next(0);
    this.dismissed.clear();
  }

  // =========================
  // MAPPING
  // =========================
  private mapNotifications(notifications: any[], pieces: Piece[]): AiSuggestion[] {

    const TYPE_TO_MODEL: Record<string, string> = {
      Lampe: 'Lumiere_ON',
      Climatiseur: 'Clim_ON',
      Chauffage: 'Chauffage_ON',
    };

    const MODEL_TO_ICON: Record<string, string> = {
      Lumiere_ON: 'lightbulb',
      Clim_ON: 'ac_unit',
      Chauffage_ON: 'thermostat',
    };

    const confidenceMap: Record<string, number> = {};
    const predictedON = new Set<string>();

    notifications.forEach(n => {
      predictedON.add(n.equipment);
      confidenceMap[n.equipment] = n.confidence ?? 0;
    });

    const suggestions: AiSuggestion[] = [];

    pieces.forEach(piece => {
      piece.equipements.forEach(eq => {

        const model = TYPE_TO_MODEL[eq.typeNom];

        if (
          model &&
          predictedON.has(model) &&
          eq.etat?.toLowerCase() === 'off'
        ) {
          suggestions.push({
            equipementId: eq.id,
            equipment: model,
            nom: eq.nom,
            piece: piece.nom,
            pieceId: piece.id,
            confidence: confidenceMap[model] ?? 0,
           message: `AI.SUGGESTION_MSG:${eq.nom}:${piece.nom}`,
            icon: MODEL_TO_ICON[model] ?? 'power',
          });
        }
      });
    });

    return suggestions;
  }
}