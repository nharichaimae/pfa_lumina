import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VoiceService {

  private readonly apiUrl = 'http://localhost:5297/api/voice';

  constructor(private http: HttpClient) {}

  /**
   
   * @param blob 
   */
  sendGlobalAudio(blob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append("audio", blob, "commande.wav"); 

    return this.http.post(`${this.apiUrl}/control`, formData).pipe(
      catchError((error) => {
        return of({
          success: false,
          error: error?.error?.error || "Je n'ai pas compris",
          textCorrige: error?.error?.text || error?.error?.textDetecte
        });
      })
    );
  }

}