import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { AADAuthService } from '../services/aad-auth.service';
import { GrowlerService, GrowlerMessageType } from '../growler/growler.service';
import { LoggerService } from '../services/logger.service';

@Component({
    selector: 'cm-navbar',
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {

    isCollapsed: boolean;
    loggedIn: boolean;
    sub: Subscription;

    constructor(private router: Router,
        public authService: AADAuthService,
        private growler: GrowlerService,
        private logger: LoggerService) { }

    ngOnInit() {
        this.loggedIn = this.authService.loggedIn;
        this.sub = this.authService.authChanged
            .subscribe((loggedIn: boolean) => {
                this.loggedIn = loggedIn;
                this.growler.growl('Logged In', GrowlerMessageType.Info);
            },
            (err: any) => this.logger.log(err));
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    logout() {
        if (this.authService.loggedIn) {
            this.authService.logout();
        }
        this.redirectToLogin();
    }

    redirectToLogin() {
        this.router.navigate(['/login']);
    }

}
