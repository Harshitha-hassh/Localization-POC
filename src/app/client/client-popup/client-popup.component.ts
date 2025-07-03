import { Component, OnInit, ViewEncapsulation, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { UserAlerts } from 'src/app/common/shared/config/alerts-config';
import { PromptType, ButtonOptions, DefaultGUID, ButtonType } from 'src/app/common/shared/shared/globalsContant';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { CreateClientBusiness } from './client-popup.business';
import { ClientDataService } from 'src/app/shared/data-services/client.data.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailImageService } from 'src/app/shared/data-services/retail.image.service';
import { Utilities } from 'src/app/core/utilities';
import { ApplyPolicy } from 'src/app/common/consent-management/consent-management.model';
import { PolicyType } from 'src/app/common/shared/shared.modal';

@Component({
  selector: 'app-client-popup',
  templateUrl: './client-popup.component.html',
  styleUrls: ['./client-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CreateClientBusiness, ClientDataService]
})
export class ClientPopupComponent implements OnInit {
  
  @Output() showIframeGuestSearch = new EventEmitter();
  captions:any;
  clientPopupForm:UntypedFormGroup;
  clientInfo:any;
  patronId = '';
  IsClientScreenDirty:boolean;
  IsGDPREnabled : boolean = false;
  policyType : number = 0;
  private $destroyed: ReplaySubject<boolean> = new ReplaySubject();
  constructor(private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public localization: RetailLocalization,
    private userAlert: UserAlerts,
    public _fb: UntypedFormBuilder,
     public _imageService: RetailImageService,
    private _createClientBusiness: CreateClientBusiness,
    private utils: Utilities) {

  }

  ngOnInit(): void {
    this.captions = this.localization.captions;
    this.clientPopupForm = this._fb.group({});
    this.clientPopupForm.statusChanges.pipe(takeUntil(this.$destroyed)).subscribe(x => {
      this.IsClientScreenDirty = (this.clientPopupForm.valid && this.clientPopupForm.dirty);
    });

    if(this.data.patronId) {
      this.patronId = this.data.patronId;
    }

    if (this.data.isClientViewOnly && !this.data.isCopyClient) {
      this.utils.disableControls(this.clientPopupForm);
    }
    if (this.data && this.data.data && this.data.data != '' && this.data.data.client?.consentPolicyId > 0) {
      this.getPolicyTypebyPolicyId(this.data.data.client.consentPolicyId);
    }
    this.setIsGdprConfiguredFlag();
  }

  ngOnDestroy() {
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }

  validateSave(){
    return this.IsClientScreenDirty;
  }
  setIsGdprConfiguredFlag()
  {
    this._createClientBusiness.getIsGdprConfiguredFlag().then(res=>
      {
    this.IsGDPREnabled = !!res;
      });   
  }
  getPolicyTypebyPolicyId(consentPolicyId : number)
  {
    this._createClientBusiness.getPolicyTypeUsingPolicyId(consentPolicyId).then(
      res=>
      {
        this.policyType = res;
      }
    );
  }
  async save(){
    this.IsClientScreenDirty = false;
    this.clientInfo = this.clientPopupForm.getRawValue();
    this.clientInfo.personalDetailsFormGroup.imageReferenceId = DefaultGUID;
    if (this.data.isCopyClient) {
      this.clientInfo.personalDetailsFormGroup.id = 0;
      this.clientInfo.personalDetailsFormGroup.guestId = DefaultGUID;
    }
    try {
      var createPromise = await this._createClientBusiness.SubmitForm(this.clientInfo,false);
    }
    catch (err) {
      if (err && err.error) {
        let errMsg = this.localization.getError(err.error.errorCode);
        if (err.error.errorCode == 310002) {
          await this.utils.ShowError(this.localization.captions.common.Warning, errMsg, ButtonType.Ok)
            .afterClosed().toPromise();
          this.dialogRef.close(["ReloadClient", this.clientInfo.personalDetailsFormGroup.guestId]);
          return;
        }
        if(err.error.errorCode == 310001)
        {
          await this.utils.ShowError(this.localization.captions.common.Error, errMsg, ButtonType.Ok)
          .afterClosed().toPromise();
        }
        this.utils.showError(this.localization.getUnexpectedErrorMessage());
        return;
      }

    }
    if (this.clientInfo && this.clientInfo.personalDetailsFormGroup.id && this.clientInfo.personalDetailsFormGroup.imgReferenceId &&
      this.clientInfo.personalDetailsFormGroup.imgReferenceId != '' && this.clientInfo.personalDetailsFormGroup.guestId != DefaultGUID
     || this.clientInfo.personalDetailsFormGroup.isImageRemoved) {
      var b = await this._imageService.updateItemImage(createPromise.guestId.toString(), this.clientInfo.personalDetailsFormGroup.imageId, 
      this.clientInfo.personalDetailsFormGroup.imageReferenceId, this.clientInfo.personalDetailsFormGroup.isImageRemoved,
       this.clientInfo.personalDetailsFormGroup.base64textString,
       this.clientInfo.personalDetailsFormGroup.thumbnailImg);
    }
    else if (this.clientInfo.personalDetailsFormGroup.base64textString) {
       var a = await this._imageService.saveImage(createPromise.guestId.toString(), this.clientInfo.personalDetailsFormGroup.base64textString,
        this.clientInfo.personalDetailsFormGroup.thumbnailImg);
    }
    if(this.IsGDPREnabled && this.clientInfo.additionalDetailsFormGroup.consentPolicyId != 0 && ( this.clientInfo.personalDetailsFormGroup.id == '' || this.clientInfo.personalDetailsFormGroup.guestId == '' || this.clientInfo.personalDetailsFormGroup.guestId == DefaultGUID))
    {
      let applyPolicy : ApplyPolicy = {
        guestId: createPromise.guestId.toString(),
        consentDate : this.clientInfo.additionalDetailsFormGroup.consentDate,
        consentExpiryDate : this.clientInfo.additionalDetailsFormGroup.consentExpiryDate,
        policyId : this.clientInfo.additionalDetailsFormGroup.consentPolicyId,
        policyType: PolicyType.ConsentPolicy
      }
      this._createClientBusiness.updatePolicyDetailsForGuestId(applyPolicy);
    }
    this.closeDialog(createPromise);
    console.log("Client Form", this.clientPopupForm.value);
  }

  promptUserForUnsavedChanges(){
    this.showAlertForClient();
  }

  showAlertForClient(){
    if (this.IsClientScreenDirty) {
      this.userAlert.showPrompt(PromptType.UnsavedChanges, this.closeDialog.bind(this))
    } else {
      this.closeDialog();
    }
  }

  close(resultFromUserPrompt: string) {
    if (resultFromUserPrompt.toLowerCase() === ButtonOptions.Yes) {
      this.closeDialog();
    }
  }

  closeDialog(params?) {
    this.dialogRef.close(params);
  }

  onNoClick(){
    this.promptUserForUnsavedChanges();
  }

  showIframeGuestSearchFn(){
    this.showIframeGuestSearch.emit();
  }

}
