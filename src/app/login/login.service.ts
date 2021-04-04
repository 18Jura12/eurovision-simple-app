import { Injectable } from "@angular/core";

@Injectable({providedIn: 'root'})
export class LoginService {
  isLogin: boolean = false;

  changeLogin() {
    this.isLogin = !this.isLogin;
  }
}
