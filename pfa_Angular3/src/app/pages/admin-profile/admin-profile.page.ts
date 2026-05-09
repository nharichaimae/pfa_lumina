import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminProfileFacade } from '../../facades/admin-profile.facade';
import { AuthService } from '../../services/auth';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-admin-profile-page',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss']
})
export class AdminProfilePage implements OnInit {
  loading$ = this.facade.loading$;
  profile$ = this.facade.profile$;
  error$ = this.facade.error$;

  constructor(
    private facade: AdminProfileFacade,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const adminId = this.authService.getUserId();

    if (!adminId) {
      this.authService.logout();
      return;
    }

    this.facade.loadProfile(adminId);
  }

  goEdit(): void {
    this.router.navigate(['/admin-profile-edit']);
  }
}