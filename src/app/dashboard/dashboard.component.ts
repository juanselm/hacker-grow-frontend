import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { ProgresoUsuario } from '../models/progreso-usuario';
import { AvatarModalComponent } from './avatar-modal.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, AvatarModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName$: Observable<string>;
  progreso: ProgresoUsuario[] = [];
  userId: number | null = null;
  selectedAvatar: any = null;
  avatarHover = false;
  showAvatarModal = false;
  avatars: any[] = [];

  constructor(private authService: AuthService, private retosService: RetosService, private http: HttpClient) {
    this.userName$ = this.authService.userName$;
  }

  ngOnInit(): void {
    this.userId = this.getUserId();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.idAvatar) {
      this.http.get<any>(`http://localhost:8080/api/avatars/${user.idAvatar}`).subscribe(avatar => {
        this.selectedAvatar = avatar;
      });
    } else {
      this.selectedAvatar = null;
    }
    if (this.userId) {
      this.getProgresoUsuario(this.userId);
    }
  }

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.idUsuario || null;
  }

  getProgresoUsuario(idUsuario: number): void {
    this.retosService.getProgresoUsuario(idUsuario).subscribe((data: ProgresoUsuario[]) => {
      const latestProgreso = data.reduce((acc: ProgresoUsuario[], curr: ProgresoUsuario) => {
        const existing = acc.find((item: ProgresoUsuario) => item.reto.idReto === curr.reto.idReto);
        if (!existing || new Date(existing.fechaFinalizacion) < new Date(curr.fechaFinalizacion)) {
          acc = acc.filter((item: ProgresoUsuario) => item.reto.idReto !== curr.reto.idReto);
          acc.push(curr);
        }
        return acc;
      }, []);
      this.progreso = latestProgreso;
    });
  }

  getProgressWidth(estadoReto: string): string {
    switch (estadoReto) {
      case 'completado':
        return '100%';
      case 'en_progreso':
        return '50%';
      case 'no_comenzado':
      default:
        return '0%';
    }
  }

  openAvatarModal() {
    this.showAvatarModal = true;
    if (this.avatars.length === 0) {
      this.http.get<any[]>('http://localhost:8080/api/avatars').subscribe(data => {
        this.avatars = data;
      });
    }
  }

  onAvatarSelected(avatar: any) {
    this.selectedAvatar = avatar;
    this.showAvatarModal = false;
    // Actualiza el idAvatar del usuario en localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.idAvatar = avatar.idAvatar;
    localStorage.setItem('user', JSON.stringify(user));
    // Actualiza el avatar en el backend
    if (this.userId && avatar.idAvatar) {
      this.http.put(`http://localhost:8080/api/users/${this.userId}/avatar/${avatar.idAvatar}`, {}).subscribe();
    }
  }

  onAvatarModalClosed() {
    this.showAvatarModal = false;
  }
}