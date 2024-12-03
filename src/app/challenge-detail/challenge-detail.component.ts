import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './challenge-detail.component.html',
  styleUrls: ['./challenge-detail.component.css']
})
export class ChallengeDetailComponent implements OnInit {
  challenge: any;
  solutionForm: FormGroup;
  encryptedHash: string = '';
  userId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private retosService: RetosService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.solutionForm = this.fb.group({
      solution: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.userId = this.getUserId();
    this.retosService.getRetoById(id).subscribe((data: any) => {
      this.challenge = data;
      this.encryptedHash = this.encryptHash(data.hashSolucion, data.nombreReto);
    });
  }

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.idUsuario || null;
  }

  encryptHash(hash: string, challengeName: string): string {
    if (challengeName.toLowerCase().includes('base64')) {
      return btoa(hash); // Base64 encoding
    } else {
      const shift = Math.floor(Math.random() * 26) + 1; // Random shift between 1 and 26
      return this.caesarCipher(hash, shift);
    }
  }

  caesarCipher(str: string, shift: number): string {
    return str.replace(/[a-z]/gi, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + shift) % 26) + start);
    });
  }

  onSubmit(): void {
    const solution = this.solutionForm.get('solution')?.value;
    const estadoReto = solution === this.challenge.hashSolucion ? 'completado' : 'en_progreso';
    const progreso = {
      usuario: { idUsuario: this.userId },
      reto: { idReto: this.challenge.idReto },
      estadoReto: estadoReto,
      fechaInicio: new Date().toISOString(),
      fechaFinalizacion: estadoReto === 'completado' ? new Date().toISOString() : null,
      intentos: 1
    };

    this.retosService.updateProgresoUsuario(progreso).subscribe(() => {
      if (estadoReto === 'completado') {
        alert('Congratulations! The solution is correct.');
      } else {
        alert('Incorrect solution. Please try again.');
      }
    });
  }
}