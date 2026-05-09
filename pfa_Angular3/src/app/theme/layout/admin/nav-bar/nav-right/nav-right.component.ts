import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth';
import { CommonModule } from '@angular/common';
import { AiNotificationService } from 'src/app/ai-notification/ai-notification.service';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule, CommonModule, TranslateModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit, OnDestroy {
  userNom: string = '';
  userPrenom: string = '';
  missedCount = 0;
  showUser = false;

  private authService = inject(AuthService);
  private aiService = inject(AiNotificationService);
  private translate = inject(TranslateService);
  private subscription = new Subscription();

  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }

  ngOnInit(): void {
    this.userNom = this.authService.getNom() || '';
    this.userPrenom = this.authService.getPrenom() || '';

    const savedLang = localStorage.getItem('lang') || 'fr';
    this.translate.setDefaultLang('fr');
    this.translate.use(savedLang);

    const userId = localStorage.getItem('userId') ?? localStorage.getItem('id') ?? 'guest';

    this.aiService.getMissedNotifs(userId).subscribe({
      next: res => {
        this.aiService.updateMissedCount((res.missed ?? []).length);
      },
      error: () => {}
    });

    this.subscription.add(
      this.aiService.missedCount$.subscribe(count => {
        this.missedCount = count;
      })
    );
  }

  changeLanguage(lang: string): void {
  console.log('LANG CLICKED:', lang);

  localStorage.setItem('lang', lang);

  this.translate.use(lang).subscribe({
    next: () => {
      console.log('LANG CHANGED TO:', lang);
    },
    error: (err) => {
      console.error('TRANSLATE ERROR:', err);
    }
  });
}

  onBellClick(): void {
    this.aiService.togglePanel();
  }

  toggleUser(): void {
    this.showUser = !this.showUser;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isClient(): boolean {
    const role = localStorage.getItem('role') || '';
    return role.toUpperCase() === 'CLIENT';
  }
}