import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AADAuthService } from '../core/services/aad-auth.service';
import { TeamsAuthService } from '../core/services/teams-auth.service';


@Component({
    selector: 'cm-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
    loginVisible = false;

    constructor(private router: Router, private aadAuthService: AADAuthService, private teamsAuthService: TeamsAuthService) { }
  
    async ngOnInit() { 
      // See if app is running in Teams
      let graphProfile;
      try {
        graphProfile = await this.teamsAuthService.login();
      }
      catch {}

      if (graphProfile || this.aadAuthService.loggedIn) {
        return this.router.navigate(['/']);
      }
      this.loginVisible = true;
    }

    login() {
      this.aadAuthService.login();
    }
  
}
