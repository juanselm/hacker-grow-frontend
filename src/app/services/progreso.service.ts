import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgresoService {
  private progresoSource = new BehaviorSubject<any[]>([]);
  progreso$ = this.progresoSource.asObservable();

  updateProgreso(progreso: any[]): void {
    this.progresoSource.next(progreso);
  }
}