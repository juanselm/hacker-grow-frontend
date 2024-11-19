import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private loggedIn = new BehaviorSubject<boolean>(this.isLoggedIn());
  private userName = new BehaviorSubject<string>(this.getUserName());

  constructor(private http: HttpClient) {}

  signIn(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/sign-in`, data, { headers });
  }

  login(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/login`, data, { headers });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get userName$(): Observable<string> {
    return this.userName.asObservable();
  }

  logout(): void {
    localStorage.removeItem('user');
    this.loggedIn.next(false);
    this.userName.next('');
  }

  setLoggedIn(value: boolean): void {
    this.loggedIn.next(value);
  }

  setUserName(name: string): void {
    this.userName.next(name);
  }

  private getUserName(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.nombre || '';
  }
}