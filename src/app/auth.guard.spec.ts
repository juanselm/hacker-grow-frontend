import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthService } from './services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: { isLoggedIn: () => true } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation if user is logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(true);
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(true);
  });

  it('should navigate to login if user is not logged in', () => {
    spyOn(authService, 'isLoggedIn').and.returnValue(false);
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    expect(guard.canActivate(route, state)).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});