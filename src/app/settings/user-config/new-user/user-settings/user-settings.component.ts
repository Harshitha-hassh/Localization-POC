import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Localization } from '../../../../core/localization/Localization';
import { SettingsService } from '../../../settings.service';
import { HttpServiceCall, HttpMethod } from '../../../../shared/service/http-call.service';
import { Host } from '../../../../shared/globalsContant';
import * as GlobalConst from '../../../../shared/globalsContant';
import { Utilities } from '../../../../shared/utilities/utilities';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { BaseResponse } from '../../../../shared/business/shared.modals';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  caption: any;
  languages: any[] = [];
  accesses: any[] = [];
  selectedAccess: any[] = [];
  minDateValue: any;
  IsReadOnly: boolean;
  userSettingsFormGrp: FormGroup;
  ActionButton: string;

  constructor(public localization: Localization, public _servicesetting: SettingsService,
    private http: HttpServiceCall, private utils: Utilities, private PropertyInfo: PropertyInformation) {

  }

  ngOnInit() {
    this.caption = this.localization.captions;
    this.ActionButton = this.caption.setting.save;
    this.userSettingsFormGrp = this._servicesetting.userSettingsFormGrp;
    this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;
    if (this.IsReadOnly) {
      this.utils.disableControls(this.userSettingsFormGrp);
    }
    this.minDateValue = this.utils.getDate(this.PropertyInfo.CurrentDate);
    // this.GetServiceCall('GetPropLanguages', {propertyId: 1});
    this.GetServiceCall('GetAllLanguages');
    this.GetServiceCall('GetPropLanguages', { propertyId: this.utils.GetPropertyInfo("PropertyId") });
    this.GetServiceCall('GetStandAloneProducts');
    this.GetRetailServiceCall('GetSubPropertyAccessByUser', { userId: this.utils.GetPropertyInfo("UserId") });
  }

  ButtonToggle(ga, gv) {
    if (ga.indexOf(gv) == -1) {
      ga.push(gv);
    } else {
      ga.splice(ga.indexOf(gv), 1);
    }
    this.utils.setUserAccessSettings(this.accesses, this._servicesetting.selectedAccess);
    this._servicesetting.isRadioButtonsChange = true;
  }

  isExist(coll, obj) {
    let index = -1;
    if (coll && obj) {
      index = coll.findIndex(x => { return ((x.id && x.id == 0) ? x.id : x) == obj });
    }
    return index;
  }

  sliderChange(event) {

  }

  GetServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  GetRetailServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.retailManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }



  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'GetAllLanguages') {
      if (result.result) {
        let data = <any>result.result;
        this.languages = data.map(x => { return { id: x.id, name: x.languageName, code: x.languageCode } });
      }
    }
    else if (callDesc == 'GetPropLanguages') {
      if (result.result) {
        let data = <any>result.result;
        this.userSettingsFormGrp.controls.language.setValue(data);
      }
    }
    else if (callDesc == 'GetStandAloneProducts') {
      if (result.result) {
        this._servicesetting.products = <any>result.result;
        let products: number[] = [GlobalConst.Product.SPA, GlobalConst.Product.RETAIL];
        this.accesses = this._servicesetting.products.filter(r => products.includes(r.id)).map(x => { return { id: x.id, name: x.productName } });
        this.utils.setUserAccessSettings(this.accesses, this._servicesetting.selectedAccess);
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

}
