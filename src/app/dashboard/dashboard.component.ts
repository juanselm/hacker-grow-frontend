import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { ProgresoUsuario } from '../models/progreso-usuario';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  userName$: Observable<string>;
  progreso: ProgresoUsuario[] = [];
  userId: number | null = null;

  constructor(private authService: AuthService, private retosService: RetosService) {
    this.userName$ = this.authService.userName$;
  }

  ngOnInit(): void {
    this.userId = this.getUserId();
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
}