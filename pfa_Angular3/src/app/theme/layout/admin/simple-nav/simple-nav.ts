import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { MyTranslateService } from '../../../../services/translate.service';
@Component({
  selector: 'app-simple-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule, TranslateModule],
  templateUrl: './simple-nav.html',
  styleUrls: ['./simple-nav.scss']
})
export class SimpleNavComponent {

  // ✅ i18n
  private translateService = inject(MyTranslateService);
  translate = this.translateService.translate;

  // ✅ logique existante
  role: 'ADMIN' | 'CLIENT' | null = null;
  isOpen = true;
  isMobile = false;

  constructor(private router: Router) {
    this.role = localStorage.getItem('role') as 'ADMIN' | 'CLIENT';
    this.checkScreen();
  }

  ngOnInit() {
    // ✅ important pour charger la langue
    this.translateService.initLanguage();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }

  checkScreen() {
    this.isMobile = window.innerWidth <= 992;
    this.isOpen = !this.isMobile;
  }

  toggleNav() {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
    }
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isClient(): boolean {
    return this.role === 'CLIENT';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }
}