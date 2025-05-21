import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close()"></div>
    <div class="modal-content">
      <h2>Select an Avatar</h2>
      <div class="avatar-list">
        <div *ngFor="let avatar of avatars" class="avatar-option" (click)="selectAvatar(avatar)">
          <img [src]="avatar.urlImagen" [alt]="avatar.nombre" />
          <span>{{ avatar.nombre }}</span>
        </div>
      </div>
      <button (click)="close()">Cancel</button>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .modal-content {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 2rem;
      border-radius: 10px;
      z-index: 1001;
      min-width: 300px;
    }
    .avatar-list {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin: 1rem 0;
      justify-content: center;
    }
    .avatar-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 10px;
      padding: 0.5rem;
      transition: border 0.2s;
    }
    .avatar-option:hover {
      border: 2px solid #1976d2;
      background: #f0f0f0;
    }
    .avatar-option img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 0.5rem;
    }
  `]
})
export class AvatarModalComponent {
  @Input() avatars: any[] = [];
  @Output() avatarSelected = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  selectAvatar(avatar: any) {
    this.avatarSelected.emit(avatar);
  }

  close() {
    this.closed.emit();
  }
}
