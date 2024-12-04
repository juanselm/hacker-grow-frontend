import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { Location } from '@angular/common';
import { AuthService } from '../services/auth.service';

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

  constructor(private retosService: RetosService, private route: ActivatedRoute, private authService: AuthService, private location: Location) {}

  ngOnInit(): void {
    this.categoria = this.route.snapshot.paramMap.get('categoria');
    this.userId = this.getUserId();
    if (this.categoria) {
      this.getRetosByCategoria(this.categoria);
    }
    if (this.userId) {
      this.getProgresoUsuario(this.userId);
    }
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
    this.retosService.getProgresoUsuario(idUsuario).subscribe((data: any[]) => {
      this.progreso = data;
    });
  }

  isCompleted(idReto: number): boolean {
    const retoProgreso = this.progreso.find(p => p.reto.idReto === idReto);
    return retoProgreso && retoProgreso.estadoReto === 'completado';
  }

  goBack(): void {
    this.location.back();
  }
}