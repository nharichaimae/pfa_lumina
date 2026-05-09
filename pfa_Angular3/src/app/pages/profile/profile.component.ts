import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../services/client';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-profile',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  client$ = this.clientService.client$;
  loading$ = this.clientService.loading$;

  private clientId!: number;

  constructor(
    private clientService: ClientService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      console.error('Utilisateur non connecté');
      return;
    }

    const id = this.authService.getUserId();

    if (!id) {
      console.error('ID utilisateur non trouvé dans le token');
      return;
    }

    this.clientId = id;
    this.clientService.loadClient(this.clientId);
  }
}