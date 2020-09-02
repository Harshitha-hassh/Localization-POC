import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../../core/localization/retailStandalone-localization';
// import { Utilities } from '../../../../shared/utilities/utilities';
import { SettingsService } from '../../../settings.service';
// import { Host } from '../../../../shared/globalsContant';
// import { HttpMethod, HttpServiceCall } from '../../../../shared/service/http-call.service';
// import * as GlobalConst from '../../../../shared/globalsContant';
import * as _ from 'lodash';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { Product } from 'src/app/common/Models/common.models';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { HttpMethod } from 'src/app/common/Models/http.model';
import { Host } from 'src/app/common/shared/shared/globalsContant';
// import { BaseResponse } from '../../../../shared/business/shared.modals';

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
  isCommissionClassRequired = false;
  constructor(public localization: RetailStandaloneLocalization, private utils: Utilities,
              public servicesetting: SettingsService, private http: HttpServiceCall) {

  }

  ngOnInit() {
    this.caption = this.localization.captions;
    this.ActionButton = this.caption.setting.save;
    this.retailSettingsFormGrp = this.servicesetting.retailSettingsFormGrp;
    // this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;
    // if (this.IsReadOnly) {
    //   this._utilities.disableControls(this.retailSettingsFormGrp);
    // }
    this.roles = this.servicesetting.userRoles && this.servicesetting.userRoles.length > 0 ?
      this.servicesetting.userRoles.filter(x => x.active === true && x.productId.includes(Product.RETAIL)).map(x => ({ id: x.id, name: x.description }))
      : this.GetServiceCall('GetActiveUserRolesByPropertyId', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')), includeInActive: false });
    //this.GetServiceCall('GetActiveUserRole', { tenantId: Number(this._utilities.GetPropertyInfo('TenantId')) , includeInActive : false });
    if (!(this.servicesetting.propOutlets && this.servicesetting.propOutlets.length > 0)) {
      this.outlets = [];
    } else {
      this.outlets = [{ id: 0, name: 'ALL' }];
      const actOuts = this.servicesetting.propOutlets.map(x => ({ id: x.subPropertyID, name: x.subPropertyName }));
      this.outlets.push(...actOuts);
      this.utils.setUserAccessSettings(this.outlets, this.servicesetting.selectedOutlets);
    }
    const servicSettingControl = this.servicesetting.retailSettingsFormGrp.controls;
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
      this.servicesetting.selectedOutlets = this.utils.getToggleAllFilter(this.outlets, ga);
    } else {
      this.servicesetting.selectedOutlets = this.utils.getToggleFilter(this.outlets, ga, gv);
    }
    this.utils.setUserAccessSettings(this.outlets, this.servicesetting.selectedOutlets);
    this.servicesetting.isRadioButtonsChange = true;
  }

  sliderChange(event, type?) {
    const serviceSettingControl = this.servicesetting.retailSettingsFormGrp.controls;
    if (type === 'ALO') {
      serviceSettingControl.autologoff.setValue(event[0]);
    } else if (type === 'AC') {
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
    if (callDesc === 'GetActiveUserRolesByPropertyId') {
      if (result.result) {
        let data = result.result as any;
        data = data.filter(x => x.productId.includes(Product.RETAIL));
        this.roles = data.map(x => ({ id: x.id, name: x.description }));
      }
    } else if (callDesc === 'GetOutlets') {
      if (result.result) {
        this.servicesetting.propOutlets = result.result as any;
        const actOuts = this.servicesetting.propOutlets.map(x => ({ id: x.subPropertyId, name: x.subPropertyName }));
        this.outlets.push(...actOuts);
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  checkCommissionClassRequired(): void {
    this.isCommissionClassRequired = this.retailSettingsFormGrp && this.retailSettingsFormGrp.controls.commissionclass &&
     this.retailSettingsFormGrp.controls.commissionclass.value;
  }

}
