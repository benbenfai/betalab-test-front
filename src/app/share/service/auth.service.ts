import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';

import { ToastService } from "src/app/share/service/toast.service";

const LOGIN_API = environment.apiServer + '/login';
const LOGOUT_API = environment.apiServer + '/api/auth/logout';
const REGISTER_API = environment.apiServer + '/register';
const INFO_API = environment.apiServer + '/api/auth/userinfo';
const REFRESH_API = environment.apiServer + '/api/auth/refresh';

class LoginResponse {
  access_token!: string;
  refresh_token!: string;
}

class RefreshResponse {
  access_token!: string;
}

class UserInfo {
  username!: string;
  enabled!: boolean;
  isAdmin!: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private jwt: JwtHelperService = new JwtHelperService();
  private authStatus: BehaviorSubject<boolean> = new BehaviorSubject(this.isAuthenticated());

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    ) { }

  // Handle authentication errors
  private errorHandler(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error(`authentication error: ${error.error.message}`);
    } else {
      console.error(`bad auth response: ${error.status}: ${error.statusText} ${JSON.stringify(error.error)}`);
      return throwError('Login attempt failed');
    }
    return throwError('Login attempt failed');
  }

  // subscribe to get authentication status updates
  subscribe(next: (status: boolean) => void) {
    this.authStatus.subscribe(next);
  }

  // Log user in and get refresh/access tokens
  authenticate(username: string, password: string) {
    return this.http.post<LoginResponse>(LOGIN_API, { username, password })
      .pipe(
        mergeMap(response => {
          // store JWTs

          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          // now get user info
          const opts = {
            headers: new HttpHeaders({
              'Authorization': 'Bearer ' + localStorage.getItem('access_token')  // tslint:disable-line:object-literal-key-quotes
            })
          };
          return this.http.get<UserInfo>(INFO_API, opts).pipe(
            map(userInfo => {
              localStorage.setItem('username', userInfo.username);
              localStorage.setItem('enabled', String(userInfo.enabled));

              this.authStatus.next(true);

              this.toastService.presentToast('Login success', 'top');
            })
          );
        }),
        catchError(this.errorHandler)
      );
  }

  // Log user out, clear stored tokens
  deauthenticate() {
    const opts = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + localStorage.getItem('refresh_token')  // tslint:disable-line:object-literal-key-quotes
      })
    };
    localStorage.clear();
    this.authStatus.next(false);
    return this.http.post(LOGOUT_API, {}, opts)
      .pipe(
        map(response => null, this.toastService.presentToast('Logout success', 'top')),
        catchError(this.errorHandler)
      );
  }

  register(username: string, password: string, email: string, address: string, phone: string, picture: string, company: string) {

    return this.http.post<LoginResponse>(REGISTER_API, { username, password, email, address, phone, picture, company})
      .pipe(
        mergeMap(response => {
          // store JWTs

          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          // now get user info
          const opts = {
            headers: new HttpHeaders({
              'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            })
          };
          return this.http.get<UserInfo>(INFO_API, opts).pipe(
            map(userInfo => {
              localStorage.setItem('username', userInfo.username);
              localStorage.setItem('enabled', String(userInfo.enabled));

              this.authStatus.next(true);
              this.toastService.presentToast('Register success', 'top');
            })
          );
        }),
        catchError(this.errorHandler)
        
      );
  }

  // Get access token, automatically refresh if necessary
  getAccessToken(): Observable<string> {
    const access_token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');

    if (!this.jwt.isTokenExpired(access_token as string)) {
      return new BehaviorSubject<any>(access_token);
    } else if (!this.jwt.isTokenExpired(refresh_token as string)) {
      console.log('refreshing access token');
      const opts = {
        headers: new HttpHeaders({
          Authorization: 'Bearer ' + refresh_token
        })
      };
      return this.http.post<RefreshResponse>(REFRESH_API, {}, opts).pipe(
        map(response => {
          localStorage.setItem('access_token', response.access_token);
          console.log('authentication refresh successful');
          return response.access_token;
        })
      );
    } else {
      return throwError('refresh token is expired');
    }
  }

  // User is logged in
  isAuthenticated(): boolean {
    return localStorage.getItem('username') !== null &&
           localStorage.getItem('enabled') === '1' &&
           !this.jwt.isTokenExpired(localStorage.getItem('refresh_token') as string );
  }

  // get username
  getUsername(): string {
    return localStorage.getItem('username') as string;
  }
}