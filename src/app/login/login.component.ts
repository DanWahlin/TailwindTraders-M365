import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';


@Component({
    selector: 'cm-login',
    templateUrl: './login.component.html',
    styleUrls: [ './login.component.css' ]
})
export class LoginComponent implements OnInit {
  
    constructor(private router: Router, private authService: AuthService) { }
  
    ngOnInit() { 
      if (this.authService.loggedIn) {
        this.router.navigate(['/']);
      }
    }

    login() {
      this.authService.login();
    }
  
}
