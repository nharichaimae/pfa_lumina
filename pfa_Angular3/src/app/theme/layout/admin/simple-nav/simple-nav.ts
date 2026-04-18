import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AiNotificationService } from 'src/app/ai-notification/ai-notification.service';

@Component({
  selector: 'app-simple-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './simple-nav.html',
  styleUrls: ['./simple-nav.scss']
})
export class SimpleNavComponent {

  role: 'ADMIN' | 'CLIENT' | null = null;

  /*constructor(private router: Router) {
    this.role = localStorage.getItem('role') as 'ADMIN' | 'CLIENT';
  }*/

    constructor(
    private router: Router,
    private aiService: AiNotificationService  
  ) {
    const raw = localStorage.getItem('role') || '';
    this.role = raw.toUpperCase() as 'ADMIN' | 'CLIENT';
  }

  isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  isClient(): boolean {
    return this.role === 'CLIENT';
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
