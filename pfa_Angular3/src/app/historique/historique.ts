import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { PaiementService, PaiementDTO} from '../services/paiement.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './historique.html',
  styleUrls: ['./historique.scss']
})
export class HistoriqueComponent implements OnInit {

  userId = 0;
  paiements: PaiementDTO[] = [];
  loading = false;
  errorMsg = '';

  constructor(
    private paiementService: PaiementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    this.userId = storedId ? Number(storedId) : 0;

    if (!this.userId) {
      this.errorMsg = "Impossible de récupérer l'id du client";
      return;
    }

    this.loadHistorique();
  }

  loadHistorique(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges(); // ✅ force refresh

    this.paiementService.getHistoriqueClient(this.userId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); // ✅ force refresh
      }))
      .subscribe({
        next: (data: PaiementDTO[]) => {
          this.paiements = data;
          this.cdr.detectChanges(); // ✅ force refresh
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Erreur lors du chargement';
          this.cdr.detectChanges(); // ✅ force refresh
        }
      });
  }
}