import { Component, OnInit, Inject, OnDestroy, Input, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatTab, MatTabHeader, MatTabGroup } from '@angular/material';
import { Localization } from '../../../core/localization/Localization';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit, OnDestroy {
  @Input() parentForm:FormGroup;
  clientInfoInput:any;
  @ViewChild('clientTabGroup', { static: true }) tabGroup: MatTabGroup;
  captions: any = this.localization.captions.bookAppointment;
  clientSelectedTab: number;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public localization: Localization) { }

  ngOnInit() {
    this.bindApiData();
    this.tabGroup._handleClick = this.handleTabChange.bind(this);
  }

  ngOnDestroy() {

  }
   bindApiData() {
      this.clientInfoInput = this.data;
    }
  onImageUpdates(isPlayerFormValid) {

  // this.notifyParent.emit(isPlayerFormValid);
 
  }
  handleTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {

    if(this.data.mode == 'EDIT' && this.clientSelectedTab == 1 && this.parentForm.get('additionalDetailsFormGroup') && this.parentForm.get('additionalDetailsFormGroup').invalid){
      return false && MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
    }
    this.clientSelectedTab = idx;
    return true && MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
  }
}
