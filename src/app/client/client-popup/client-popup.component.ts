import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ViewContainerRef, ViewChild, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Localization } from 'src/app/common/shared/localization/Localization';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserAlerts } from 'src/app/common/shared/config/alerts-config';
import { PromptType, ButtonOptions } from 'src/app/common/shared/shared/globalsContant';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-client-popup',
  templateUrl: './client-popup.component.html',
  styleUrls: ['./client-popup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClientPopupComponent implements OnInit {

  captions:any;
  clientPopupForm:FormGroup;
  IsClientScreenDirty:boolean;
  private $destroyed: ReplaySubject<boolean> = new ReplaySubject();
  constructor(private dialog: MatDialog,
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public localization: Localization,
    private userAlert: UserAlerts,
    public _fb: FormBuilder) {

  }

  ngOnInit(): void {
    this.captions = this.localization.captions;
    this.clientPopupForm.statusChanges.pipe(takeUntil(this.$destroyed)).subscribe(x => {
      this.IsClientScreenDirty = !(this.clientPopupForm.valid && this.clientPopupForm.dirty);
    });
  }

  ngOnDestroy() {
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }

  validateSave(){
    return this.IsClientScreenDirty;
  }

  save(){
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
