import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Type pour un client
export interface Client {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  cin: string;
  photoProfil?: string;
}


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://127.0.0.1:8000/clients  ';

  constructor(private http: HttpClient) {}

getAllClients(): Observable<Client[]> {
  return this.http.get<Client[]>(this.apiUrl);
}


 deleteClient(id: number): Observable<any> {
  return this.http.post(`http://127.0.0.1:8000/client/supprimer/${id}`,{});
}

 addClient(data: FormData) {
  return this.http.post(
    'http://127.0.0.1:8000/client/ajouter',
    data
  );
}
 getClientById(id: number): Observable<any> {
    return this.http.get(`http://127.0.0.1:8000/client/${id}`);
  }
}
