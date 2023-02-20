import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertAction, AlertType, ButtonTypes } from 'src/app/common/enums/shared-enums';
import { Localization } from 'src/app/common/shared/localization/Localization';
import { ApplyPolicy, DataPurge, GuestPolicyDetail } from 'src/app/common/shared/shared.modal';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Module, Host } from 'src/app/common/shared/shared/globalsContant';
import { BaseResponse } from 'src/app/common/shared/shared/business/shared.modals';

@Component({
  selector: 'app-guest-policy-wrapper',
  templateUrl: './guest-policy-wrapper.component.html',
  styleUrls: ['./guest-policy-wrapper.component.scss'],
})
export class GuestPolicyWrapperComponent implements OnInit {
  captions: any;
  guestPolicyDetail : GuestPolicyDetail;
  constructor(private _localization: Localization, private dialogRef: MatDialogRef<any>,   private http: HttpServiceCall
    , @Inject(MAT_DIALOG_DATA) public dialogData , private _utils: Utilities) {
    this.captions = this._localization.captions;
    this.guestPolicyDetail = dialogData.guestPolicyDetail as GuestPolicyDetail;
  }
  ngOnInit(): void {
  }
  close() {
    this.dialogRef.close();
  }
  onCancel(e) {
    this.dialogRef.close();
  }
  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == "ApplyDataPolicyPurgeForGuestId") {
      if (result) {
        this._utils.showCommonAlert(this.captions.lbl_dataPurgingCompleted, AlertType.Done, ButtonTypes.Ok, async (res) => {
          if (res === AlertAction.CONTINUE) {
            this.dialogRef.close(true);
          }
        });
      }
      else {
        this._utils.showCommonAlert(this.captions.lbl_ErrWilePurging, AlertType.Warning, ButtonTypes.Ok);
        this.dialogRef.close(false);
      }
    }
    if (callDesc == "UpdateConsentPolicyDetailsForGuestId") {
      let successMsg = this._localization.replacePlaceholders(this.captions.consentPolicyEnabled, ['consentPolicy'], ['']);
      this._utils.showCommonAlert(successMsg, AlertType.Done, ButtonTypes.Ok, async (res) => {
        if (res === AlertAction.CONTINUE) {
          this.dialogRef.close(extraParams[0]);
        }
      })
    }
   if (callDesc == "GetPolicyTypeUsingPolicyId") {
    }
  }
   errorCallback<T>(): void {
  }
  makeHttpUpdatePolicyDetailsForGuestIdCall(applyPolicy: ApplyPolicy) {
    this.http.CallApiWithCallback<any[]>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "UpdateConsentPolicyDetailsForGuestId",
      uriParams: { module: Module.client },
      method: HttpMethod.Post,
      body: applyPolicy,
      showError: false,
      extraParams: [applyPolicy]
    });
  }
  makeHttpApplyDataPolicyPurgeForGuestIdCall(dataPurge: DataPurge) {
    this.http.CallApiWithCallback<any[]>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "ApplyDataPolicyPurgeForGuestId",
      uriParams: { module: Module.client },
      method: HttpMethod.Post,
      body: dataPurge,
      showError: false,
      extraParams: [dataPurge]
    });
  }
  makeHttpGetPolicyTypeUsingPolicyIdCall(policyId: number) {
    this.http.CallApiWithCallback<any[]>({
      host: Host.retailPOS,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: "GetPolicyTypeUsingPolicyId",
      uriParams: { module: Module.client },
      method: HttpMethod.Get,
      showError: false,
      extraParams: []
    });
  }
  async UpdatePolicyDetailsForGuestId(applyPolicy: ApplyPolicy) {
    this.makeHttpUpdatePolicyDetailsForGuestIdCall(applyPolicy);
  }
  async ApplyDataPolicyPurgeForGuestId(dataPurge: DataPurge) {
    this._utils.showCommonAlert(this.captions.lbl_doYouWantToPurge, AlertType.CustomDefault, ButtonTypes.YesNo, async (res) => {
      if (res === AlertAction.YES) {
        this.makeHttpApplyDataPolicyPurgeForGuestIdCall(dataPurge);

      }
    })
  }
  async exportSendMail(value) {

  }
}
