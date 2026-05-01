import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  peopleOutline,
  personOutline,
  cardOutline,
  gridOutline,
  timeOutline,
  albumsOutline,
  logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-simple-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, IonicModule],
  templateUrl: './simple-nav.html',
  styleUrls: ['./simple-nav.scss']
})
export class SimpleNavComponent {
  role: 'ADMIN' | 'CLIENT' | null = null;
  isOpen = true;
  isMobile = false;

  constructor(private router: Router) {
    this.role = localStorage.getItem('role') as 'ADMIN' | 'CLIENT';
    this.checkScreen();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }

  checkScreen() {
    this.isMobile = window.innerWidth <= 992;

    if (this.isMobile) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
    }
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
/*
 logout(): void {
  localStorage.clear();
  this.router.navigate(['/login']).then(() => {
    window.location.reload();
  });
}*/

}