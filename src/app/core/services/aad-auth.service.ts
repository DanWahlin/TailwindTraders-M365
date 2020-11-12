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
    _loggedIn = false;
    get loggedIn() {
        return this._loggedIn;
    }
    set loggedIn(val: boolean) {
        this._loggedIn = val;
        this.userAuthChanged(val);
    }

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
            if (this.loggedIn) {
                console.log('LOGIN SUCCESS!');
                this.router.navigate(['/']);
            }
        });

        loginFailureSubscription = this.broadcastService.subscribe('msal:loginFailure', (error) => {
            console.log('LOGIN FAILURE:', error);
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
        }, 
        {
            correlationId: CryptoUtils.createNewGuid(),
            piiLoggingEnabled: false
        }));
    }

    checkAccount() {
        this.loggedIn = !!this.authService.getAccount();
    }

    async login() {
        const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;

        if (isIE) {
            this.authService.loginRedirect();
        } else {
            // msal events above will fire based on success or failure
            await this.authService.loginPopup({
                scopes: [
                    'user.read',
                    'openid',
                    'profile',
                ]
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
