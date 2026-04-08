import { Component, OnInit, inject } from '@angular/core';
import {
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
  Router,
  RouterModule,
  RouterOutlet
} from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { LoadingService } from './services/loading';
import { LoadingComponent } from './loading/loading';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SpinnerComponent, RouterModule, RouterOutlet, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private loadingService = inject(LoadingService); 

  title = 'datta-able';

  ngOnInit() {
    this.router.events.subscribe((evt) => {

      // ✅ spinner start
      if (evt instanceof NavigationStart) {
        this.loadingService.show();
      }
      if (evt instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }

      // ✅ spinner stop
      if (
        evt instanceof NavigationEnd ||
        evt instanceof NavigationCancel ||
        evt instanceof NavigationError
      ) {
        this.loadingService.hide();
      }

    });
  }
}