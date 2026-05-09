import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { PaiementService, PaiementDTO } from '../services/paiement.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, TranslateModule],
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
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    const storedId = localStorage.getItem('userId');
    this.userId = storedId ? Number(storedId) : 0;

    if (!this.userId) {
      this.errorMsg = this.translate.instant('PAYMENT_HISTORY.CLIENT_ID_ERROR');
      return;
    }

    this.loadHistorique();
  }

  loadHistorique(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.paiementService.getHistoriqueClient(this.userId)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: PaiementDTO[]) => {
          this.paiements = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = this.translate.instant('PAYMENT_HISTORY.LOAD_ERROR');
          this.cdr.detectChanges();
        }
      });
  }
}