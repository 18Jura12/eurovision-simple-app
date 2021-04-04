import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  name: { a: string, b: string } = { a: 'juco', b: 'teco' };

  constructor(
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    localStorage.clear();
  }

  setLogin(name: string) {
    this.loginService.changeLogin();
    this.router.navigate(['/vote', { id: name }]);
  }

}
