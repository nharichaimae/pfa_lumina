import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private apiUrl = 'http://localhost:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  getDashboard() {
    const token = localStorage.getItem('token'); // ou sessionStorage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<any>(this.apiUrl, { headers });
  }
}
