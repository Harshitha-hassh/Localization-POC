import { Component, OnInit, Input, ViewEncapsulation, ViewChild, AfterViewInit, OnChanges, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { SettingsService } from '../../settings.service';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray } from '@angular/forms';
import { AccordianInput } from './accordian-user-config.model';

@Component({
  standalone: false,
  selector: 'app-accordian-user-config',
  templateUrl: './accordian-user-config.component.html',
  styleUrls: ['./accordian-user-config.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccordianUserConfigComponent implements OnInit, AfterViewInit {
  _inputData: AccordianInput[];
  @Input('inputData')
  set inputsValues(value){
    this._inputData = value;
    if(this._inputData){
      this.initializeForm();
    }
  }
  @Input() IsReadOnly: boolean;
  @ViewChild('ExapanedPanel') ExapanedPanel;
  captions: any = this.localization.captions.userConfig;
  selectedCount: any = [];
  userRoleGroup: UntypedFormGroup;
  userDetails: UntypedFormArray;
  userClaims: UntypedFormArray;  
  allowAllToggle: boolean[] = [];
  viewAllToggle: boolean[] = [];
  disableViewAllToogle: boolean[] = [];
  @Output() changedData: EventEmitter<any> = new EventEmitter();
  @Input('expandCollapse')
  set expandCollapse(isExpand){
    if(isExpand){
      this.expandAll();
    } else{
      this.collapseAll();
    }
  }

  constructor(public _settingService: SettingsService, public localization: RetailStandaloneLocalization, private fb: UntypedFormBuilder) {

  }

  ngOnInit() {
    this._settingService.changedBreakPoints = [];
    this.initializeForm();
  }

  initializeForm() {
    this.userRoleGroup = this.fb.group({
      userDetails: this.fb.array([this.createUserDetails(0)])
    });
    this.findLength();
    this.UpdateCount();
    if (this._inputData) {
      this.addUserDetails();
      setTimeout(this.setHeightforAccordian, 500);
    }
  }

  ngAfterViewInit() {

  }

  createUserDetails(i): UntypedFormGroup {
    return this.fb.group({
      count: '',
      description: '',
      id: '',
      localeId: '',
      userClaims: this.fb.array([this.createClaimDetails(0)])
    });
  }

  createClaimDetails(i): UntypedFormGroup {
    return this.fb.group({
      allow: false,
      breakPointNumber: '',
      description: '',
      userClaimId: '',
      userRoleId: '',
      view: false,
      viewOnlyAllowed: '',
      breakPointId: ''
    });
  }
  showAllAppointments(data, i, j, k, keyWord, $event) {
    if (keyWord == 'allow') {
      data.controls.allow.value = $event;
      this._inputData[i].headerData.details[j].userClaims[k].allow = data.controls.allow.value;
      if (data.controls.allow.value) {
        data.controls.view.setValue(false);
        this._inputData[i].headerData.details[j].userClaims[k].view = false;
      }
      let selectedData = data.controls;
      let idx = _.findIndex(this._settingService.changedBreakPoints, (x) => { return x["breakPointNumber"] == selectedData.breakPointNumber.value });
      if (idx == -1) {
        this.setBreakPoints(selectedData);
      } else {
        this._settingService.changedBreakPoints.splice(idx, 1);
        this.setBreakPoints(selectedData);
      }
    }
    else {
      data.controls.view.value = $event;
      let selectedData = data.controls;
      this._inputData[i].headerData.details[j].userClaims[k].view = data.controls.view.value;
      if (data.controls.view.value) {
        data.controls.allow.setValue(false);
        this._inputData[i].headerData.details[j].userClaims[k].allow = false;
      }
      let idx = _.findIndex(this._settingService.changedBreakPoints, (x) => { return x["breakPointNumber"] == selectedData.breakPointNumber.value });
      if (idx == -1) {
        this.setBreakPoints(selectedData);
      } else {
        this._settingService.changedBreakPoints.splice(idx, 1);
        this.setBreakPoints(selectedData);
      }
    }
    this.findLength();
    this.updateAllowViewAllControls(this._inputData[i].headerData.details[j], j);
  }

  setBreakPoints(selectedData) {
    this._settingService.changedBreakPoints.push({
      allow: selectedData.allow.value,
      breakPointNumber: selectedData.breakPointNumber.value,
      description: selectedData.description.value,
      userClaimId: selectedData.userClaimId.value,
      userRoleId: selectedData.userRoleId.value,
      view: selectedData.view.value,
      viewOnlyAllowed: selectedData.viewOnlyAllowed.value,
      breakPointId: selectedData.breakPointId.value
    });
  }

  findLength() {
    _.forEach(this._inputData, function (value) {
      _.forEach(value['details'], function (dataValue) {
        dataValue.count = _.filter(dataValue.userClaims, ['allow', true]).length + _.filter(dataValue.userClaims, ['view', true]).length;
      });
    });
    this.UpdateCount();
  }

  onOpenClick(itemDetails, index) {
    itemDetails.isOpened = true;
    this.allowAllToggle[index] = (itemDetails.userClaims.length === itemDetails.userClaims.filter(x=>x.allow).length);
    this.disableViewAllToogle[index] = (itemDetails.userClaims.filter(x=>x.viewOnlyAllowed).length === 0);
    const selectedView = itemDetails.userClaims.filter(x=>x.viewOnlyAllowed && x.view);
    this.viewAllToggle[index] = (selectedView.length > 0 && itemDetails.userClaims.filter(x=>x.viewOnlyAllowed).length === selectedView.length);
  }

  onToggleClick(event: Event) {
    event.stopPropagation();
  }

  allowAll(userDetail: UntypedFormGroup, itemDetail, isChecked, index) {
    const userClaims = userDetail.controls.userClaims as UntypedFormArray;
    itemDetail.userClaims.forEach(element => {
      element.allow = isChecked;
      if(isChecked && element.viewOnlyAllowed) {
        element.view = false;
      }
    });
    for(let index in userClaims.controls) {
      let userClaim = userClaims.controls[index] as UntypedFormGroup;
      userClaim.controls['allow'].setValue(isChecked);
      if(isChecked && userClaim.controls['viewOnlyAllowed'].value) {
        userClaim.controls['view'].setValue(!isChecked);
      }
      this.updateSelectedData(userClaim);
    }
    this.updateAllowViewAllControls(itemDetail, index);
  }

  viewAll(userDetail, itemDetail, isChecked, index) {
    if (isChecked) {
      itemDetail.userClaims.forEach(element => {
        element.allow = !isChecked;
        if (element.viewOnlyAllowed) {
          element.view = isChecked;
        }
      });
    }else {
      itemDetail.userClaims.forEach(element => {
        if (element.viewOnlyAllowed) {
          element.view = isChecked;
        }
      });
    }
    const userClaims = userDetail.controls.userClaims as UntypedFormArray;
    for(let index in userClaims.controls) {
      let userClaim = userClaims.controls[index] as UntypedFormGroup;
      if(isChecked) {
        userClaim.controls['allow'].setValue(!isChecked);
      }
      if(userClaim.controls['viewOnlyAllowed'].value) {
        userClaim.controls['view'].setValue(isChecked); 
      }
      this.updateSelectedData(userClaim);
    }
    this.updateAllowViewAllControls(itemDetail, index);
  }


  addUserDetails() {
    this.userDetails = this.userRoleGroup.get('userDetails') as UntypedFormArray;
    this.userDetails.removeAt(0);
    if (this._inputData) {
      _.forEach(this._inputData[0].headerData.details, (user, i) => {
        this.userDetails.push(this.fb.group({
          count: user.count,
          description: user.description,
          id: user.id,
          localeId: user.localeId,
          userClaims: this.fb.array([])
        }))
      });
      _.forEach(this._inputData[0].headerData.details, (user, i) => {
        this.allowAllToggle[i] = false;
        this.viewAllToggle[i] = false;
        this.disableViewAllToogle[i] = false;
        this.userClaims = this.userRoleGroup.get(['userDetails', i, 'userClaims']) as UntypedFormArray;
        _.forEach(user.userClaims, (claim, j) => {
          this.userClaims.push(this.addUserClaims(i, user.id, claim));
        })
      })
    }
  }
  addUserClaims(i, id, claim): UntypedFormGroup {
    return this.fb.group({
      id: id,
      allow: claim.allow,
      breakPointNumber: claim.breakPointNumber,
      description: claim.description,
      userClaimId: claim.userClaimId,
      userRoleId: claim.userRoleId,
      view: claim.view,
      viewOnlyAllowed: claim.viewOnlyAllowed,
      breakPointId: claim.breakPointId
    });
  }
  getUserDetails(userRoleGroup) {
    return userRoleGroup.controls.userDetails.controls;
  }
  getUserClaims(userDetails) {
    return userDetails.controls.userClaims.controls;
  }

  UpdateCount() {
    if (this._inputData && this._inputData[0].headerData && this._inputData[0].headerData.details.length > 0) {
      let userClaimLength = this._inputData[0].headerData.details.length;
      for (let i = 0; i < userClaimLength; i++) {
        let count: number = 0;
        for (let j = 0; j < this._inputData[0].headerData.details[i].userClaims.length; j++) {
          if (this._inputData[0].headerData.details[i].userClaims[j].allow) {
            count = count + 1;
          }
        }
        this.selectedCount[i] = count;
      }
    }
  }

  setHeightforAccordian() {
    const accordian = document.getElementsByClassName('accordian-section');
    for (let i = 0; i < accordian.length; i++) {
      if (accordian[i].clientHeight > 200) {
        document.getElementById('sed_' + i).style.height = '240px';
      } else {
        document.getElementById('scroll_' + i).querySelector('.ng-scrollbar-view ').classList.add('overflow-scroll')
      }
      const toggleWdth = document.getElementById('sed_' + i).querySelector('.accordian-toggle-section').clientWidth + 5;
      const leftSec = document.getElementById('sed_' + i).querySelectorAll('.breakpoint-name');
      for (let j = 0; j < leftSec.length; j++) {
        leftSec[j]['style']['width'] = 'calc(100% - ' + toggleWdth + 'px)';
      }
    }
    const expanedPanel = this.ExapanedPanel.length;
    for (let indexParent = 0; indexParent < expanedPanel; indexParent++) {
      this.ExapanedPanel[indexParent].firstElementChild.querySelectorAll('.first-column').length;
    }
  }
  
  private updateAllowViewAllControls(itemDetails, index) {
      this.allowAllToggle[index] = (itemDetails.userClaims.length === itemDetails.userClaims.filter(x=>x.allow).length);
      const selectedView = itemDetails.userClaims.filter(x=>x.viewOnlyAllowed && x.view);
      this.viewAllToggle[index] = (selectedView.length > 0 && itemDetails.userClaims.filter(x=>x.viewOnlyAllowed).length === selectedView.length);
  }

  private updateSelectedData(data: UntypedFormGroup){
    let selectedData = data.controls;
    let idx = _.findIndex(this._settingService.changedBreakPoints, (x) => { return x["breakPointNumber"] == selectedData.breakPointNumber.value });
    if (idx == -1) {
      this.setBreakPoints(selectedData);
    } else {
      this._settingService.changedBreakPoints.splice(idx, 1);
      this.setBreakPoints(selectedData);
    }
    this.findLength();
  }

  
  expandAll(){
    if(this._inputData && this._inputData.length > 0){
      this._inputData[0].headerData.details.forEach((value, index) => {
        this.onOpenClick(value, index);
      });
    }
  }
  collapseAll(){
    if(this._inputData && this._inputData.length > 0){
      this._inputData[0].headerData.details.forEach((value, index) => {
        value['isOpened'] = false;
      });
    }
  }
  toggleSection(itemDetails, index){
    if(itemDetails.isOpened){
      itemDetails.isOpened = false;
    } else {
      this.onOpenClick(itemDetails, index);
    }
    this.changedData.emit(this._inputData[0].headerData.details);
  }
}

