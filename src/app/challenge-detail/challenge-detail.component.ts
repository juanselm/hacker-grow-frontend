import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RetosService } from '../services/retos.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

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

  constructor(
    private route: ActivatedRoute,
    private retosService: RetosService,
    private fb: FormBuilder
  ) {
    this.solutionForm = this.fb.group({
      solution: ['']
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.retosService.getRetoById(id).subscribe((data: any) => {
      this.challenge = data;
      this.encryptedHash = this.encryptHash(data.hashSolucion, data.nombreReto);
    });
  }

  encryptHash(hash: string, challengeName: string): string {
    if (challengeName.toLowerCase().includes('base64')) {
      return btoa(hash); // Base64 encoding
    } else {
      const shift = Math.floor(Math.random() * 26) + 1;
      return this.caesarCipher(hash, shift); // Caesar cipher with a shift of 3
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
    if (solution === this.challenge.hashSolucion) {
      alert('Congratulations! The solution is correct.');
    } else {
      alert('Incorrect solution. Please try again.');
    }
  }
}