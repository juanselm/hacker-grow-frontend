import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RetosService {
  private apiUrl = `${environment.apiUrl}/api/retos`;

  constructor(private http: HttpClient) {}

  getRetos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRetoById(id: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getRetosByCategoria(categoria: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categoria/${categoria}`);
  }
}