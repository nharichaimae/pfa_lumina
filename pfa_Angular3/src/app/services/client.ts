import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = 'http://localhost:8000/api/client';

  private clientSubject = new BehaviorSubject<any | null>(null);
  client$ = this.clientSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Méthode pour générer les headers avec token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token'); // ou sessionStorage
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Charger un client
  loadClient(id: number): void {
    this.loadingSubject.next(true);

    this.http.get<any>(`${this.API_URL}/profil/${id}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          const client = res.data ?? res;
          this.clientSubject.next(client);
          this.loadingSubject.next(false);
        },
        error: (err) => {
          console.error('Erreur API', err);
          this.clientSubject.next(null);
          this.loadingSubject.next(false);
        }
      });
  }

  // Mettre à jour un client
  updateClient(id: number, payload: any) {
    return this.http.put(`${this.API_URL}/profil/${id}`, payload, { headers: this.getAuthHeaders() });
  }

  get currentClient() {
    return this.clientSubject.value;
  }
}
