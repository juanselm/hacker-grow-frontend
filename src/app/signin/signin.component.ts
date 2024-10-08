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
          this.signInForm.reset();
        },
        error => {
          console.error('Error during registration:', error);
        }
      );
    } else {
      console.error('Form is invalid');
      alert('Please verify the form fields');
    }
  }
}
