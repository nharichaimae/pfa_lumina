import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ConditionService } from '../../services/condition.service';
import { RegleService } from '../../services/regle.service';
import { Condition, Regle } from '../../Models/models';

@Component({
  selector: 'app-condition-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './condition-form.component.html',
  styleUrls: ['./condition-form.component.css']
})
export class ConditionFormComponent implements OnInit, OnDestroy {

  idEquipement = 0;
  nomEquipement = '';
  typeEquipement = '';

  isOnOff = true;
  isNombre = false;
  valeurOnOff = 'ON';

  historique: Condition[] = [];
  loadingCondition = false;
  loadingHistorique = false;
  successCondition = '';
  errorCondition = '';

  dateRegle: string | null = new Date().toISOString().split('T')[0];
  heureDebut = '08:00';
  heureFin = '22:00';
  regles: Regle[] = [];
  loadingRegle = false;
  loadingRegles = false;
  successRegle = '';
  errorRegle = '';
  chaqueJour = false;

  currentTime = '';
  currentDate = '';
  private timer: any;

  activeTab: 'condition' | 'regle' = 'regle';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private conditionService: ConditionService,
    private regleService: RegleService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const rawId = String(params['id'] ?? '').replace(/\D.*/, '');
      this.idEquipement = parseInt(rawId, 10);

      this.nomEquipement = params['nom'] || '';
      this.typeEquipement = params['type'] || '';

      this.loadHistorique();
      this.loadRegles();
    });

    this.startClock();

    this.translate.onLangChange.subscribe(() => {
      this.updateTime();
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  startClock(): void {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  updateTime(): void {
    const now = new Date();

    const lang = this.translate.currentLang || this.translate.defaultLang || 'fr';

    this.currentTime = now.toLocaleTimeString(lang, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.currentDate = now.toLocaleDateString(lang, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  loadHistorique(): void {
    if (!this.idEquipement) return;

    this.loadingHistorique = true;

    this.conditionService.getByEquipement(this.idEquipement).subscribe({
      next: (data) => {
        this.historique = data;
        this.loadingHistorique = false;
      },
      error: () => {
        this.loadingHistorique = false;
      }
    });
  }

  getValeur(): string {
    return this.valeurOnOff;
  }

  submitCondition(): void {
    const valeur = this.getValeur();

    this.loadingCondition = true;
    this.successCondition = '';
    this.errorCondition = '';

    this.conditionService.create({
      idEquipement: this.idEquipement,
      nomEquipement: this.nomEquipement,
      valeur: valeur,
      dateHeure: new Date().toISOString()
    }).subscribe({
      next: () => {
        this.translate.get('CONDITION.SUCCESS', { value: valeur }).subscribe(msg => {
          this.successCondition = msg;
        });

        this.loadingCondition = false;
        this.loadHistorique();
      },
      error: () => {
        this.translate.get('CONDITION.ERROR_CREATE').subscribe(msg => {
          this.errorCondition = msg;
        });

        this.loadingCondition = false;
      }
    });
  }

  deleteCondition(id: number): void {
    this.conditionService.delete(id).subscribe({
      next: () => this.loadHistorique(),
      error: () => {
        this.translate.get('CONDITION.ERROR_DELETE').subscribe(msg => {
          this.errorCondition = msg;
        });
      }
    });
  }

  loadRegles(): void {
    if (!this.idEquipement) return;

    this.loadingRegles = true;

    this.regleService.getByEquipement(this.idEquipement).subscribe({
      next: (data) => {
        this.regles = data;
        this.loadingRegles = false;
      },
      error: () => {
        this.loadingRegles = false;
      }
    });
  }

  onChaqueJourChange(): void {
    this.dateRegle = this.chaqueJour ? null : new Date().toISOString().split('T')[0];
  }

  submitRegle(): void {
    if (!this.heureDebut || !this.heureFin) {
      this.translate.get('REGLE.FILL_FIELDS').subscribe(msg => {
        this.errorRegle = msg;
      });
      return;
    }

    if (!this.chaqueJour && !this.dateRegle) {
      this.translate.get('REGLE.SELECT_DATE').subscribe(msg => {
        this.errorRegle = msg;
      });
      return;
    }

    this.loadingRegle = true;
    this.successRegle = '';
    this.errorRegle = '';

    this.regleService.create({
      dateRegle: this.chaqueJour ? null : this.dateRegle,
      heureDebut: this.heureDebut,
      heureFin: this.heureFin,
      idEquipement: this.idEquipement,
      chaqueJour: this.chaqueJour
    }).subscribe({
      next: () => {
        this.translate.get('REGLE.SUCCESS', {
          start: this.heureDebut,
          end: this.heureFin
        }).subscribe(msg => {
          this.successRegle = msg;
        });

        this.loadingRegle = false;
        this.chaqueJour = false;
        this.dateRegle = new Date().toISOString().split('T')[0];
        this.loadRegles();
      },
      error: () => {
        this.translate.get('REGLE.ERROR_CREATE').subscribe(msg => {
          this.errorRegle = msg;
        });

        this.loadingRegle = false;
      }
    });
  }

  deleteRegle(id: number): void {
    this.regleService.delete(id).subscribe({
      next: () => this.loadRegles(),
      error: () => {
        this.translate.get('REGLE.ERROR_DELETE').subscribe(msg => {
          this.errorRegle = msg;
        });
      }
    });
  }

  getIcon(): string {
    const t = this.typeEquipement.toLowerCase();

    if (t === 'lampe') return '💡';
    if (t === 'clime') return '❄️';
    if (t === 'chauffage') return '🔥';
    if (t === 'television') return '📺';

    return '🔌';
  }

  formatDate(dateStr: string): string {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return new Date(dateStr).toLocaleString(lang);
  }

  formatDateShort(dateStr: string | null): string {
    if (!dateStr) return '';

    const lang = this.translate.currentLang || this.translate.defaultLang || 'fr';
    return new Date(dateStr).toLocaleDateString(lang);
  }

  goBack(): void {
    this.router.navigate(['/smarthouse']);
  }
}