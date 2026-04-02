import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

const NAME_PATTERN = /^[a-zA-ZčČćĆđĐšŠžŽ]+([- ][a-zA-ZčČćĆđĐšŠžŽ]+)*$/;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

  nameForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(NAME_PATTERN)
    ])
  });

  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.loginService.clearUser();
  }

  get nameControl() {
    return this.nameForm.get('name')!;
  }

  setLogin(): void {
    if (this.nameForm.invalid) return;
    const name = this.nameControl.value!.trim();
    this.loginService.setUser(name);
    this.router.navigate(['/vote']);
  }
}
