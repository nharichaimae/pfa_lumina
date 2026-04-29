import { Component, OnInit, inject } from '@angular/core';
import {
  NavigationEnd,
  Router,
  RouterModule,
  RouterOutlet
} from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LoadingComponent } from './loading/loading';
import { AiNotificationComponent } from './ai-notification/ai-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonicModule,
    RouterModule,
    RouterOutlet,
    LoadingComponent,
    AiNotificationComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  title = 'datta-able';

  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }
}