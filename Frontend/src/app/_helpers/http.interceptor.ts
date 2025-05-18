import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccountService } from '../_services';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  constructor(
    private router: Router,
    private accountService: AccountService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Add auth header with jwt if user is logged in and request is to the api url
    const account = this.accountService.accountValue;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    
    if (account?.jwtToken && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${account.jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Auto logout if 401 response returned from api
          this.accountService.logout();
          this.router.navigate(['/account/login']);
        }
        
        const errorMessage = error.error?.message || error.statusText;
        return throwError(() => errorMessage);
      })
    );
  }
}
