import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AADAuthService } from '../services/aad-auth.service';

@Injectable({ providedIn: 'root' })
export class CanActivateGuard implements CanActivate {

  constructor(private authService: AADAuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.loggedIn) {
        return true;
    }

    // Track URL user is trying to go to so we can send them there after logging in
    this.authService.redirectUrl = state.url;
    this.router.navigate(['/login']);
    return false;
  }

}
