import { Injectable } from '@angular/core';
import { Host, ServiceParams, BaseResponse } from '../shared/models/http.model';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Localization } from 'src/app/core/localization/Localization';
import { HttpCallService } from '../shared/communication/common/http-call.service';
import { Observable } from 'rxjs';
import { AlertType } from '../shared/shared-models';
import { PropertyInformation } from '../core/services/property-information.service';
import { Utilities } from '../core/utilities';

@Injectable({
  providedIn: 'root'
})
export class LoginCommunicationService extends HttpCallService {

  private utils: Utilities;
  constructor(httpclient: HttpClient, localization: Localization, utilities: Utilities, PropertyInfo: PropertyInformation) {
    super(RetailApiHost.TenantManagement, httpclient, localization, utilities, PropertyInfo);
    this.utils = utilities;
  }

  public async makePostCall<T>(params: ServiceParams, handleErr: boolean = true) {
    const response$: Promise<BaseResponse<T>> = super.postPromise<BaseResponse<T>>(params);
    // on error =>
    response$.catch(err => this.error(err, handleErr));
    // on success =>
    const response: any = await response$;
    return response;
  }
  public async makePutCall<T>(params: ServiceParams, handleErr: boolean = true) {
    const response$: Promise<BaseResponse<T>> = super.putPromise<BaseResponse<T>>(params);
    // on error =>
    response$.catch(err => this.error(err, handleErr));
    // on success =>
    const response: any = await response$;
    return response;
  }
  public async makeGetCall<T>(params: ServiceParams, handleErr: boolean = true): Promise<T> {
    const response$: Promise<BaseResponse<T>> = super.getPromise<BaseResponse<T>>(params);

    // on error =>
    response$.catch(err => this.error(err, handleErr));

    // on success =>
    const response: any = await response$;
    return response;
}
  private error(err: HttpErrorResponse, handleErr: boolean) {
    if (handleErr) {
      this.errorHandler(err);
    } else {
      throw err;
    }
  }
  protected errorHandler(err: HttpErrorResponse): void {
    const code = parseInt(err.error.errorCode);
    const message: string = this.localization.getError(isNaN(code) ? undefined : code);
    this.utils.showAlert(message, AlertType.Error);
}

}
