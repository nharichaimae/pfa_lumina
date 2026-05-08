import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// DTOs / Interfaces
export interface Piece {
  id: number;
  nom: string;
  typeId?: number;
  typeNom?: string;
  icon?: string;
  equipements?: Equipement[];
}

export interface Equipement {
  id: number;
  nom: string;
  id_Piece: number;
  etat?: string;
  description?: string;
  nomFr: string; 
  nomEn: string;

  // ✅ NEW (pour affichage)
  type_id?: number;
  typeNom?: string;
  icon?: string;
}

export interface PieceType {
  id_type: number;
  nomFr: string;
  nomEn: string;
  icon: string;
}

// ✅ NEW
export interface EquipementType {
  nomEn: string;
  nomFr: string;
  id_type: number;
  nom: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class PieceService {
  private apiUrl = 'http://localhost:5297/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // -------- PIECES --------
  addPiece(data: { name: string; type_id: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/piece`, data, { headers: this.getHeaders() });
  }

  getPieces(): Observable<Piece[]> {
    return this.http.get<Piece[]>(`${this.apiUrl}/pieces`, { headers: this.getHeaders() });
  }

  deletePiece(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/piece/${id}`, { headers: this.getHeaders() });
  }

  getPieceTypes(): Observable<PieceType[]> {
    return this.http.get<PieceType[]>(`${this.apiUrl}/piecetypes`, { headers: this.getHeaders() });
  }

  // -------- EQUIPEMENTS --------

  // ✅ NEW: récupérer les types d'équipements (endpoint à créer côté backend: GET /api/equipementtypes)
  getEquipementTypes(): Observable<EquipementType[]> {
    return this.http.get<EquipementType[]>(`${this.apiUrl}/equipementtypes`, {
      headers: this.getHeaders()
    });
  }

  // ✅ MODIF: envoyer nom/description/etat + type_id
  addEquipement(
    pieceId: number,
    data: { nom: string; description?: string; etat?: string; type_id?: number }
  ): Observable<any> {
    return this.http.post(`${this.apiUrl}/piece/${pieceId}/equipement`, data, {
      headers: this.getHeaders()
    });
  }

  deleteEquipement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/equipement/${id}`, { headers: this.getHeaders() });
  }
  duplicatePiece(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/piece/${id}/duplicate`, {}, { headers: this.getHeaders() });
  }
  updateEquipementEtat(id: number, etat: string) {
  return this.http.put(`${this.apiUrl}/equipement/${id}/etat`, 
    { etat },
    { headers: this.getHeaders() } // 🔥 important
  );
}
}