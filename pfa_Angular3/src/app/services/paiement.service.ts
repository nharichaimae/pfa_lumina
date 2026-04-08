import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaiementDTO {
  id: number;
  montant: number;
  datePaiement: string;
  statut: string;
  abonnementId: number;
  userId: number;
  blocked: boolean; // ✅ indique si l'utilisateur est bloqué
}

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private apiUrl = 'http://localhost:8080/api'; 
  private baseUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  // 🔹 Historique pour l'admin avec blocked
  getHistorique(): Observable<PaiementDTO[]> {
    const token = localStorage.getItem('token'); 

    return this.http.get<PaiementDTO[]>(`${this.apiUrl}/admin/historique`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // 🔹 Historique pour un client
  getHistoriqueClient(userId: number): Observable<PaiementDTO[]> {
    return this.http.get<PaiementDTO[]>(`${this.baseUrl}/${userId}/paiements`);
  }

  bloquerUser(userId: number): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put(`${this.apiUrl}/admin/bloquer/${userId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

debloquerUser(userId: number): Observable<any> {
  const token = localStorage.getItem('token');

  return this.http.put(`${this.apiUrl}/admin/debloquer/${userId}`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

}