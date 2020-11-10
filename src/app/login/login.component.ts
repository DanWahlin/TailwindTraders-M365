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
  
    constructor(private router: Router, private aadAuthService: AADAuthService, private teamsAuthService: TeamsAuthService) { }
  
    ngOnInit() { 
      this.teamsAuthService.login();

      if (this.aadAuthService.loggedIn) {
        this.router.navigate(['/']);
      }
    }

    login() {
      this.aadAuthService.login();
    }
  
}
