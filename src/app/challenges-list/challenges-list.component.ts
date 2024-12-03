import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, ActivatedRoute } from '@angular/router';
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
  categoria: string | null = '';

  constructor(private retosService: RetosService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.categoria = this.route.snapshot.paramMap.get('categoria');
    if (this.categoria) {
      this.getRetosByCategoria(this.categoria);
    }
  }

  getRetosByCategoria(categoria: string): void {
    this.retosService.getRetosByCategoria(categoria).subscribe((data: any[]) => {
      this.challenges = data;
    });
  }
}