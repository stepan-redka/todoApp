import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5043';
  private readonly tokenKey = 'authToken';

  register(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  login(credentials: { email: string; password: string }): Observable<{ accessToken: string; expiresIn: number; refreshToken: string }> {
    return this.http.post<{ accessToken: string; expiresIn: number; refreshToken: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response && response.accessToken) {
            localStorage.setItem(this.tokenKey, response.accessToken);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
