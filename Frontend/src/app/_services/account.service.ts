import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '../_models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  // Getter for current account value
  get accountValue(): Account | null {
    return this.accountSubject.value;
  };

  // Getter for current account ID
  get currentAccountId(): string | null {
    const account = this.accountSubject.value;
    return account?.id || null;
  };

  constructor(private router: Router, private http: HttpClient) {
    this.accountSubject = new BehaviorSubject<Account | null>(null);
    this.account = this.accountSubject.asObservable(); 
  }
  
  public get currentAccount(): Account | null {
    const account = this.accountSubject.getValue();
    if (!account) {
      return null;
    }
    return account;
  }

  private get _currentAccount(): Account | null {
    return this.accountSubject.value;
  }

  login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
      .pipe(
        map(account => {
          // Store user details and jwt token in local storage
          if (account) {
            this.accountSubject.next(account);
            this.startRefreshTokenTimer();
            // Store the account in localStorage
            localStorage.setItem('account', JSON.stringify(account));
          }
          return account;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout() {
    // Only try to revoke token if user is actually logged in
    if (this._currentAccount?.jwtToken) {
      this.http.post<any>(`${baseUrl}/revoke-token`, {}, { withCredentials: true })
        .subscribe(
          () => {
            console.log('Token revoked successfully');
          },
          (error) => {
            console.error('Error revoking token:', error);
          }
        );
    }
    this.stopRefreshTokenTimer();
    this.accountSubject.next(null);
    this.router.navigate(['/account/login']);
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/register`, account);
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
  }

  changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/change-password`, { currentPassword, newPassword, confirmPassword });
  }

  getAll() {
    return this.http.get<Account[]>(baseUrl);
  }

  updateSettings(settings: any) {
    return this.http.post(`${baseUrl}/settings`, settings);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/${id}`);
  }

  create(params: any) {
    return this.http.post(baseUrl, params);
  }

  update(id: string, params: Partial<Account>) {
    return this.http.put(`${baseUrl}/${id}`, params)
      .pipe(
        map((response: any) => {
          const account = response as Account;
          if (account.id === this._currentAccount?.id) {
            const updatedAccount = { ...this._currentAccount, ...account };
            this.accountSubject.next(updatedAccount);
            return updatedAccount;
          }
          return account;
        })
      );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`)
      .pipe(finalize(() => {
        if (id === String(this._currentAccount?.id)) {
          this.logout();
        }
      }));
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map(account => {
          this.accountSubject.next(account);
          this.startRefreshTokenTimer();
          return account;
        }),
        catchError(error => {
          // If refresh token fails, log the user out
          this.logout();
          return throwError(() => error);
        })
      );
  }

  private refreshTokenTimeout: any;

  private startRefreshTokenTimer() {
    const jwtToken = this.accountSubject.value?.jwtToken
    ? JSON.parse(atob(this.accountSubject.value.jwtToken.split('.')[1]))
    : null;

    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}