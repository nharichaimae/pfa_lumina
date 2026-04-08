import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdminReadDto } from '../dto/admin/admin-read.dto';
import { AdminUpdateDto } from '../dto/admin/admin-update.dto';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class AdminProfileApi {
  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) throw new Error('Token JWT non trouvé');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getProfile(id: number): Observable<AdminReadDto> {
    const headers = this.getHeaders();
    return this.http.get<AdminReadDto>(`http://localhost:8000/api/admin/profile/${id}`, { headers });
  }

  updateProfile(id: number, dto: AdminUpdateDto): Observable<{ message: string; admin: AdminReadDto }> {
    const headers = this.getHeaders();
    return this.http.put<{ message: string; admin: AdminReadDto }>(`http://localhost:8000/api/admin/profile/${id}`, dto, { headers });
  }
}
