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
