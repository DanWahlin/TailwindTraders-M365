import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { GrowlerService, GrowlerMessageType } from '../growler/growler.service';
import { LoggerService } from '../services/logger.service';

@Component({
    selector: 'cm-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {

    isCollapsed: boolean;
    loginLogoutText = '';
    isAuthenticated = false;
    sub: Subscription;

    constructor(private router: Router,
        public authService: AuthService,
        private growler: GrowlerService,
        private logger: LoggerService) { }

    ngOnInit() {
        this.sub = this.authService.authChanged
            .subscribe((loggedIn: boolean) => {
                this.setLoginLogoutText();
            },
            (err: any) => this.logger.log(err));
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    loginOrOut() {
        const isAuthenticated = this.authService.isAuthenticated;
        if (isAuthenticated) {
            this.authService.logout()
                .subscribe((status: boolean) => {
                    this.setLoginLogoutText();
                    this.growler.growl('Logged Out', GrowlerMessageType.Info);
                    this.router.navigate(['/customers']);
                    return;
                },
                (err: any) => this.logger.log(err));
        }
        this.redirectToLogin();
    }

    redirectToLogin() {
        this.router.navigate(['/login']);
    }

    setLoginLogoutText() {
        this.isAuthenticated = this.authService.isAuthenticated;
        this.loginLogoutText = (this.authService.isAuthenticated) ? 'Logout' : '';
    }

}
