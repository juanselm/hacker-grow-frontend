import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-challenges-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './challenges-list.component.html',
  styleUrls: ['./challenges-list.component.css']
})
export class ChallengesListComponent {
  challenges = [
    { title: 'Cryptography', description: 'Learn the art of cryptography, including encryption and decryption techniques.' },
    { title: 'Secure Practices', description: 'Understand and implement best practices for securing systems and applications.' },
    { title: 'Pentesting', description: 'Engage in penetration testing to identify vulnerabilities in systems and networks.' }
  ];
}