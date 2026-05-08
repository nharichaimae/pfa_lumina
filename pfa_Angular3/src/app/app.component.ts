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

// 1. Importe ton service de traduction
import { MyTranslateService } from './services/translate.service'; 

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
  // 2. Injecte ton service ici
  private myTranslateService = inject(MyTranslateService); 

  title = 'datta-able';

  ngOnInit() {
    // 3. Initialise les langues dès que le composant racine est chargé
    this.myTranslateService.initLanguage();

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }
}