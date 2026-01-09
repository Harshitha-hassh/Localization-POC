import { Component, OnInit, Inject, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTab, MatTabHeader, MatTabGroup } from '@angular/material/tabs';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { UntypedFormGroup } from '@angular/forms';
@Component({
  standalone: false,
  selector: 'app-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent implements OnInit, OnDestroy {
  @Input() parentForm:UntypedFormGroup;
  @Input() patronId:any; 
  @Input() IsGDPREnabled : boolean = false;
  @Input() policyType : number = 0;
  @Input() clientInfoData : any;
  clientInfoInput:any;
  @ViewChild('clientTabGroup', { static: true }) tabGroup: MatTabGroup;
  captions: any = this.localization.captions.bookAppointment;
  clientSelectedTab: number;
  guestId: any;
  isCopyClient = false;
  @Output() showIframeGuestSearch = new EventEmitter();
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    public localization: RetailStandaloneLocalization) { }

  ngOnInit() {
    this.isCopyClient = this.data.isCopyClient;
    if(this.data && this.data.data){
      this.guestId =  this.data.data.guestId;
    }
    this.bindApiData();
    this.tabGroup._handleClick = this.handleTabChange.bind(this);    
  }

  ngOnDestroy() {

  }
   bindApiData() {
      this.clientInfoInput = this.data;
    }
  onImageUpdates(isClientFormValid) {

   //this.notifyParent.emit(isClientFormValid);
 
  }
  handleTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {

    if(this.data.mode == 'EDIT' && this.clientSelectedTab == 1 && this.parentForm.get('additionalDetailsFormGroup') && this.parentForm.get('additionalDetailsFormGroup').invalid){
      return false && MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
    }
    this.clientSelectedTab = idx;
    return true && MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
  }

  showIframeGuestSearchFn() {
    this.showIframeGuestSearch.emit();
  }
}
