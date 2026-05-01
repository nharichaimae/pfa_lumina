import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AdminProfileApi } from '../services/admin-profile.api';
import { AdminReadDto } from '../dto/admin/admin-read.dto';
import { AdminUpdateDto } from '../dto/admin/admin-update.dto';

@Injectable({ providedIn: 'root' })
export class AdminProfileFacade {
  private _profile$ = new BehaviorSubject<AdminReadDto | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _error$ = new BehaviorSubject<string | null>(null);

  profile$ = this._profile$.asObservable();
  loading$ = this._loading$.asObservable();
  error$ = this._error$.asObservable();

  constructor(private api: AdminProfileApi) {}

  loadProfile(id: number): void {
    this._loading$.next(true);
    this._error$.next(null);

    this.api
      .getProfile(id)
      .pipe(
        tap((p) => this._profile$.next(p)),
        catchError((err) => {
          this._error$.next('Impossible de charger le profil.');
          console.error('GET profile error:', err);
          return EMPTY;
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }

  updateProfile(id: number, dto: AdminUpdateDto, onSuccess?: () => void): void {
    this._loading$.next(true);
    this._error$.next(null);

    this.api
      .updateProfile(id, dto)
      .pipe(
        tap((res) => this._profile$.next(res.admin)),
        tap(() => onSuccess?.()),
        catchError((err) => {
          this._error$.next('Impossible de mettre à jour le profil.');
          console.error('PUT profile error:', err);
          return EMPTY;
        }),
        finalize(() => this._loading$.next(false))
      )
      .subscribe();
  }
}
