import { Component, OnInit, Input, ViewEncapsulation, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import * as _ from 'lodash';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { SettingsService } from '../../settings.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-accordian-user-config',
  templateUrl: './accordian-user-config.component.html',
  styleUrls: ['./accordian-user-config.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AccordianUserConfigComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() inputData: any;
  @Input() IsReadOnly: boolean;
  @ViewChild('ExapanedPanel') ExapanedPanel;
  captions: any = this.localization.captions.userConfig;
  selectedCount: any = [];
  userRoleGroup: FormGroup;
  userDetails: FormArray;
  userClaims: FormArray;  
  allowAllToggle: boolean[] = [];
  viewAllToggle: boolean[] = [];
  disableViewAllToogle: boolean[] = [];

  constructor(public _settingService: SettingsService, public localization: RetailStandaloneLocalization, private fb: FormBuilder) {

  }

  ngOnInit() {
    this._settingService.changedBreakPoints = [];
  }

  ngOnChanges() {
    this.userRoleGroup = this.fb.group({
      userDetails: this.fb.array([this.createUserDetails(0)])
    });
    this.findLength();
    this.UpdateCount();
    if (this.inputData) {
      this.addUserDetails();
      setTimeout(this.setHeightforAccordian, 500);
    }
  }

  ngAfterViewInit() {

  }

  createUserDetails(i): FormGroup {
    return this.fb.group({
      count: '',
      description: '',
      id: '',
      localeId: '',
      userClaims: this.fb.array([this.createClaimDetails(0)])
    });
  }

  createClaimDetails(i): FormGroup {
    return this.fb.group({
      allow: '',
      breakPointNumber: '',
      description: '',
      userClaimId: '',
      userRoleId: '',
      view: '',
      viewOnlyAllowed: '',
      breakPointId: ''
    });
  }
  showAllAppointments(data, i, j, k, keyWord, $event) {
    if (keyWord == 'allow') {
      data.controls.allow.value = $event[0];
      this.inputData[i].headerData.details[j].userClaims[k].allow = data.controls.allow.value;
      if (data.controls.allow.value) {
        data.controls.view.setValue(false);
        this.inputData[i].headerData.details[j].userClaims[k].view = false;
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
      data.controls.view.value = $event[0];
      let selectedData = data.controls;
      this.inputData[i].headerData.details[j].userClaims[k].view = data.controls.view.value;
      if (data.controls.view.value) {
        data.controls.allow.setValue(false);
        this.inputData[i].headerData.details[j].userClaims[k].allow = false;
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
    this.updateAllowViewAllControls(this.inputData[i].headerData.details[j], j);
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
    _.forEach(this.inputData, function (value) {
      _.forEach(value.details, function (dataValue) {
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

  allowAll(userDetail: FormGroup, itemDetail, event, index) {
    const userClaims = userDetail.controls.userClaims as FormArray;
    itemDetail.userClaims.forEach(element => {
      element.allow = event[0];
      if(event[0] && element.viewOnlyAllowed) {
        element.view = false;
      }
    });
    for(let index in userClaims.controls) {
      let userClaim = userClaims.controls[index] as FormGroup;
      userClaim.controls['allow'].setValue(event[0]);
      if(event[0] && userClaim.controls['viewOnlyAllowed'].value) {
        userClaim.controls['view'].setValue(!event[0]);
      }
      this.updateSelectedData(userClaim);
    }
    this.updateAllowViewAllControls(itemDetail, index);
  }

  viewAll(userDetail, itemDetail, event, index) {
    if(event[0]) {
      itemDetail.userClaims.forEach(element => {
        element.allow = !event[0];
        if(element.viewOnlyAllowed) {
          element.view = event[0];
        }
      });
    }
    const userClaims = userDetail.controls.userClaims as FormArray;
    for(let index in userClaims.controls) {
      let userClaim = userClaims.controls[index] as FormGroup;
      if(event[0]) {
        userClaim.controls['allow'].setValue(!event[0]);
      }
      if(userClaim.controls['viewOnlyAllowed'].value) {
        userClaim.controls['view'].setValue(event[0]); 
        this.updateSelectedData(userClaim);
      }
    }
    this.updateAllowViewAllControls(itemDetail, index);
  }


  addUserDetails() {
    this.userDetails = this.userRoleGroup.get('userDetails') as FormArray;
    this.userDetails.removeAt(0);
    if (this.inputData) {
      _.forEach(this.inputData[0].headerData.details, (user, i) => {
        this.userDetails.push(this.fb.group({
          count: user.count,
          description: user.description,
          id: user.id,
          localeId: user.localeId,
          userClaims: this.fb.array([])
        }))
      });
      _.forEach(this.inputData[0].headerData.details, (user, i) => {
        this.allowAllToggle[i] = false;
        this.viewAllToggle[i] = false;
        this.disableViewAllToogle[i] = false;
        this.userClaims = this.userRoleGroup.get(['userDetails', i, 'userClaims']) as FormArray;
        _.forEach(user.userClaims, (claim, j) => {
          this.userClaims.push(this.addUserClaims(i, user.id, claim));
        })
      })
    }
  }
  addUserClaims(i, id, claim): FormGroup {
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
    if (this.inputData && this.inputData[0].headerData && this.inputData[0].headerData.details.length > 0) {
      let userClaimLength = this.inputData[0].headerData.details.length;
      for (let i = 0; i < userClaimLength; i++) {
        let count: number = 0;
        for (let j = 0; j < this.inputData[0].headerData.details[i].userClaims.length; j++) {
          if (this.inputData[0].headerData.details[i].userClaims[j].allow) {
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
      const toggleWdth = document.getElementById('sed_' + i).querySelector('.accordian-toggle-section').clientWidth + 1;
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

  private updateSelectedData(data: FormGroup){
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
}

