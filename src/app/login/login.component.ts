import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  static users: string[] = [
    'Alex',
    'Ana',
    'Bruna',
    'Jurica',
    'Mario',
    'Matija',
    'Nika',
    'Renato',
    'Teo'
  ];

  constructor(
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    this.loginService.clearUser();
  }

  setLogin(name: string): void {
    this.loginService.setUser(name);
    this.router.navigate(['/vote']);
  }

  get users(): string[] {
    return LoginComponent.users;
  }

}
