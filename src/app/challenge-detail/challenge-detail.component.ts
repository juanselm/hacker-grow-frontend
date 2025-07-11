import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ProgresoService } from '../services/progreso.service'; // Importar el servicio compartido
import { FREQUENCY_BREAKER_PHRASES } from './frequency-breaker-phrases';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-challenge-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './challenge-detail.component.html',
  styleUrls: ['./challenge-detail.component.css']
})
export class ChallengeDetailComponent implements OnInit {
  challenge: any;
  solutionForm: FormGroup;
  encryptedHash: string = '';
  userId: number | null = null;
  progreso: any;

  // For Strong Password challenge
  passwordForm: FormGroup;
  showPasswordHash = false;
  passwordHash = '';

  // Popup messages
  showPopup = false;
  popupMessages: string[] = [];
  popupType: 'error' | 'hash' | 'success' | 'failure' = 'error';

  // Frequency Breaker challenge state
  frequencyBreakerPlain = '';
  frequencyBreakerCipher = '';
  frequencyBreakerUserHash = '';
  frequencyBreakerConfirm = '';
  showFrequencyBreakerPopup = false;
  frequencyBreakerPopupMsg = '';
  frequencyBreakerPhraseConfirmed = false; // Nuevo estado para confirmar la frase

  // Hint toggle for pentesting challenges
  showHint = false;

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
    this.passwordForm = this.fb.group({
      password: ['', Validators.required]
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
      }
      // Solo inicializar Frequency Breaker si corresponde
      if (this.challenge && this.challenge.nombreReto === 'Frequency Breaker') {
        this.setRandomFrequencyBreakerPhrase();
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
        this.popupType = 'success';
        this.popupMessages = ['Congratulations! The solution is correct.'];
        this.showPopup = true;
      } else {
        this.popupType = 'failure';
        this.popupMessages = ['Incorrect solution. Please try again.'];
        this.showPopup = true;
      }

      // Actualizar el progreso global
      this.retosService.getProgresoUsuario(this.userId!).subscribe((data: any[]) => {
        this.progresoService.updateProgreso(data); // Emitir el progreso actualizado
      });
    });
  }

  // Password validation for Strong Password challenge
  onPasswordSubmit(): void {
    const password = this.passwordForm.get('password')?.value || '';
    const errors = this.validateStrongPassword(password);
    if (errors.length > 0) {
      this.popupType = 'error';
      this.popupMessages = errors;
      this.showPopup = true;
      this.showPasswordHash = false;
      this.passwordHash = '';
      return;
    }
    // Si es válida, mostrar el hashSolucion del backend en el popup
    this.passwordHash = this.challenge.hashSolucion;
    this.popupType = 'hash';
    this.popupMessages = [this.passwordHash];
    this.showPopup = true;
    this.showPasswordHash = false;
  }

  closePopup(): void {
    this.showPopup = false;
    this.popupMessages = [];
  }

  validateStrongPassword(password: string): string[] {
    const errors: string[] = [];
    if (password.length < 12) {
      errors.push('- At least 12 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('- At least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('- At least one lowercase letter');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('- At least one special character (!@#$%^&*)');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('- At least one digit (0-9)');
    }
    // Lista de contraseñas comunes
    const commonPasswords = ['password', '123456', '123456789', 'qwerty', 'abc123', 'password1', '111111', '123123', '12345', '12345678'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push("- Do not use common passwords (e.g. 'password', '123456', 'qwerty')");
    }
    // Información personal (username)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const username = user.nombre ? user.nombre.toLowerCase() : '';
    if (username && password.toLowerCase().includes(username)) {
      errors.push('- Do not use your username or personal information');
    }
    // Secuencias o repeticiones
    if (/([a-zA-Z0-9])\1{2,}/.test(password)) {
      errors.push("- Avoid repeated characters (e.g. 'aaaa')");
    }
    if (/(0123|1234|2345|3456|4567|5678|6789|7890|abcd|bcde|cdef|defg|efgh|fghi|ghij|hijk|ijkl|jklm|klmn|lmno|mnop|nopq|opqr|pqrs|qrst|rstu|stuv|tuvw|uvwx|vwxy|wxyz)/i.test(password)) {
      errors.push("- Avoid sequential characters (e.g. '1234', 'abcd')");
    }
    return errors;
  }

  setRandomFrequencyBreakerPhrase(): void {
    const idx = Math.floor(Math.random() * FREQUENCY_BREAKER_PHRASES.length);
    this.frequencyBreakerPlain = FREQUENCY_BREAKER_PHRASES[idx];
    this.frequencyBreakerCipher = this.frequencyBreakerEncrypt(this.frequencyBreakerPlain);
    this.frequencyBreakerUserHash = '';
    this.frequencyBreakerConfirm = '';
    this.frequencyBreakerPhraseConfirmed = false; // Reiniciar estado
  }

  frequencyBreakerEncrypt(plain: string): string {
    // Cifrado simple: reemplaza cada letra por la siguiente letra más frecuente en inglés (ejemplo didáctico)
    const freqOrder = 'etaoinshrdlucmfwypvbgkjqxz';
    const map: { [key: string]: string } = {};
    for (let i = 0; i < 26; i++) {
      map[freqOrder[i]] = freqOrder[(i + 1) % 26];
    }
    return plain.split('').map(c => {
      const lower = c.toLowerCase();
      if (map[lower]) {
        const enc = map[lower];
        return c === lower ? enc : enc.toUpperCase();
      }
      return c;
    }).join('');
  }

  onConfirmDecryptedPhrase(): void {
    if (this.frequencyBreakerUserHash.trim() === '') {
      this.frequencyBreakerPopupMsg = 'Please enter the decrypted phrase.';
      this.showFrequencyBreakerPopup = true;
      this.frequencyBreakerPhraseConfirmed = false;
      return;
    }
    const expectedPhrase = this.frequencyBreakerPlain.replace(/\s+/g, '').toLowerCase();
    const userPhrase = this.frequencyBreakerUserHash.replace(/\s+/g, '').toLowerCase();
    if (userPhrase === expectedPhrase) {
      this.frequencyBreakerPhraseConfirmed = true;
      // Mostrar el hash de la solución para que el usuario lo copie
      this.frequencyBreakerPopupMsg = 'Phrase correct! Solution hash: ' + this.challenge.hashSolucion;
      this.showFrequencyBreakerPopup = true;
    } else {
      this.frequencyBreakerPhraseConfirmed = false;
      this.frequencyBreakerPopupMsg = 'Incorrect decrypted phrase. Try again!';
      this.showFrequencyBreakerPopup = true;
    }
  }

  onFrequencyBreakerSubmit(): void {
    if (!this.frequencyBreakerPhraseConfirmed) {
      this.frequencyBreakerPopupMsg = 'You must confirm the decrypted phrase first.';
      this.showFrequencyBreakerPopup = true;
      return;
    }
    if (this.frequencyBreakerConfirm.trim() === '') {
      this.frequencyBreakerPopupMsg = 'Please enter the solution hash.';
      this.showFrequencyBreakerPopup = true;
      return;
    }
    const expectedHash = this.challenge.hashSolucion;
    if (this.frequencyBreakerConfirm !== expectedHash) {
      this.frequencyBreakerPopupMsg = 'The hash does not match the solution hash.';
      this.showFrequencyBreakerPopup = true;
      return;
    }
    // Todo correcto, mostrar el hash de la solución y marcar el reto como completado
    this.frequencyBreakerPopupMsg = 'Correct! Solution hash: ' + expectedHash;
    this.showFrequencyBreakerPopup = true;
    // Actualizar progreso como completado
    const progreso = {
      usuario: { idUsuario: this.userId },
      reto: { idReto: this.challenge.idReto },
      estadoReto: 'completado',
      fechaInicio: new Date().toISOString(),
      fechaFinalizacion: new Date().toISOString(),
      intentos: 1
    };
    this.retosService.updateProgresoUsuario(progreso).subscribe(() => {
      this.retosService.getProgresoUsuario(this.userId!).subscribe((data: any[]) => {
        this.progresoService.updateProgreso(data);
        this.getProgresoUsuario(this.userId!);
      });
    });
  }

  closeFrequencyBreakerPopup(): void {
    this.showFrequencyBreakerPopup = false;
    this.frequencyBreakerPopupMsg = '';
  }

  toggleHint(): void {
    this.showHint = !this.showHint;
  }
}