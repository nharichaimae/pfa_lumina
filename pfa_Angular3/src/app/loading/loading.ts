// loading.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../services/loading';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="loading$ | async" class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['./loading.scss'],
  standalone: true,
  imports: [CommonModule] // async pipe & *ngIf
})
export class LoadingComponent {
  loading$ = this.loadingService.loading$;
  constructor(private loadingService: LoadingService) {}
}