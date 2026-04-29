import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private requestCount = 0;
  private showTimeout: any = null;

  show(): void {
    this.requestCount++;

    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }

    this.showTimeout = setTimeout(() => {
      if (this.requestCount > 0) {
        this.loadingSubject.next(true);
      }
    }, 200);
  }

  hide(): void {
    if (this.requestCount > 0) {
      this.requestCount--;
    }

    if (this.requestCount === 0) {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
      this.loadingSubject.next(false);
    }
  }

  reset(): void {
    this.requestCount = 0;

    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    this.loadingSubject.next(false);
  }
}