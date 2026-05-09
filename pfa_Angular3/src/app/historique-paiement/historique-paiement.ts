import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementService } from '../services/paiement.service';
import { ChangeDetectorRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './historique-paiement.html',
  styleUrls: ['./historique-paiement.scss']
})
export class HistoriqueComponent implements OnInit {

  historique: any[] = [];

  constructor(
    private paiementService: PaiementService,
    private cd: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadHistorique();
  }

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

  bloquer(userId: number) {
    if (confirm(this.translate.instant('ADMIN_PAYMENT_HISTORY.CONFIRM_BLOCK'))) {
      this.paiementService.bloquerUser(userId).subscribe({
        next: () => {
          this.loadHistorique();
        },
        error: (err) => console.error(err)
      });
    }
  }

  debloquer(userId: number) {
    if (confirm(this.translate.instant('ADMIN_PAYMENT_HISTORY.CONFIRM_UNBLOCK'))) {
      this.paiementService.debloquerUser(userId).subscribe({
        next: () => {
          this.loadHistorique();
        },
        error: (err) => console.error(err)
      });
    }
  }

}