import { Injectable, Output, EventEmitter, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Logger, CryptoUtils } from 'msal';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AADAuthService implements OnDestroy {
    redirectUrl: string;
    subscriptions: Subscription[] = [];

    isIframe = false;
    loggedIn = false;
    @Output() authChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private broadcastService: BroadcastService,
        private router: Router,
        private authService: MsalService,
        ) { 
        this.init();
    }

    private userAuthChanged(status: boolean) {
        this.authChanged.emit(status); // Raise changed event
    }

    init() {
        let loginSuccessSubscription: Subscription;
        let loginFailureSubscription: Subscription;

        this.isIframe = window !== window.parent && !window.opener;

        this.checkAccount();

        loginSuccessSubscription = this.broadcastService.subscribe('msal:loginSuccess', () => {
            this.checkAccount();
        });

        loginFailureSubscription = this.broadcastService.subscribe('msal:loginFailure', (error) => {
            console.log('Login Fails:', error);
        });

        this.subscriptions.push(loginSuccessSubscription);
        this.subscriptions.push(loginFailureSubscription);

        this.authService.handleRedirectCallback((authError, response) => {
            if (authError) {
                console.error('Redirect Error: ', authError.errorMessage);
                return;
            }

            console.log('Redirect Success: ', response.accessToken);
        });

        this.authService.setLogger(new Logger((logLevel, message, piiEnabled) => {
            console.log('MSAL Logging: ', message);
        }, {
            correlationId: CryptoUtils.createNewGuid(),
            piiLoggingEnabled: false
        }));
    }

    checkAccount() {
        this.loggedIn = !!this.authService.getAccount();
    }

    login() {
        const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

        if (isIE) {
            this.authService.loginRedirect();
        } else {
            this.authService.loginPopup({
                scopes: [
                    'user.read',
                    'openid',
                    'profile',
                ]
            }).then(val => {
                this.userAuthChanged(!!val.account);
                this.router.navigate(['/']);
            });
        }
    }

    logout() {
        this.authService.logout();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

}
