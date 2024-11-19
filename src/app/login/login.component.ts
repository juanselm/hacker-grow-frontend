import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        response => {
          // Guardar los datos del usuario (puedes usar localStorage o sessionStorage)
          localStorage.setItem('user', JSON.stringify(response));
          // Actualizar el estado de autenticación y el nombre del usuario
          this.authService.setLoggedIn(true);
          this.authService.setUserName(response.nombre);
          // Redirigir a la página de dashboard
          this.router.navigate(['/dashboard']);
        },
        error => {
          console.error('Error during login:', error);
          alert('Login failed. Please check your credentials and try again.');
        }
      );
    } else {
      console.error('Form is invalid');
      alert('Please verify the form fields');
    }
  }
}