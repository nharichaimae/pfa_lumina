import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConditionService } from '../../services/condition.service';
import { RegleService } from '../../services/regle.service';
import { Condition, Regle } from '../../Models/models';

@Component({
  selector: 'app-condition-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    private regleService: RegleService
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
    this.currentTime = now.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    this.currentDate = now.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  loadHistorique(): void {
    if (!this.idEquipement) return;
    this.loadingHistorique = true;
    this.conditionService.getByEquipement(this.idEquipement).subscribe({
      next: (data) => { this.historique = data; this.loadingHistorique = false; },
      error: ()     => { this.loadingHistorique = false; }
    });
  }

  getValeur(): string {
    return this.valeurOnOff;
  }

  submitCondition(): void {
    const valeur = this.getValeur();
    this.loadingCondition = true;
    this.successCondition = '';
    this.errorCondition   = '';
    this.conditionService.create({
      idEquipement:  this.idEquipement,
      nomEquipement: this.nomEquipement,
      valeur:        valeur,
      dateHeure:     new Date().toISOString()
    }).subscribe({
      next: () => {
        this.successCondition = `✅ Condition "${valeur}" appliquée avec succès !`;
        this.loadingCondition = false;
        this.loadHistorique();
      },
      error: () => {
        this.errorCondition  = 'Erreur lors de l\'application de la condition';
        this.loadingCondition = false;
      }
    });
  }

  deleteCondition(id: number): void {
    this.conditionService.delete(id).subscribe({
      next:  () => this.loadHistorique(),
      error: () => this.errorCondition = 'Erreur lors de la suppression'
    });
  }

  loadRegles(): void {
    if (!this.idEquipement) return;
    this.loadingRegles = true;
    this.regleService.getByEquipement(this.idEquipement).subscribe({
      next: (data) => { this.regles = data; this.loadingRegles = false; },
      error: ()     => { this.loadingRegles = false; }
    });
  }

  onChaqueJourChange(): void {
    this.dateRegle = this.chaqueJour ? null : new Date().toISOString().split('T')[0];
  }

  submitRegle(): void {
    if (!this.heureDebut || !this.heureFin) {
      this.errorRegle = 'Veuillez remplir tous les champs'; return;
    }
    if (!this.chaqueJour && !this.dateRegle) {
      this.errorRegle = 'Veuillez sélectionner une date'; return;
    }

    this.loadingRegle = true;
    this.successRegle = '';
    this.errorRegle   = '';

    this.regleService.create({
      dateRegle:    this.chaqueJour ? null : this.dateRegle,
      heureDebut:   this.heureDebut,
      heureFin:     this.heureFin,
      idEquipement: this.idEquipement,
      chaqueJour:   this.chaqueJour
    }).subscribe({
      next: () => {
        this.successRegle = `✅ Règle créée : 🟢 ${this.heureDebut} → 🔴 ${this.heureFin}`;
        this.loadingRegle = false;
        this.chaqueJour = false;
        this.dateRegle = new Date().toISOString().split('T')[0];
        this.loadRegles();
      },
      error: () => {
        this.errorRegle  = 'Erreur lors de la création de la règle';
        this.loadingRegle = false;
      }
    });
  }

  deleteRegle(id: number): void {
    this.regleService.delete(id).subscribe({
      next:  () => this.loadRegles(),
      error: () => this.errorRegle = 'Erreur lors de la suppression'
    });
  }

  getIcon(): string {
    const t = this.typeEquipement.toLowerCase();
    if (t === 'lampe')      return '💡';
    if (t === 'clime')      return '❄️';
    if (t === 'chauffage')  return '🔥';
    if (t === 'television') return '📺';
    return '🔌';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('fr-FR');
  }

  formatDateShort(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  goBack(): void {
    this.router.navigate(['/smarthouse']);
  }
}