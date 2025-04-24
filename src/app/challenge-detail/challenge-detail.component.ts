import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProgresoService } from '../services/progreso.service'; // Importar el servicio compartido

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
  progreso: any;

  constructor(
    private route: ActivatedRoute,
    private retosService: RetosService,
    private fb: FormBuilder,
    private authService: AuthService,
    private progresoService: ProgresoService // Inyectar el servicio compartido
  ) {
    this.solutionForm = this.fb.group({
      solution: ['']
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called for ChallengeDetailComponent');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Challenge ID:', id);
    this.userId = this.getUserId();
    console.log('UserId:', this.userId);
    this.retosService.getRetoById(id).subscribe((data: any) => {
      console.log('Challenge data received:', data);
      this.challenge = data;
      if (data.hashSolucion) {
        this.encryptedHash = this.encryptHash(data.hashSolucion, data.nombreReto);
        console.log('Encrypted hash:', this.encryptedHash);
      }
    });
    if (this.userId) {
      this.getProgresoUsuario(this.userId);
    }
  }

  getUserId(): number | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.idUsuario || null;
  }

  getProgresoUsuario(idUsuario: number): void {
    console.log('Fetching progreso for user in ChallengeDetailComponent:', idUsuario);
    this.retosService.getProgresoUsuario(idUsuario).subscribe((data: any[]) => {
      console.log('Progreso recibido en ChallengeDetailComponent:', data);

      // Verificar los datos completos devueltos por el backend
      console.log('Datos completos devueltos por el backend:', JSON.stringify(data, null, 2));

      // Filtrar los progresos relacionados con el reto actual
      const retoProgresos = data.filter(p => p.reto.idReto === this.challenge.idReto);
      console.log('Progresos filtrados para el reto actual:', retoProgresos);

      if (retoProgresos.length === 0) {
        console.log('No se encontraron progresos para el reto actual.');
        this.progreso = null;
        return;
      }

      // Ordenar los progresos por fecha de finalización (descendente), manejando fechas null
      const ultimoProgreso = retoProgresos.sort((a, b) => {
        const fechaA = a.fechaFinalizacion ? new Date(a.fechaFinalizacion).getTime() : 0; // Null como más antiguo
        const fechaB = b.fechaFinalizacion ? new Date(b.fechaFinalizacion).getTime() : 0; // Null como más antiguo
        console.log(`Comparando fechas: A (${a.fechaFinalizacion}) - B (${b.fechaFinalizacion})`);
        return fechaB - fechaA;
      })[0];

      console.log('Último progreso encontrado después del ordenamiento:', ultimoProgreso);

      if (ultimoProgreso) {
        this.progreso = ultimoProgreso; // Actualizar el progreso del reto actual
        console.log('Progreso seleccionado:', this.progreso);
      } else {
        this.progreso = null; // Si no hay progreso, establecer como null
        console.log('No se pudo determinar un último progreso válido.');
      }
    });
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

      // Actualizar el progreso global
      this.retosService.getProgresoUsuario(this.userId!).subscribe((data: any[]) => {
        this.progresoService.updateProgreso(data); // Emitir el progreso actualizado
      });
    });
  }
}