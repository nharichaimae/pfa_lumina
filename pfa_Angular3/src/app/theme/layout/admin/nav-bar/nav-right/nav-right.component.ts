import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth';
import { CommonModule } from '@angular/common';
import { AiNotificationService } from 'src/app/ai-notification/ai-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector:    'app-nav-right',
  standalone:  true,
  imports:     [SharedModule, CommonModule],
  templateUrl: './nav-right.component.html',
  styleUrls:   ['./nav-right.component.scss'],
  providers:   [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {

  userNom:    string = '';
  userPrenom: string = '';
  missedCount = 0;

  private authService  = inject(AuthService);
  private aiService    = inject(AiNotificationService);
  private subscription = new Subscription();

  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
  this.userNom    = this.authService.getNom()    || '';
  this.userPrenom = this.authService.getPrenom() || '';

  // 👈 Charger le count dès la navbar
  const userId = localStorage.getItem('userId') ?? localStorage.getItem('id') ?? 'guest';
  this.aiService.getMissedNotifs(userId).subscribe({
    next: res => {
      this.aiService.updateMissedCount((res.missed ?? []).length);
    },
    error: () => {}
  });

  // Écouter le count des notifs manquées
  this.subscription.add(
    this.aiService.missedCount$.subscribe(count => {
      this.missedCount = count;
    })
  );
}

  // Clic sur la cloche 
  onBellClick(): void {
    this.aiService.togglePanel();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isClient(): boolean {
  const role = localStorage.getItem('role') || '';
  return role.toUpperCase() === 'CLIENT';
}
}