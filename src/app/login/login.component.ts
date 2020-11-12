import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FindValueSubscriber } from 'rxjs/internal/operators/find';
import { AADAuthService } from '../core/services/aad-auth.service';
import { TeamsAuthService } from '../core/services/teams-auth.service';


@Component({
    selector: 'cm-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
    loginVisible = false;
    grantConsentVisible = false;

    constructor(private router: Router, 
                private aadAuthService: AADAuthService, 
                private teamsAuthService: TeamsAuthService) { }
  
    async ngOnInit() { 
      // See if we're in Teams
      const graphProfile = await this.getGraphProfile();
      if (graphProfile === 'invalid_grant') {
        this.grantConsentVisible = true;
        return;
      }

      if (!this.aadAuthService.loggedIn) {
        this.loginVisible = true;
        return;
      }      

      if (graphProfile || this.aadAuthService.loggedIn) {
        return this.navigate();
      }
    }

    async getGraphProfile() {
      // See if app is running in Teams
      let graphProfile;
      try {
        graphProfile = await this.teamsAuthService.login();
      }
      catch (error) {
        if (error === "invalid_grant") {
          console.log(error);
          return error;
        }
      }
      return graphProfile;
    }

    async grantConsent() {
      let token = await this.teamsAuthService.grantConsent();
      alert(token);
      this.navigate();
    }

    login() {
      this.aadAuthService.login();
    }

    navigate() {
      this.router.navigate(['/']);
    }
  
}
