import { Component, OnInit, Inject } from '@angular/core';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
// import { AlertMessagePopupComponent } from '../../../shared/alert-message-popup/alert-message-popup.component';
// import { ViewSettingClientBusiness } from '../../../shared/common-functionalities/business/view-settings.business';
import * as _ from 'lodash';
// import { HttpServiceCall, HttpMethod } from '../../../shared/service/http-call.service';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { CommonAlertMessagePopupComponent } from 'src/app/common/shared/shared/alert-message-popup/alert-message-popup.component';
import { BaseResponse } from 'src/app/common/shared/shared.modal';

@Component({
  selector: 'app-copy-roles',
  templateUrl: './copy-roles.component.html',
  styleUrls: ['./copy-roles.component.scss']
})
export class CopyRolesComponent implements OnInit {
  captions: any = this.localization.captions.userConfig;
  sampleOptionsTemp: any;
  secondOptionsSet: any;
  sampleOptions: any = [{ id: 1, name: 'System Administrator' }, { id: 2, name: 'Advanced User' }];
  roleGrp: FormGroup;

  constructor(private http: HttpServiceCall, public localization: RetailStandaloneLocalization, @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    // private _viewSetting: ViewSettingClientBusiness,
    private dialogRef: MatDialogRef<CopyRolesComponent>, private dialog: MatDialog, private utils: Utilities) {

  }

  ngOnInit() {
    this.roleGrp = this.fb.group({
      copyFrom: ['', Validators.required],
      copyTo: ['', Validators.required]
    });
    // this._viewSetting.activeFormGroup = this.roleGrp;
    this.roleGrp.controls.copyTo.disable();
    this.getUserRoles();
  }

  Cancel() {
    this.dialogRef.close();
  }

  getUserRoles() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetActiveUserRole',
      method: HttpMethod.Get,
      uriParams: { tenantId: Number(this.utils.GetPropertyInfo('TenantId')), includeInActive: false },
      showError: true,
      extraParams: [false]
    });
    // return this.userRoles;
  }

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'GetActiveUserRole') {
      this.sampleOptions = result.result ? result.result : [];
      this.sampleOptions = this.sampleOptions.filter(x => x.propertyId === Number(this.utils.GetPropertyInfo('PropertyId'))
        && x.productId.find(x => x === Number(this.utils.GetPropertyInfo('ProductId'))));
      this.sampleOptionsTemp = _.cloneDeep(this.sampleOptions);
    } else if (callDesc == 'CopyUserRoles') {
      this.dialogRef.close();
      const dialogRef = this.dialog.open(CommonAlertMessagePopupComponent, {
        width: '305px',
        height: '300px',
        hasBackdrop: true,
        panelClass: 'small-popup',
        data: {
          headername: this.captions.wellDone,
          headerIcon: 'icon-success-icon',
          headerMessage: this.captions.configSuccessFrom + ' ' + this.roleGrp.controls.copyFrom.value + ' ' + this.captions.configSuccessTo + ' ' + this.roleGrp.controls.copyTo.value,
          buttonName: this.captions.okay, type: 'message'
        },
        disableClose: true
      });
    }
  }

  errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  CopyRoles(from: number, to: number) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'CopyUserRoles',
      method: HttpMethod.Post,
      uriParams: { from, to },
      showError: true,
      extraParams: [false]
    });
  }

  SaveCopyRoles() {
    const from: number = this.sampleOptions.find(x => x.description == this.roleGrp.value.copyFrom).id;
    const to: number = this.sampleOptions.find(x => x.description == this.roleGrp.value.copyTo).id;
    this.CopyRoles(from, to);
  }

  configChanged(event) {
    this.secondOptionsSet = _.reject(this.sampleOptionsTemp, ['description', event.value]);
    this.roleGrp.controls.copyTo.enable();
  }
}
