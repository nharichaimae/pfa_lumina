import {
  Component, OnInit, OnDestroy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AiNotificationService, AiSuggestion, MissedNotification,
} from './ai-notification.service';
import { filter, Subscription } from 'rxjs';

const CONFIDENCE_THRESHOLD = 0.70;
const COOLDOWN_MS           = 5 * 60 * 1000;

@Component({
  selector:    'app-ai-notification',
  standalone:  true,
  imports:     [CommonModule],
  templateUrl: './ai-notification.component.html',
  styleUrls:   ['./ai-notification.component.scss'],
})
export class AiNotificationComponent implements OnInit, OnDestroy {

  suggestions:     (AiSuggestion & { receivedAt: number; timeLeft: number })[] = [];
  missedNotifs:    MissedNotification[] = [];
  showMissedPanel = false;
  dismissingIds   = new Set<number>();

  private pendingActions: { equipment: string; confirmed: boolean }[] = [];
  private batchTimer:     any;
  private timerInterval:  any;
  private subscription  = new Subscription();
  private handledIds    = new Set<number>();

  private testParams = {
    hour: 10,
    temperature: 40,
    is_daylight: 1,
    is_holiday:  0,
    is_weekend:  0,
    day_type:    'workday',
  };

  private get userId(): string {
    return localStorage.getItem('userId') ?? 'guest';
  }

  constructor(
    private aiService: AiNotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.suggestions = [];

    this.handledIds = this.getHandledFromStorage();

    this.loadMissedFromServer();
    this.aiService.startWebSocket(this.testParams);

    const sub = this.aiService.suggestions$
      .pipe(filter(s => s.some(x => x.confidence > CONFIDENCE_THRESHOLD)))
      .subscribe(suggestions => {
        const handledMap = this.getHandledMap();
        const now        = Date.now();

        suggestions
          .filter(s => s.confidence > CONFIDENCE_THRESHOLD)
          .forEach((s, i) => {
            const alreadyHandled = this.handledIds.has(s.equipementId);
            const alreadyShowing = this.suggestions.find(x => x.equipementId === s.equipementId);
            const cooldownActive =
              handledMap[s.equipementId] &&
              (now - handledMap[s.equipementId]) < COOLDOWN_MS;

            if (!alreadyHandled && !alreadyShowing && !cooldownActive) {
              // offset de 2s par carte → 1ère expire T+10s, 2ème T+12s, etc.
              this.suggestions.push({ ...s, receivedAt: now + i * 2_000, timeLeft: 10 });
            }
          });

        this.cdr.detectChanges();
      });
    this.subscription.add(sub);

    this.subscription.add(
      this.aiService.panelToggle$.subscribe(() => {
        this.showMissedPanel = !this.showMissedPanel;
        this.cdr.detectChanges();
      })
    );

    this.timerInterval = setInterval(() => {
      const now = Date.now();

      this.suggestions.forEach(s => {
        const timeLeft = 10 - Math.floor((now - s.receivedAt) / 1000);
        if (timeLeft <= 0 && !this.handledIds.has(s.equipementId)) {
          this.handledIds.add(s.equipementId);
          this.saveHandledToStorage();
          this.storeMissedNotif(s);
          this.onIgnored(s);
        }
      });

      this.suggestions = this.suggestions
        .map(s => ({
          ...s,
          timeLeft: Math.max(0, 10 - Math.floor((now - s.receivedAt) / 1000)),
        }))
        .filter(s => s.timeLeft > 0);

      this.cdr.detectChanges();
    }, 1000);
  }

  // ─── Missed notifications ──────────────────────────────────────────────────

  private loadMissedFromServer(): void {
    this.aiService.getMissedNotifs(this.userId).subscribe({
      next: res => {
        this.missedNotifs = res.missed ?? [];
        this.aiService.updateMissedCount(this.missedNotifs.length);
        this.cdr.detectChanges();
      },
      error: () => { this.missedNotifs = []; },
    });
  }

  private storeMissedNotif(s: AiSuggestion): void {
    const exists = this.missedNotifs.find(m => m.equipementId === s.equipementId);
    if (exists) return;

    const missed: MissedNotification = {
      equipementId: s.equipementId,
      equipment:    s.equipment,
      nom:          s.nom,
      piece:        s.piece,
      icon:         s.icon,
      message:      s.message,
      confidence:   s.confidence,
      missedAt:     new Date().toISOString(),
    };

    this.aiService.saveMissedNotif(this.userId, missed).subscribe({
      next: () => {
        this.missedNotifs.push(missed);
        this.aiService.updateMissedCount(this.missedNotifs.length);
        this.cdr.detectChanges();
      },
    });
  }

  get missedCount(): number { return this.missedNotifs.length; }

  toggleMissedPanel(): void { this.showMissedPanel = !this.showMissedPanel; }

  confirmMissed(m: MissedNotification): void {
    this.aiService.allumerEquipement(m.equipementId).subscribe({
      next:  () => this.aiService.emitEquipementAllume(m.equipementId),
      error: err => console.error('Erreur allumage :', err),
    });

    this.aiService.deleteMissedNotif(this.userId, m.equipementId).subscribe();
    this.removeMissed(m.equipementId);

    const handledMap = this.getHandledMap();
    handledMap[m.equipementId] = Date.now();
    this.saveHandledMap(handledMap);

    this.pendingActions.push({ equipment: m.equipment, confirmed: true });
    this.scheduleBatchFeedback();
  }

