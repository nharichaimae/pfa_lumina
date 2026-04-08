import { Component, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavRightComponent } from './nav-right/nav-right.component';
import { NavSearchComponent } from './nav-left/nav-search/nav-search.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,  
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    NavLeftComponent,
    NavSearchComponent, 
    NavRightComponent
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  readonly NavCollapsedMob = output();
  navCollapsedMob = false;
  headerStyle = '';
  menuClass = false;
  collapseStyle = 'block';

  toggleMobOption() {
    this.menuClass = !this.menuClass;
    this.headerStyle = this.menuClass ? 'none' : '';
    this.collapseStyle = this.menuClass ? 'block' : 'none';
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  closeMenu() {
    const nav = document.querySelector('app-navigation.pcoded-navbar');
    nav?.classList.remove('mob-open');
  }
}
