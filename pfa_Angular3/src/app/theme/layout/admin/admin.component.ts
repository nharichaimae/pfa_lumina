import { Component, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SimpleNavComponent } from './simple-nav/simple-nav';
import { RouterOutlet } from '@angular/router';
import { NavSearchComponent } from './nav-bar/nav-left/nav-search/nav-search.component';
import screenfull from 'screenfull';
import { CommonModule } from '@angular/common';
import { NavRightComponent } from './nav-bar/nav-right/nav-right.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    SimpleNavComponent,
    RouterOutlet,
    NavSearchComponent,
    CommonModule,
    NavRightComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild(SimpleNavComponent) sidebar!: SimpleNavComponent;

  isScrolled = false;
  screenFull = false;
  fullPage = false;

  @HostListener('window:scroll', [])
  onScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  toggleSidebar() {
  if (window.innerWidth > 992) {
    this.fullPage = !this.fullPage;
  } else {
    if (this.sidebar) {
      this.sidebar.toggleNav();
    }
  }
}

  private screenfullHandler = () => {
    this.screenFull = screenfull.isFullscreen;
  };

  ngOnInit() {
    if (screenfull.isEnabled) {
      this.screenFull = screenfull.isFullscreen;
      screenfull.on('change', this.screenfullHandler);
    }
  }

  ngOnDestroy() {
    if (screenfull.isEnabled) {
      screenfull.off('change', this.screenfullHandler);
    }
  }

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  }
}