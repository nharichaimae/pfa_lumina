// angular import
import { Component, inject, OnInit } from '@angular/core';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-nav-right',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent implements OnInit {

  userNom: string = '';
  userPrenom: string = '';

  private authService = inject(AuthService);

  constructor() {
    const config = inject(NgbDropdownConfig);
    config.placement = 'bottom-right';
  }
ngOnInit(): void {
  this.userNom = this.authService.getNom() || '';
  this.userPrenom = this.authService.getPrenom() || '';
}
}
