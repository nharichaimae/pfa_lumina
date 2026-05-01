import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class SearchService {

  private searchSource = new BehaviorSubject<string>('');
  search$ = this.searchSource.asObservable();

  setSearch(text: string) {
    this.searchSource.next(text);
  }

  clearSearch() {
    this.searchSource.next('');
  }
}
