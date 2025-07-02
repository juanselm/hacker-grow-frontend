import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

interface RankingUsuario {
  idUsuario: number;
  nombre: string;
  nombreDeUsuario: string;
  retosCompletados: number;
  fechaUltimaSolucion: string;
}

@Component({
  selector: 'app-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {
  ranking: RankingUsuario[] = [];
  loading = true;
  error = '';
  currentUserId: number | null = null;

  constructor(private http: HttpClient, public authService: AuthService) {
    // Obtener el id del usuario logueado
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUserId = user.idUsuario || null;
  }

  ngOnInit(): void {
    this.http.get<RankingUsuario[]>('http://localhost:8080/api/progreso-usuarios/ranking-usuarios')
      .subscribe({
        next: (data) => {
          this.ranking = data.sort((a, b) => b.retosCompletados - a.retosCompletados);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error loading ranking.';
          this.loading = false;
        }
      });
  }
}
