import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  signInForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.signInForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(10)]],
      nombreDeUsuario: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signInForm.valid) {
      this.authService.signIn(this.signInForm.value).subscribe(
        response => {
          alert('Registration successful!');
          this.signInForm.reset(); // Restablecer el formulario después del registro exitoso
        },
        error => {
          if (error.status === 409) {
            alert('Registration failed.');
          } else {
            console.error('Error during registration:', error);
            alert('An error occurred during registration. Please try again.');
          }
        }
      );
    } else {
      if (this.signInForm.controls['contrasena'].errors?.['minlength']) {
        alert('Password must be at least 10 characters long.');
      } else {
        alert('Please verify the form fields');
      }
      console.error('Form is invalid');
    }
  }
}
