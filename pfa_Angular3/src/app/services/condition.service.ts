import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Condition, ConditionCreate } from '../Models/models';

@Injectable({ providedIn: 'root' })
export class ConditionService {
    // URL de l’API backend (.NET)
  private apiUrl = 'http://localhost:5297/api/conditions';

  constructor(private http: HttpClient) {}
 //Récupérer toutes les conditions
  getAll(): Observable<Condition[]> {
    return this.http.get<Condition[]>(this.apiUrl);
  }
//Récupérer les conditions d’un équipement spécifique
  getByEquipement(idEquipement: number): Observable<Condition[]> {
    return this.http.get<Condition[]>(`${this.apiUrl}/equipement/${idEquipement}`);
  }
  // Créer une nouvelle condition

  create(condition: ConditionCreate): Observable<Condition> {
    return this.http.post<Condition>(this.apiUrl, condition);
  }
// Supprimer une condition
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}