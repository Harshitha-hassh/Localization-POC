import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserAlerts } from 'src/app/common/shared/config/alerts-config';
import { PromptType, ButtonOptions, DefaultGUID } from 'src/app/common/shared/shared/globalsContant';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { CreateClientBusiness } from './client-popup.business';
import { ClientDataService } from 'src/app/shared/data-services/client.data.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailImageService } from 'src/app/shared/data-services/retail.image.service';
import { Utilities } from 'src/app/core/utilities';

@Component({
  selector: 'app-client-popup',
  templateUrl: './client-popup.component.html',
  styleUrls: ['./client-popup.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CreateClientBusiness, ClientDataService]
})
export class ClientPopupComponent implements OnInit {

  captions:any;
  clientPopupForm:FormGroup;
  clientInfo:any;
  patronId = '';
  IsClientScreenDirty:boolean;
  private $destroyed: ReplaySubject<boolean> = new ReplaySubject();
  constructor(private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public localization: RetailLocalization,
    private userAlert: UserAlerts,
    public _fb: FormBuilder,
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

    if (this.data.isClientViewOnly) {
      this.utils.disableControls(this.clientPopupForm);
    }
  }

  ngOnDestroy() {
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }

  validateSave(){
    return this.IsClientScreenDirty;
  }

  async save(){
    this.IsClientScreenDirty = false;
    this.clientInfo = this.clientPopupForm.value;
    this.clientInfo.personalDetailsFormGroup.imageReferenceId = DefaultGUID ;
    var createPromise = await this._createClientBusiness.SubmitForm(this.clientInfo);
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


}
