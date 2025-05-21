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
      background: rgba(0,0,0,0.4);
      z-index: 1000;
    }
    .modal-content {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #f8f9fa;
      padding: 2rem 2.5rem;
      border-radius: 16px;
      z-index: 1001;
      min-width: 350px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .modal-content h2 {
      margin-top: 0;
      color: #222;
      font-size: 1.7em;
      font-weight: 600;
      margin-bottom: 1.2rem;
    }
    .avatar-list {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem 2.5rem;
      margin: 1.5rem 0 1rem 0;
      justify-content: center;
    }
    .avatar-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 0.5rem 1rem 0.7rem 1rem;
      background: #fff;
      transition: border 0.2s, box-shadow 0.2s, background 0.2s;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      min-width: 90px;
    }
    .avatar-option:hover {
      border: 2px solid #ff5722;
      background: #fff3e0;
      box-shadow: 0 4px 16px rgba(255,87,34,0.10);
    }
    .avatar-option img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 0.5rem;
      background: #eee;
      border: 1.5px solid #e0e0e0;
    }
    .avatar-option span {
      margin-top: 0.2rem;
      font-size: 1em;
      color: #333;
      font-weight: 500;
      text-align: center;
    }
    .select-avatar-btn, .modal-content button {
      background-color: #ff5722;
      color: #fff;
      border: none;
      padding: 10px 22px;
      font-size: 1em;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 1.2rem;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(255,87,34,0.08);
      transition: background 0.2s;
    }
    .select-avatar-btn:hover, .modal-content button:hover {
      background-color: #e64a19;
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
