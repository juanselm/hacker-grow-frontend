import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RetosService } from '../services/retos.service';

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.css']
})
export class ChallengesListComponent implements OnInit {
  challenges: any[] = [];

  constructor(private retosService: RetosService) {}

  ngOnInit(): void {
    this.retosService.getRetos().subscribe((data: any[]) => {
      this.challenges = data;
    });
  }
}