import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegleService } from '../../services/regle.service';
import { Regle } from '../../Models/models';


@Component({
  selector: 'app-regle-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './regle-form.component.html',
  styleUrls: ['./regle-form.component.css']
})
export class RegleFormComponent implements OnInit, OnDestroy {

  idEquipement = 0;
  nomEquipement = '';
  typeEquipement = '';

  dateRegle: string | null = new Date().toISOString().split('T')[0];
  heureDebut = '08:00';
  heureFin = '22:00';
  chaqueJour = false;

  regles: Regle[] = [];
  loading = false;
  loadingRegles = false;
  success = '';
  error = '';

  currentTime = '';
  currentDate = '';
  private timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private regleService: RegleService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const rawId = String(params['id'] ?? '').replace(/\D.*/, '');
      this.idEquipement = parseInt(rawId, 10);
      if (!this.idEquipement || isNaN(this.idEquipement)) {
        this.error = 'Équipement introuvable';
        return;
      }
      this.nomEquipement = params['nom'] || '';
      this.typeEquipement = params['type'] || '';
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

  onSubmit(): void {
    if (!this.heureDebut || !this.heureFin) {
      this.error = 'Veuillez remplir tous les champs'; return;
    }
    if (!this.chaqueJour && !this.dateRegle) {
      this.error = 'Veuillez sélectionner une date'; return;
    }
    if (this.heureDebut >= this.heureFin) {
      this.error = 'L\'heure de fin doit être après l\'heure de début'; return;
    }

    this.loading = true;
    this.success = '';
    this.error   = '';

    this.regleService.create({
      dateRegle:    this.chaqueJour ? null : this.dateRegle,
      heureDebut:   this.heureDebut,
      heureFin:     this.heureFin,
      idEquipement: this.idEquipement,
      chaqueJour:   this.chaqueJour
    }).subscribe({
      next: () => {
        this.success = `✅ Règle créée : 🟢 ${this.heureDebut} → 🔴 ${this.heureFin}`;
        this.loading = false;
        this.chaqueJour = false;
        this.dateRegle = new Date().toISOString().split('T')[0];
        this.loadRegles();
      },
      error: () => {
        this.error = 'Erreur lors de la création de la règle';
        this.loading = false;
      }
    });
  }

  deleteRegle(id: number): void {
    this.regleService.delete(id).subscribe({
      next:  () => { this.regles = this.regles.filter(r => r.idRegle !== id); },
      error: () => { this.error = 'Erreur lors de la suppression'; }
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

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Chaque jour';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}