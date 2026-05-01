import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Regle, RegleCreate } from '../Models/models';

@Injectable({ providedIn: 'root' })
export class RegleService {
  private apiUrl = 'http://localhost:5297/api/regles';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Regle[]> {
    return this.http.get<Regle[]>(this.apiUrl);
  }

  getByEquipement(idEquipement: number): Observable<Regle[]> {
    return this.http.get<Regle[]>(`${this.apiUrl}/equipement/${idEquipement}`);
  }

  create(regle: RegleCreate): Observable<Regle> {
    return this.http.post<Regle>(this.apiUrl, regle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}