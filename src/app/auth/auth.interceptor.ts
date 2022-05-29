import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/share/service/auth.service';
import { Observable, throwError } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService,
              private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //!/.*\/api\/auth\/.*/.test(req.url)
    if (req.url.includes('/api/auth')) {
      return this.auth.getAccessToken().pipe(
        mergeMap((access_token: string) => {
          const reqAuth = req.clone({ setHeaders: { Authorization: `Bearer ${access_token}` } });
          return next.handle(reqAuth);
        }),
        catchError((err) => {
          console.error(err);
          this.router.navigate(['/login']);
          return throwError(err);
        })
      );
    } else {
      return next.handle(req);
    }
  }
}