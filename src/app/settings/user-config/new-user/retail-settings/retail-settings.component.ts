import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Localization } from '../../../../core/localization/Localization';
import { Utilities } from '../../../../shared/utilities/utilities';
import { SettingsService } from '../../../settings.service';
import { Host } from '../../../../shared/globalsContant';
import { HttpMethod, HttpServiceCall } from '../../../../shared/service/http-call.service';
import * as GlobalConst from '../../../../shared/globalsContant';
import * as _ from 'lodash';
import { BaseResponse } from '../../../../shared/business/shared.modals';

@Component({
  selector: 'app-retail-settings',
  templateUrl: './retail-settings.component.html',
  styleUrls: ['./retail-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RetailSettingsComponent implements OnInit {
  roles: any[] = [];
  outlets: any[];
  caption: any;
  IsReadOnly: boolean;
  retailSettingsFormGrp: FormGroup;
  ActionButton: string;
  @Input() IsRoleSelected: any;
  isCommissionClassRequired: boolean = false;
  constructor(public localization: Localization, private _utilities: Utilities,
    public _servicesetting: SettingsService, private http: HttpServiceCall) {

  }

  ngOnInit() {
    this.caption = this.localization.captions;
    this.ActionButton = this.caption.setting.save;
    this.retailSettingsFormGrp = this._servicesetting.retailSettingsFormGrp;
    this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;
    if (this.IsReadOnly) {
      this._utilities.disableControls(this.retailSettingsFormGrp);
    }
    this.roles = this._servicesetting.userRoles && this._servicesetting.userRoles.length > 0 ? this._servicesetting.userRoles.filter(x => x.active === true  && x.productId.includes(GlobalConst.Product.RETAIL)).map(x => { return { id: x.id, name: x.description } }) : this.GetServiceCall('GetActiveUserRolesByPropertyId', {propertyId: Number(this._utilities.GetPropertyInfo('PropertyId')) , includeInActive : false});
    //this.GetServiceCall('GetActiveUserRole', { tenantId: Number(this._utilities.GetPropertyInfo('TenantId')) , includeInActive : false });
    if (!(this._servicesetting.propOutlets && this._servicesetting.propOutlets.length > 0)) {
      this.outlets = [];
    }
    else {
      this.outlets = [{ id: 0, name: 'ALL' }]
      let actOuts = this._servicesetting.propOutlets.map(x => { return { id: x.subPropertyID, name: x.subPropertyName } });
      this.outlets.push(...actOuts);
      this._utilities.setUserAccessSettings(this.outlets, this._servicesetting.selectedOutlets);
    }
    let servicSettingControl = this._servicesetting.retailSettingsFormGrp.controls;
    if (!servicSettingControl.autologoff.value) {
      servicSettingControl.logoffafter.disable();
    } else {
      servicSettingControl.logoffafter.enable();
    }
    if (!servicSettingControl.allowcommission.value) {
      servicSettingControl.commissionclass.disable();
    } else {
      servicSettingControl.commissionclass.enable();
    }
    this.checkCommissionClassRequired();
  }

  OnRoleChange(event) {
    this.IsRoleSelected = true;
  }

  ButtonToggle(ga, gv) {
    if (gv.id === 0) {
      this._servicesetting.selectedOutlets = this._utilities.getToggleAllFilter(this.outlets, ga);
    } else {
      this._servicesetting.selectedOutlets = this._utilities.getToggleFilter(this.outlets, ga, gv);
    }
    this._utilities.setUserAccessSettings(this.outlets, this._servicesetting.selectedOutlets);
    this._servicesetting.isRadioButtonsChange = true;
  }

  sliderChange(event, type?) {
    let serviceSettingControl = this._servicesetting.retailSettingsFormGrp.controls;
    if (type == 'ALO') {
      serviceSettingControl.autologoff.setValue(event[0]);
    }
    else if (type == 'AC') {
      serviceSettingControl.allowcommission.setValue(event[0]);
      if (event[0]) {
        serviceSettingControl.commissionclass.setValue(serviceSettingControl.commissionclass.value == 0 ? "" : serviceSettingControl.commissionclass.value);
      }
      this.checkCommissionClassRequired();
    }
    if (!serviceSettingControl.autologoff.value) {
      serviceSettingControl.logoffafter.disable();
    } else {
      serviceSettingControl.logoffafter.enable();
    }
    if (!serviceSettingControl.allowcommission.value) {
      serviceSettingControl.commissionclass.disable();
    } else {
      serviceSettingControl.commissionclass.enable();
    }
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

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'GetActiveUserRolesByPropertyId') {
      if (result.result) {
        let data = <any>result.result;
        data = data.filter(x => x.productId.includes(GlobalConst.Product.RETAIL)) ;
        this.roles = data.map(x => { return { id: x.id, name: x.description } });
      }
    }
    else if (callDesc == 'GetOutlets') {
      if (result.result) {
        this._servicesetting.propOutlets = <any>result.result;
        let actOuts = this._servicesetting.propOutlets.map(x => { return { id: x.subPropertyId, name: x.subPropertyName } })
        this.outlets.push(...actOuts);
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  checkCommissionClassRequired(): void {
   this.isCommissionClassRequired = this.retailSettingsFormGrp && this.retailSettingsFormGrp.controls.commissionclass && this.retailSettingsFormGrp.controls.commissionclass.value;
  }

}
