import { Injectable } from '@angular/core';

import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ALLOWED_URL } from 'src/app/shared/enums/constants';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  // constructor() { }

  // intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   return next.handle(
  //     req.clone({
  //       //headers: req.headers.append('Authorization', 'Bearer THIS_IS_THE_ACCESS_TOKEN')
  //     })
  //   );
  // }

  public count = 0;
  public statusCount = 0;
  public showLoader = true;

  constructor() { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    try {
      const loadingContainer = document.getElementById('cover-spin');
      const ApiEndUrl = req.url.split('/').pop().toString().toLowerCase();
      const AllowedUrl = (ALLOWED_URL.indexOf(ApiEndUrl) !== -1);
      if (AllowedUrl) {
        loadingContainer.style.display = 'block';
      }
      this.count++;

      return next.handle(req).pipe(tap((event: any) => {
        if (event.status === 200) {
          this.statusCount++;
          if (this.count === this.statusCount) {
            if (loadingContainer != null) {
              loadingContainer.style.display = 'none';
            }
          }
        }
      },
        (err: any) => {
          this.statusCount++;
          if (this.count === this.statusCount) {
            if (loadingContainer != null) {
              loadingContainer.style.display = 'none';
            }
          }
        }), catchError(err => {
          if (loadingContainer != null) {
            loadingContainer.style.display = 'none';
          }
          return throwError(err);
        }));

    } catch (ex) {
      console.log('Spinner issue caught -> ', ex);
    }
  }
}
