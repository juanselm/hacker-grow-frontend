import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RetosService {
  private apiUrl = `${environment.apiUrl}/api/retos`;
  private progresoUrl = `${environment.apiUrl}/api/progreso-usuarios`;

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

  updateProgresoUsuario(progreso: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.progresoUrl, progreso, { headers });
  }

  getProgresoUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.progresoUrl}/usuario/${idUsuario}`);
  }
}