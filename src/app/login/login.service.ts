import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LoginService {
  private readonly USER_KEY = 'user';

  setUser(name: string): void {
    localStorage.setItem(this.USER_KEY, name);
  }

  getUser(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
}
