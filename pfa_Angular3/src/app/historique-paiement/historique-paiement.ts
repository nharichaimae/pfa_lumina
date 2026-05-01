import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementService } from '../services/paiement.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule],   
  templateUrl: './historique-paiement.html',
  styleUrls: ['./historique-paiement.scss']
})
export class HistoriqueComponent implements OnInit {

  historique: any[] = [];

  constructor(
    private paiementService: PaiementService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadHistorique();
  }

  // 🔄 charger les données
  loadHistorique() {
    this.paiementService.getHistorique().subscribe({
      next: (data) => {
        console.log(data);
        this.historique = data;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // 🔴 Bloquer
  bloquer(userId: number) {
    if (confirm("Bloquer cet utilisateur ?")) {
      this.paiementService.bloquerUser(userId).subscribe({
        next: () => {
          this.loadHistorique(); // refresh
        },
        error: (err) => console.error(err)
      });
    }
  }

  // 🟢 Débloquer
  debloquer(userId: number) {
    if (confirm("Débloquer cet utilisateur ?")) {
      this.paiementService.debloquerUser(userId).subscribe({
        next: () => {
          this.loadHistorique(); // refresh
        },
        error: (err) => console.error(err)
      });
    }
  }

}