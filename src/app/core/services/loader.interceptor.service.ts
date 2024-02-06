import { Injectable } from '@angular/core';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ALLOWED_URL } from 'src/app/shared/enums/constants';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';
import { RetailIntegrationLogService } from 'src/app/retail/shared/service/retail-integrationLog.service';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class LoaderInterceptor implements HttpInterceptor {

  public count = 0;
  public statusCount = 0;
  public showLoader = true;

  constructor(private router: Router, private loggerService: RetailIntegrationLogService,
    private utils: CommonUtilities) { }

  CheckIfItsPMAgentCall(req: HttpRequest<any>): boolean {
    const reqUrl = req.url.toLowerCase();
    const payAgentURI = JSON.parse(sessionStorage.getItem('paymentConfiguration'));
    const v1GiftcardRGuestPayURL = sessionStorage.getItem('v1GiftcardRGuestPayURL');
    const v1GiftcardRGuestPayCardCaptureRoute = 'cardcapture';
    const isRguestPayPooling = (req.urlWithParams.toString().includes(v1GiftcardRGuestPayCardCaptureRoute) && req.method == 'GET');
    const isSkipPMAgentCall = req.urlWithParams.toString().includes("skipLog");
    let payURL: string = "";
    if (payAgentURI && payAgentURI.length > 0) {
      payURL = payAgentURI[0]?.configValue;
    }
    const rGuestPayURLs = [
      v1GiftcardRGuestPayURL + "/device",
      v1GiftcardRGuestPayURL + "/ondemand/cardcapture/device"
    ]
    return (payURL != "" && reqUrl.includes(payURL.toLowerCase()) || (v1GiftcardRGuestPayURL && rGuestPayURLs.some(r => reqUrl.includes(r.toLowerCase())) && !isRguestPayPooling && !isSkipPMAgentCall))
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const isPMAgentCall = this.CheckIfItsPMAgentCall(req);
      let correlationId = this.utils.generateGUID();
      let screenURL = this.router.url;
      if (isPMAgentCall) {
        this.loggerService.sendLogData(req.urlWithParams.toString(), screenURL, JSON.stringify(req.body), "Before Response", "CREATE", correlationId);
      }
      const loadingContainer = document.getElementById('cover-spin');
      const ApiEndUrl = req.url.split('/').pop().toString().toLowerCase();
      const AllowedUrl = (ALLOWED_URL.indexOf(ApiEndUrl) !== -1);
      if (AllowedUrl) {
        loadingContainer.style.display = 'block';
      }
      this.count++;

      return this.loggerService.GetRequestId(isPMAgentCall, this.router.url, req).pipe(
        switchMap(integrationOpLogResponse => {
          const updatedReq = req.clone({
            body: isPMAgentCall ? this.loggerService.SetRequestIdAndTransactionType(req.body, integrationOpLogResponse?.result) : req.body,
          });
            return next.handle(updatedReq).pipe(tap((event: any) => {
            if (isPMAgentCall && event.status) {
              this.loggerService.sendLogData(req.urlWithParams.toString(), screenURL, JSON.stringify(req.body), JSON.stringify(event.body) + " Status:" + event.status, "UPDATE", correlationId);
            }
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
              if (isPMAgentCall) {
                this.loggerService.sendLogData(req.urlWithParams.toString(), screenURL, JSON.stringify(req.body), JSON.stringify(err.error) + " Error Message: " + err.message, "UPDATE", correlationId);
              }
            }), catchError(err => {
              if (loadingContainer != null) {
                loadingContainer.style.display = 'none';
              }
              return throwError(err);
            }));
        })
      );

    } catch (ex) {
      console.log('Spinner issue caught -> ', ex);
    }
  }
}