  rejectMissed(m: MissedNotification): void {
    this.aiService.deleteMissedNotif(this.userId, m.equipementId).subscribe();
    this.removeMissed(m.equipementId);

    const handledMap = this.getHandledMap();
    handledMap[m.equipementId] = Date.now();
    this.saveHandledMap(handledMap);
  }

  private removeMissed(id: number): void {
    this.missedNotifs = this.missedNotifs.filter(m => m.equipementId !== id);
    this.aiService.updateMissedCount(this.missedNotifs.length);
    this.cdr.detectChanges();
  }

  formatMissedTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit',
    });
  }

  // ─── Active suggestions ────────────────────────────────────────────────────

  confirm(s: AiSuggestion): void {
    this.handledIds.add(s.equipementId);
    this.saveHandledToStorage();

    const handledMap = this.getHandledMap();
    handledMap[s.equipementId] = Date.now();
    this.saveHandledMap(handledMap);

    this.aiService.allumerEquipement(s.equipementId).subscribe({
      next:  () => this.aiService.emitEquipementAllume(s.equipementId),
      error: err => console.error('Erreur allumage :', err),
    });

    this.pendingActions.push({ equipment: s.equipment, confirmed: true });
    this.dismissSilent(s.equipementId.toString());
    this.scheduleBatchFeedback();
  }

  reject(s: AiSuggestion): void {
    this.handledIds.add(s.equipementId);
    this.saveHandledToStorage();

    const handledMap = this.getHandledMap();
    handledMap[s.equipementId] = Date.now();
    this.saveHandledMap(handledMap);

    this.dismissSilent(s.equipementId.toString());
  }

  private onIgnored(s: AiSuggestion): void {
    console.log(`${s.equipment} ignoré (timeout) → missed notif uniquement`);
  }

  dismiss(key: string): void { this.dismissSilent(key); }

  private dismissSilent(key: string): void {
    const id = Number(key);
    this.dismissingIds.add(id);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.aiService.dismissSuggestion(key);
      this.suggestions = this.suggestions.filter(
        s => s.equipementId.toString() !== key
      );
      this.dismissingIds.delete(id);
      this.cdr.detectChanges();
    }, 420);
  }

  // ─── Batch feedback ────────────────────────────────────────────────────────

  private scheduleBatchFeedback(): void {
    clearTimeout(this.batchTimer);
    this.batchTimer = setTimeout(() => this.sendBatchFeedback(), 9000);
  }

  private sendBatchFeedback(): void {
    const confirmedOnly = this.pendingActions.filter(a => a.confirmed === true);

    if (confirmedOnly.length === 0) {
      this.pendingActions = [];
      return;
    }

    const payload = {
      equipment_actions: confirmedOnly,
      temperature:       this.testParams.temperature,
      is_daylight:       this.testParams.is_daylight,
      day_type:          this.testParams.day_type,
    };

    this.aiService.sendBatchFeedback(payload).subscribe({
      next:  res => console.log('Batch envoyé :', res),
      error: err => console.error('Erreur batch :', err),
    });

    this.pendingActions = [];
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  formatTime(s: number): string { return `${s}s`; }

  getTimerPercent(timeLeft: number): string {
    return `${(timeLeft / 10) * 100}%`;
  }

  getConfidencePercent(c: number): string {
    return `${Math.round(c * 100)}%`;
  }

  getConfidenceClass(c: number): string {
    return c >= 0.85 ? 'high' : c >= 0.75 ? 'medium' : 'low';
  }

  trackBySuggestion(_: number, s: AiSuggestion): number {
    return s.equipementId;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    clearInterval(this.timerInterval);
    clearTimeout(this.batchTimer);
    this.aiService.resetService();
  }

  // ─── LocalStorage ──────────────────────────────────────────────────────────

  private getHandledFromStorage(): Set<number> {
    const map = this.getHandledMap();
    const now = Date.now();
    const valid = new Set<number>();

    Object.entries(map).forEach(([id, ts]) => {
      if ((now - (ts as number)) < COOLDOWN_MS) {
        valid.add(Number(id));
      }
    });

    const cleaned: Record<number, number> = {};
    Object.entries(map).forEach(([id, ts]) => {
      if ((now - (ts as number)) < COOLDOWN_MS) {
        cleaned[Number(id)] = ts as number;
      }
    });
    this.saveHandledMap(cleaned);

    return valid;
  }

  private saveHandledToStorage(): void {
    const map = this.getHandledMap();
    this.handledIds.forEach(id => {
      if (!map[id]) {
        map[id] = Date.now();
      }
    });
    this.saveHandledMap(map);
  }

  private getHandledMap(): Record<number, number> {
    return JSON.parse(localStorage.getItem('handledMap') || '{}');
  }

  private saveHandledMap(map: Record<number, number>): void {
    localStorage.setItem('handledMap', JSON.stringify(map));
  }
}