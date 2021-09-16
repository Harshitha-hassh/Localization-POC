import { Injectable } from '@angular/core';

import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ALLOWED_URL } from 'src/app/shared/enums/constants';
import { tap, catchError } from 'rxjs/operators';
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';
import { RetailIntegrationLogService } from 'src/app/retail/shared/service/retail-integrationLog.service';
import { Router } from '@angular/router';

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

  constructor(private router:Router ,private loggerService:RetailIntegrationLogService,
    private utils:CommonUtilities) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    try {
    
      const reqUrl = req.url.toLowerCase();
      const payAgentURI = JSON.parse(sessionStorage.getItem('paymentConfiguration'));
      const v1GiftcardRGuestPayURL = sessionStorage.getItem('v1GiftcardRGuestPayURL')
          let payURL:string ="";
          if(payAgentURI && payAgentURI.length > 0)
          {
              payURL = payAgentURI[0]?.configValue;
          }
      
          if(payURL != "" &&  reqUrl.includes(payURL.toLowerCase()) || (v1GiftcardRGuestPayURL && reqUrl.includes(v1GiftcardRGuestPayURL.toLowerCase())))
          {        
            
            let correlationId = this.utils.generateGUID();
            let screenURL = this.router.url;
            this.loggerService.sendLogData(req.urlWithParams.toString(),screenURL, JSON.stringify(req.body),"Before Response","CREATE",correlationId);  
              return next.handle(req).pipe(tap((event: any) => {             
                if(event.status)
                {                
                 this.loggerService.sendLogData(req.urlWithParams.toString(),screenURL,JSON.stringify(req.body),JSON.stringify(event.body)+" Status:" + event.status,"UPDATE",correlationId);
                }
              },
                (err: any) => {            
                  this.loggerService.sendLogData(req.urlWithParams.toString(),screenURL,JSON.stringify(req.body),JSON.stringify(err.error) + " Error Message: " + err.message,"UPDATE",correlationId);
                  
                }),            
            catchError(errs => {
              console.log("catchError -->", errs);
              return observableThrowError(errs);
            }),);       
            
          }

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

function observableThrowError(errs: any): any {
  throw errs;
}

