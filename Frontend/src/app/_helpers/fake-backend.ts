import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '../_services';
import { Account, Role } from '../_models';

// array in local storage for accounts
const accountsKey = 'angular-10-signup-verification-boilerplate-accounts';
let accounts = JSON.parse(localStorage.getItem(accountsKey) ?? '[]');

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    constructor(private alertService: AlertService) {}

    intercept( request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        return handleRoute() ;

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken() ;
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    // const body = JSON.parse(requestBody);
                    return validateResetToken(body);
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getAccounts();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getAccountById();
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                default:
                // pass through any requests not handled above
                return next.handle(request);
        }
    }

    // route functions

    function authenticate() {
        const { email, password } = body;
        const account = accounts.find((x: Account) => x.email === email && x.password === password && x.isVerified);
      
        if (!account) return error('Email or password is incorrect');
      
        // add refresh token to account
        account.refreshTokens.push(generateRefreshToken());
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
        return ok({
          ...basicDetails(account),
          jwtToken: generateJwtToken(account)
        });
    }

    function refreshToken() {
        const refreshToken = getRefreshToken();

        if (!refreshToken) return unauthorized();

        const account = accounts.find((x: Account) => x.refreshTokens.includes(refreshToken));

        if (!account) return unauthorized();

        // replace old refresh token with a new one and save
        account.refreshTokens = account.refreshTokens.filter((x: string) => x !== refreshToken);
        account.refreshTokens.push( generateRefreshToken());
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        return ok({
            ...basicDetails(account),
            jwtToken: generateJwtToken(account)
        });
    }

    function revokeToken() {
        if (!isAuthenticated()) return unauthorized();

        const refreshToken = getRefreshToken();
        const account = accounts.find((x: Account) => x.refreshTokens.includes(refreshToken));

        // revoke token and save
        account.refreshTokens = account.refreshTokens.filter((x: string) => x !== refreshToken);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        
        return ok();
    }

    function register() {
        const account = body;

        if (accounts.find((x: Account) => x.email === account.email)) {
            setTimeout(() => {
                alertService.info(`
                    <h4>Already Registered</h4>
                    <p>Your email ${account.email} is already registered.</p>
                    <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                    <div><strong>Note:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
            }, 1000);

            return ok();
        }

        account.id =  newAccountId();
            if (account.id === 1) {
                account.role = Role.Admin;
            } else {
                account.role = Role.User;
            }
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.isVerified = false;
            account.refreshTokens = [];
            delete account.confirmpassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
        
        setTimeout(() => {
            const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
            alertService.info(`
                    <h4>Verification Email</h4>
                    <p>Thanks for registering!</p>
                    <p>Please click the link below to verify your email address:</p>
                    <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                    <div><strong>Note:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
        }, 1000);

        return ok();
    }

    function verifyEmail() {
        const { token } = body;
        const account = accounts.find((x: Account) => !!x.verificationToken && x.verificationToken === token);
        if (!account) return error( 'Verification failed');

        account.isVerified = true;
        localStorage.setItem(accountsKey, JSON.stringify(accounts));

        return ok();
    }

    function forgotPassword() {
        const { email } = body;
        const account = accounts.find((x: Account) => x.email === email);
      
        // always return ok() response to prevent email enumeration
        if (!account) return ok();
      
        // create reset token that expires after 24 hours
        account.resetToken = new Date().getTime().toString();
        account.resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
        // display password reset email in alert
        setTimeout(() => {
          const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
          alertService.info(
            `<h4>Reset Password Email</h4>
            <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>`,
            { autoClose: false }
          );
        }, 1000);
      
        return ok();
    }

    function validateResetToken(body: { token: string }) {
        const { token } = body;
        const account = accounts.find((x: Account) => 
            !!x.resetToken && x.resetToken === token && 
            x.resetTokenExpires && new Date() < new Date(x.resetTokenExpires));
      
        if (!account) return error('Invalid token');
      
        return ok();
    }

    function resetPassword() {
        const { token, password } = body;
        const account = accounts.find((x: Account) =>
            !!x.resetToken && x.resetToken === token && 
            x.resetTokenExpires &&new Date() < new Date(x.resetTokenExpires)
        );
      
        if (!account) return error('Invalid token');
      
        // update password and remove reset token
        account.password = password;
        account.isVerified = true;
        delete account.resetToken;
        delete account.resetTokenExpires;
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
      
        return ok();
    }
      
    function getAccounts() {
        if (!isAuthenticated()) return unauthorized();
        return ok(accounts.map((x: Account) => basicDetails(x)));
    }

    function getAccountById() {
        const id = idFromUrl();
        const account = accounts.find((x: Account) => x.id === id);
        if (!account) return error('Account not found');
        return ok(basicDetails(account));
    }

    function deleteAccount() {
        if (!isAuthenticated()) return unauthorized();
        
        const id = idFromUrl();
        const accountIndex = accounts.findIndex((x: Account) => x.id === id);
        
        if (accountIndex === -1) return error('Account not found');
        
        accounts.splice(accountIndex, 1);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        
        return ok();
    }

    function createAccount() {
        const account = body;
        account.dateCreated = new Date().toISOString();
        account.verificationToken = new Date().getTime().toString();
        account.isVerified = false;
        account.refreshTokens = [];
        delete account.confirmpassword;
        accounts.push(account);
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        return ok();
    }
    

    function ok(body?: any) {
        return of(new HttpResponse({ status: 200, body }))
          .pipe(delay(500)); // delay observable to simulate server api call
    }
      
    function error(message: string) {
        return throwError({ error: { message } })
          .pipe(materialize(), delay(500), dematerialize());
    }
      
    function unauthorized() {
        return throwError({ status: 401, error: { message: 'Unauthorized' } })
          .pipe(materialize(), delay(500), dematerialize());
    }
      
      function basicDetails(account: Account) {
        const { id, title, firstName, lastName, email, role, dateCreated, isVerified } = account;
        return { id, title, firstName, lastName, email, role, dateCreated, isVerified };
    }

    function updateAccount() {
        if (!isAuthenticated()) return unauthorized();
        
        const id = idFromUrl();
        const accountIndex = accounts.findIndex((x: Account) => x.id === id);
        
        if (accountIndex === -1) return error('Account not found');
        
        const account = { ...accounts[accountIndex], ...body };
        accounts[accountIndex] = account;
        localStorage.setItem(accountsKey, JSON.stringify(accounts));
        
        return ok(basicDetails(account));
    }
      
      function isAuthenticated() {
        return !!currentAccount();
    }
      
      function isAuthorized(role: Role) {
        const account = currentAccount();
        if (!account) return false;
        return account.role === role;
    }
      
      function idFromUrl(): string {
        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 1];
        if (!id) return '';
        return id.toString();
    }
    
    function newAccountId() { 
        const accounts: Account[] = JSON.parse(localStorage.getItem(accountsKey) || '[]');
        return accounts.length ? Math.max(...accounts.map((x: Account) => x.id ? Number(x.id) : 0)) + 1 : 1;
    }
      
    function currentAccount(): Account | undefined {
        const authHeader = headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer fake-jwt-token')) return undefined;
      
        try {
          const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
          const tokenExpired = Date.now() > (jwtToken.exp * 1000);
          if (tokenExpired) return undefined;
      
          const accounts: Account[] = JSON.parse(localStorage.getItem(accountsKey) || '[]'); 
          const account = accounts.find((x: Account) => x.id === jwtToken.id);
          return account;
        } catch (error) {
          console.error("Error decoding JWT:", error);
          return undefined;
        }
    }
      
    function generateJwtToken(account: any) {
        // create token that expires in 15 minutes
        const tokenPayload = {
          exp: Math.round(new Date(Date.now() + 15 * 60 * 1000).getTime() / 1000),
          id: account.id
        };
      
        return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
    }
    
    function generateRefreshToken() {
        const token = new Date().getTime().toString();
      
        // add token cookie that expires in 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
      
        return token;
    }
      
      // get refresh token from cookie
      function getRefreshToken() {
        return (document.cookie.split('; ').find(x => x.includes('fakeRefreshToken')) || '').split('=')[1];
    }
}
}
      
      export let fakeBackendProvider = {
        // use fake backend in place of Http service for backend-less development
        provide: HTTP_INTERCEPTORS,
        useClass: FakeBackendInterceptor,
        multi: true
    };      
    