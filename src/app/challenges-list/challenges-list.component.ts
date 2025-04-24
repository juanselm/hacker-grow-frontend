import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { ProgresoService } from '../services/progreso.service'; // Importar el servicio compartido

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.css']
})
export class ChallengesListComponent implements OnInit {
  challenges: any[] = [];
  categoria: string | null = '';
  progreso: any[] = [];
  userId: number | null = null;

  constructor(
    private retosService: RetosService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private location: Location,
    private progresoService: ProgresoService // Inyectar el servicio compartido
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit called');
    this.categoria = this.route.snapshot.paramMap.get('categoria');
    console.log('Categoria:', this.categoria);
    this.userId = this.getUserId();
    console.log('UserId:', this.userId);
    if (this.categoria) {
      this.getRetosByCategoria(this.categoria);
    }
    if (this.userId) {
      this.getProgresoUsuario(this.userId);
    }

    // Suscribirse a los cambios en el progreso global
    this.progresoService.progreso$.subscribe((progreso) => {
      console.log('Progreso actualizado:', progreso);
      this.progreso = progreso;
    });
  }

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.idUsuario || null;
  }

  getRetosByCategoria(categoria: string): void {
    this.retosService.getRetosByCategoria(categoria).subscribe((data: any[]) => {
      this.challenges = data;
    });
  }

  getProgresoUsuario(idUsuario: number): void {
    console.log('Fetching progreso for user:', idUsuario);
    this.retosService.getProgresoUsuario(idUsuario).subscribe((data: any[]) => {
      console.log('Progreso recibido:', data);
      this.progreso = data;
    });
  }

  isCompleted(idReto: number): boolean {
    console.log('Checking if reto is completed based on fechaFinalizacion:', idReto);
    const retoProgreso = this.progreso
      .filter(p => p.reto?.idReto === idReto)
      .sort((a, b) => {
        const fechaA = a.fechaFinalizacion ? new Date(a.fechaFinalizacion).getTime() : Number.MIN_SAFE_INTEGER;
        const fechaB = b.fechaFinalizacion ? new Date(b.fechaFinalizacion).getTime() : Number.MIN_SAFE_INTEGER;
        return fechaB - fechaA;
      })[0];
    console.log('Último estado del reto basado en fechaFinalizacion:', retoProgreso);
    return !!(retoProgreso && retoProgreso.estadoReto === 'completado');
  }

  goBack(): void {
    this.location.back();
  }
}