import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { SettingsService } from '../../settings.service';
import * as _ from 'lodash';
import { PropertyInformation } from '../../../core/services/property-information.service';
import { UserOutletAccessDataService } from '../useroutletaccess.data.service';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { LoginCommunicationService } from 'src/app/login/login-communication.service';
import { CryptoUtility } from 'src/app/core/utilities/crypto.utility';
import { UTempDataUtilities } from 'src/app/common/shared/shared/utilities/utempdata-utilities';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss'],
  providers: [UserOutletAccessDataService],
  encapsulation: ViewEncapsulation.None
})
export class NewUserComponent implements OnInit {
  /* Selected tab change event */
  caption: any;
  existingUserId: any[];
  existingQuickId: any[];
  IsReadOnly: boolean;
  IsSpaRoleSelected = true;
  IsRetailRoleSelected = true;
  selectedTabIndex = 0;
  ActionButton: string;
  subPropertyAccess: any = [];
  saveDisabled = false;
  isADB2CConfigEnabled:boolean=false;
  uTempDataPrimary: string;
  uTempDataSecondary: string;
  constructor(public localization: RetailStandaloneLocalization, public _servicesetting: SettingsService, @Inject(MAT_DIALOG_DATA) public data,
              private dialogRef: MatDialogRef<NewUserComponent>, private http: HttpServiceCall,
              private utils: Utilities, private PropertyInfo: PropertyInformation,
              private _userOutletAccessDataService: UserOutletAccessDataService,  private loginService: LoginCommunicationService, private crypto: CryptoUtility,private utempdatautils: UTempDataUtilities) {

  }

  ngOnInit() {
    this.isADB2CConfigEnabled=this.data.isADB2CConfigEnabled;
    this.caption = this.localization.captions;
    this.ActionButton = this.caption.setting.save;
    // this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;
    if (this.data && this.data.mode && this.data.mode == 'Edit') {
      this.ActionButton = this.caption.setting.update;
      this._servicesetting.selectedAccess = this._servicesetting.editUserInfo.clientInfo.userPropertyAccesses.filter(x => x.hasAccess).map(y => y.productId);
      // this._servicesetting.selectedServiceGrp = this._servicesetting.editUserInfo.spaInfo.map(x => {
      //   const servGroup = this._servicesetting.serviceGroups.filter(y => y.id == x.serviceGroupId);
      //   return {
      //     id: x.serviceGroupId,
      //     name: servGroup && servGroup.length > 0 ? servGroup[0].description : ''
      //   };
      // });
      // const selectedCurrSG = this._servicesetting.selectedServiceGrp.filter(x => this._servicesetting.serviceGroups.map(y => y.id).includes(x.id));
      // if (selectedCurrSG.length >= this._servicesetting.serviceGroups.length) {
      //   this._servicesetting.selectedServiceGrp.push({ id: 0, name: 'ALL' });
      // }
      // this._servicesetting.selectedServiceGrp =  this._servicesetting.editUserInfo.spaInfo.map(x => x.serviceGroupId);
      this._servicesetting.selectedOutlets = this._servicesetting.editUserInfo.retailOutletMap ? this._servicesetting.editUserInfo.retailOutletMap.filter(y => y.hasAccess && this._servicesetting.propOutlets && this._servicesetting.propOutlets.map(o => o.subPropertyID).includes(y.subPropertyID)).map(x => { return { id: x.subPropertyID, name: this._servicesetting.propOutlets.filter(y => y.subPropertyId == x.subPropertyID)[0] ? this._servicesetting.propOutlets.filter(y => y.subPropertyId == x.subPropertyID)[0].subPropertyName : '' }; }) : [];
      const selectedCurrOuts = this._servicesetting.selectedOutlets.filter(x => this._servicesetting.propOutlets.map(y => y.subPropertyID).includes(x.id));
      if (selectedCurrOuts.length >= this._servicesetting.propOutlets.length) {
        this._servicesetting.selectedOutlets.push({ id: 0, name: 'ALL' });
      }
      this._servicesetting.isRadioButtonsChange = false;
    } else {
      this.ActionButton = this.caption.setting.save;
      this._servicesetting.userSettingsFormGrp.controls.activeuser.setValue(true);
      this._servicesetting.userSettingsFormGrp.controls.newpassword.setValue(true);
    }

    this._servicesetting.selectedOutlets = this._servicesetting.selectedOutlets.map(x => x.id);
    this.GetAllUserbyTenantId();
    this.setValues();
  }
  async GetAllUserbyTenantId() {
    const apiResponse: BaseResponse<any[]> = await this.InvokeServiceCallAsync('GetAllUsers', Host.authentication, HttpMethod.Get, { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
    if (apiResponse && apiResponse.result) {
      this._servicesetting.existingUserIds = apiResponse.result.map(sc => sc.userName);
      this._servicesetting.existingQuickIds = apiResponse.result.filter(x => x.quickId).map(sc => sc.quickId);

      if (this.data && this.data.mode && this.data.mode == 'Edit') {
        //clone existing user ids
        this.existingUserId = _.cloneDeep(this._servicesetting.existingUserIds);
        const index = this.existingUserId.indexOf(this._servicesetting.userSettingsFormGrp.controls.userid.value.toUpperCase());
        if (index >= 0) {
          this.existingUserId.splice(index, 1);
        }
        //clone existing quick ids
        this.existingQuickId = _.cloneDeep(this._servicesetting.existingQuickIds);
        const index1 = this.existingQuickId.indexOf(this._servicesetting.userSettingsFormGrp.controls.quickid.value);
        if (index1 >= 0) {
          this.existingQuickId.splice(index1, 1);
        }
      }
    }
  }
  handleSelectedTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
  }

  SaveOrUpdate() {
    const serviceSettingControl = this._servicesetting.userSettingsFormGrp.controls;
    if (this.data && this.data.mode && this.data.mode == 'Edit') {
      if (this.existingUserId.includes(serviceSettingControl.userid.value.toUpperCase())) {
        this.utils.showError(this.caption.setting.DuplicateUserID);
      } else if (this.existingQuickId.includes(serviceSettingControl.quickid.value)) {
        this.utils.showError(this.caption.setting.DuplicateQuickID);
      } else if (serviceSettingControl.fname.value.trim() == '') {
        serviceSettingControl.fname.setValue('');
        serviceSettingControl.fname.markAsTouched();
      } else if (serviceSettingControl.lname.value.trim() == '') {
        serviceSettingControl.lname.setValue('');
        serviceSettingControl.lname.markAsTouched();
      } else if ((!serviceSettingControl.email.value  || serviceSettingControl.email.value.trim() == '') && this.isADB2CConfigEnabled) {
        this.utils.showError(this.caption.setting.MissingEmail);
      } else {
        this.Edit();
      }
    } else {
      if (this._servicesetting.existingUserIds.includes(serviceSettingControl.userid.value.toUpperCase())) {
        this.utils.showError(this.caption.setting.DuplicateUserID);
      } else if (this._servicesetting.existingQuickIds.includes(serviceSettingControl.quickid.value)) {
        this.utils.showError(this.caption.setting.DuplicateQuickID);
      } else if (serviceSettingControl.fname.value.trim() == '') {
        serviceSettingControl.fname.setValue('');
        serviceSettingControl.fname.markAsTouched();
      } else if (serviceSettingControl.lname.value.trim() == '') {
        serviceSettingControl.lname.setValue('');
        serviceSettingControl.lname.markAsTouched();
      } else if ((!serviceSettingControl.email.value  || serviceSettingControl.email.value.trim() == '') && this.isADB2CConfigEnabled) {
        this.utils.showError(this.caption.setting.MissingEmail);
      } else {
        this.save();
      }
    }
  }
  setValues() {
    this.uTempDataPrimary = this.utempdatautils.GetUTempData(3);
    this.uTempDataSecondary = this.utempdatautils.GetUTempData(1);
  }

  save() {
    const serviceRetailControls = this._servicesetting.retailSettingsFormGrp.controls;
    const serviceUserControls = this._servicesetting.userSettingsFormGrp.controls;
    // const serviceSettingControls = this._servicesetting.spaSettingsFormGrp.controls;
    const subPropAccess: any = [];
    for (let i = 0; i < this._servicesetting.propOutlets.length; i++) {
      subPropAccess.push({
        hasAccess: this._servicesetting.selectedOutlets.includes(this._servicesetting.propOutlets[i].subPropertyID),
        subPropertyID: this._servicesetting.propOutlets[i].subPropertyID
      });
    }
    this.subPropertyAccess = subPropAccess;
    const proAccess: any = [];
    const retailProdId = this._servicesetting.products.filter(x => x.productName.replace(/ /g, '').toUpperCase() == 'RETAIL')[0].id;
    const spaProdId = this._servicesetting.products.filter(x => x.productName.replace(/ /g, '').toUpperCase() == 'SPA')[0].id;
    if (this._servicesetting.selectedAccess.includes(retailProdId)) {
      const roleid = serviceRetailControls.rolename.value ? Number(serviceRetailControls.rolename.value) : Number(0);
      if (roleid == 0) {
        this.IsRetailRoleSelected = false;
        this.selectedTabIndex = 1;
        return;
      }
      if (serviceRetailControls.allowcommission.value && (!serviceRetailControls.commissionclass.value || serviceRetailControls.commissionclass.value == 0)) {
        serviceRetailControls.commissionclass.setValue('');
        serviceRetailControls.commissionclass.markAsTouched();
        this.selectedTabIndex = 1;
        return;
      }
    }
    // if (this._servicesetting.selectedAccess.includes(spaProdId)) {
    //   const roleid = this._servicesetting.spaSettingsFormGrp.controls.rolename.value ? this._servicesetting.spaSettingsFormGrp.controls.rolename.value : Number(0);
    //   if (roleid == 0) {
    //     this.IsSpaRoleSelected = false;
    //     this.selectedTabIndex = 1;
    //     return;
    //   }
    // }
    try {
      this.saveDisabled = true;
    proAccess.push({
      propertyID: Number(this.utils.GetPropertyInfo('PropertyId')),
      subPropertyID: 0,
      userAuthorityLevel: 0,
      hasAccess: this._servicesetting.selectedAccess.includes(retailProdId),
      productId: retailProdId,
      roleId: serviceRetailControls.rolename.value ? Number(serviceRetailControls.rolename.value) : Number(0),
      accountBlocked: serviceRetailControls.accountblocked.value ? serviceRetailControls.accountblocked.value : false,
      autoLogOff: serviceRetailControls.autologoff.value ? serviceRetailControls.autologoff.value : false,
      logOffAfter: serviceRetailControls.autologoff.value ? Number(serviceRetailControls.logoffafter.value) : Number(0),
      userSubPropertyAccess: subPropAccess
    });

    // proAccess.push({
    //   propertyID: Number(this.utils.GetPropertyInfo('PropertyId')),
    //   subPropertyID: 0,
    //   userAuthorityLevel: 0,
    //   hasAccess: this._servicesetting.selectedAccess.includes(spaProdId),
    //   productId: spaProdId,
    //   roleId: serviceSettingControls.rolename.value ? serviceSettingControls.rolename.value : Number(0),
    //   accountBlocked: serviceSettingControls.accountblocked.value ? serviceSettingControls.accountblocked.value : false,
    //   autoLogOff: serviceSettingControls.autologoff.value ? serviceSettingControls.autologoff.value : false,
    //   logOffAfter: serviceSettingControls.autologoff.value ? serviceSettingControls.logoffafter.value : Number(0),
    //   //lastaccessdate: "0001-01-01T00:00:00",
    //   userSubPropertyAccess: []
    // })
    let userPassword:string=serviceUserControls.nPassword.value;
    if(this.uTempDataPrimary && this.uTempDataSecondary && userPassword.length > 0) 
    {
      userPassword = this.crypto.EncryptString(userPassword, this.uTempDataPrimary, this.uTempDataSecondary);
    }

    const userObj = {
      tenantId: Number(this.utils.GetPropertyInfo('TenantId')),
      userName: serviceUserControls.userid.value.toUpperCase(),
      firstName: this.utils.capitalizeFirstLetter(serviceUserControls.fname.value),
      lastName: this.utils.capitalizeFirstLetter(serviceUserControls.lname.value),
      password:  this.data && this.data.mode && this.data.mode == 'Edit' && userPassword.length > 0 ? null : userPassword,
      isActive: serviceUserControls.activeuser.value ? serviceUserControls.activeuser.value : false,
      isNewUser: serviceUserControls.newpassword.value ? serviceUserControls.newpassword.value : false,
      passwordexpiredate: serviceUserControls.pwdexpirationdate.value ? this.utils.convertDateFormat(serviceUserControls.pwdexpirationdate.value) : null,
      // createdOn: this.utils.convertDateFormat(this.PropertyInfo.CurrentDate),
      quickId: serviceUserControls.quickid.value ? serviceUserControls.quickid.value : '',
      // roleId: serviceSettingControls.rolename.value ? serviceSettingControls.rolename.value : Number(0),
      roleId: 0,
      languageId: serviceUserControls.language.value ? serviceUserControls.language.value : Number(0),
      email: serviceUserControls.email.value ? serviceUserControls.email.value : '',
      userPropertyAccesses: proAccess,
      loggedUser: this.utils.GetPropertyInfo('userName')
    };

    const retailData = {
      userId: 0,
      allowGratuity: serviceRetailControls.allowgratuity.value ? serviceRetailControls.allowgratuity.value : false,
      allowServiceCharge: serviceRetailControls.allowservicecharge.value ? serviceRetailControls.allowservicecharge.value : false,
      allowCommission: serviceRetailControls.allowcommission.value ? serviceRetailControls.allowcommission.value : false,
      commissionClass: serviceRetailControls.allowcommission.value ? Number(serviceRetailControls.commissionclass.value) : Number(0)
    };
    this.CreateUser(userObj, Host.authentication, 'CreateUser', [retailData], { PropertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
  }  catch {
    this.saveDisabled = false;
  }
}

  Edit() {
    let userPassword:string="";
    if(this.uTempDataPrimary && this.uTempDataSecondary && this._servicesetting.userSettingsFormGrp.controls.newpassword.value) 
    {
      userPassword =this._servicesetting.userSettingsFormGrp.controls.nPassword.value;
      userPassword = this.crypto.EncryptString(userPassword, this.uTempDataPrimary, this.uTempDataSecondary);
    }

    const editedInfo = _.cloneDeep(this._servicesetting.editUserInfo.clientInfo);
    const retailConf = _.cloneDeep(this._servicesetting.editUserInfo.retainInfo);
    editedInfo.userName = this._servicesetting.userSettingsFormGrp.controls.userid.value.toUpperCase();
    editedInfo.firstName = this.utils.capitalizeFirstLetter(this._servicesetting.userSettingsFormGrp.controls.fname.value);
    editedInfo.lastName = this.utils.capitalizeFirstLetter(this._servicesetting.userSettingsFormGrp.controls.lname.value);
    editedInfo.isActive = this._servicesetting.userSettingsFormGrp.controls.activeuser.value ? this._servicesetting.userSettingsFormGrp.controls.activeuser.value : false;
    editedInfo.isNewUser = this._servicesetting.userSettingsFormGrp.controls.newpassword.value ? this._servicesetting.userSettingsFormGrp.controls.newpassword.value : false;
    editedInfo.passwordexpiredate = this._servicesetting.userSettingsFormGrp.controls.pwdexpirationdate.value ? this.utils.convertDateFormat(this.utils.getDate(this._servicesetting.userSettingsFormGrp.controls.pwdexpirationdate.value)) : null;
    editedInfo.quickId = this._servicesetting.userSettingsFormGrp.controls.quickid.value ? this._servicesetting.userSettingsFormGrp.controls.quickid.value : '';
    editedInfo.languageId = this._servicesetting.userSettingsFormGrp.controls.language.value ? this._servicesetting.userSettingsFormGrp.controls.language.value : Number(0);
    editedInfo.email = this._servicesetting.userSettingsFormGrp.controls.email.value ? this._servicesetting.userSettingsFormGrp.controls.email.value : '';
    editedInfo.loggedUser = this.utils.GetPropertyInfo('userName');
    editedInfo.password = userPassword.length > 0 ? userPassword : null
    // editedInfo.roleId = this._servicesetting.spaSettingsFormGrp.controls.rolename.value ? Number(this._servicesetting.spaSettingsFormGrp.controls.rolename.value) : Number(0);
    
    const retailProdId = this._servicesetting.products.filter(x => x.productName.replace(/ /g, '').toUpperCase() == 'RETAIL')[0].id;
    // const spaProdId = this._servicesetting.products.filter(x => x.productName.replace(/ /g, '').toUpperCase() == 'SPA')[0].id;
    const retailRowIndex = editedInfo.userPropertyAccesses.findIndex(x => x.productId == retailProdId);
    // let spaRowIndex = editedInfo.userPropertyAccesses.findIndex(x => x.productId == spaProdId);

    if (retailRowIndex != -1) {
      const serviceRetailControls = this._servicesetting.retailSettingsFormGrp.controls;
      editedInfo.userPropertyAccesses[retailRowIndex].hasAccess = this._servicesetting.selectedAccess.includes(retailProdId);
      if (this._servicesetting.selectedAccess.includes(retailProdId)) {
        const roleid = this._servicesetting.retailSettingsFormGrp.controls.rolename.value ? Number(this._servicesetting.retailSettingsFormGrp.controls.rolename.value) : Number(0);
        if (roleid == 0) {
          this.IsRetailRoleSelected = false;
          this.selectedTabIndex = 1;
          return;
        }

        if (serviceRetailControls.allowcommission.value &&
          (!serviceRetailControls.commissionclass.value || serviceRetailControls.commissionclass.value == 0)) {
          serviceRetailControls.commissionclass.setValue('');
          serviceRetailControls.commissionclass.markAsTouched();
          this.selectedTabIndex = 1;
          return;
        }
      }
      this.IsRetailRoleSelected = true;
      editedInfo.userPropertyAccesses[retailRowIndex].roleId = this._servicesetting.retailSettingsFormGrp.controls.rolename.value ? Number(this._servicesetting.retailSettingsFormGrp.controls.rolename.value) : Number(0);
      editedInfo.userPropertyAccesses[retailRowIndex].accountBlocked = this._servicesetting.retailSettingsFormGrp.controls.accountblocked.value ? this._servicesetting.retailSettingsFormGrp.controls.accountblocked.value : false;
      editedInfo.userPropertyAccesses[retailRowIndex].autoLogOff = this._servicesetting.retailSettingsFormGrp.controls.autologoff.value ? this._servicesetting.retailSettingsFormGrp.controls.autologoff.value : false;
      editedInfo.userPropertyAccesses[retailRowIndex].logOffAfter = this._servicesetting.retailSettingsFormGrp.controls.autologoff.value ? Number(this._servicesetting.retailSettingsFormGrp.controls.logoffafter.value) : Number(0);
      let selectedOuts = this._servicesetting.selectedOutlets;
      selectedOuts = _.uniq(selectedOuts);
      const idx = selectedOuts.indexOf(0);
      if (idx >= 0) {
        selectedOuts.splice(idx, 1);
      }
      this.subPropertyAccess = [];
      if (this._servicesetting.propOutlets) {
        this._servicesetting.propOutlets.forEach(propOutlet => {
          let subPropAccess = editedInfo.userPropertyAccesses[retailRowIndex].userSubPropertyAccess.find(o => o.subPropertyID === propOutlet.subPropertyID);
          if (subPropAccess) {
            subPropAccess.hasAccess = selectedOuts && selectedOuts.length > 0 ? selectedOuts.includes(subPropAccess.subPropertyID) : false;
          } else {
            subPropAccess = {
              hasAccess: selectedOuts.includes(propOutlet.subPropertyID) ? true : false,
              subPropertyID: propOutlet.subPropertyID,
              userID: editedInfo.userId,
              userPropertyAccessID: 0,
              userSubPropertyAccessID: 0,
            };
          }

          this.subPropertyAccess.push(subPropAccess);
        });
      }

      // if (editedInfo.userPropertyAccesses[retailRowIndex].userSubPropertyAccess.length < this._servicesetting.propOutlets.length) {
      const alreadyConfigred = editedInfo.userPropertyAccesses[retailRowIndex].userSubPropertyAccess.map(x => x.subPropertyID);
      let availableOuts = this._servicesetting.propOutlets.map(x => x.subPropertyID);

      availableOuts = availableOuts.filter((el) => !alreadyConfigred.includes(el));
      if (availableOuts.length > 0) {
        const addedOuts: any[] = [];
        for (let j = 0; j < availableOuts.length; j++) {
          addedOuts.push({
            hasAccess: selectedOuts.includes(availableOuts[j]),
            subPropertyID: availableOuts[j],
            userPropertyAccessID: editedInfo.userPropertyAccesses[retailRowIndex].userPropertyAccessID
          });
        }
        editedInfo.userPropertyAccesses[retailRowIndex].userSubPropertyAccess.push(...addedOuts);
      }

      //}
    }

    // if (spaRowIndex != -1) {
    //   if (this._servicesetting.selectedAccess.includes(spaProdId)) {
    //     let roleid = this._servicesetting.spaSettingsFormGrp.controls.rolename.value ? Number(this._servicesetting.spaSettingsFormGrp.controls.rolename.value) : Number(0);
    //     if (roleid == 0) {
    //       this.IsSpaRoleSelected = false;
    //       this.selectedTabIndex = 1;
    //       return;
    //     }
    //   }
    //   this.IsSpaRoleSelected = true;
    //   editedInfo.userPropertyAccesses[spaRowIndex].hasAccess = this._servicesetting.selectedAccess.includes(spaProdId);
    //   editedInfo.userPropertyAccesses[spaRowIndex].roleId = this._servicesetting.spaSettingsFormGrp.controls.rolename.value ? Number(this._servicesetting.spaSettingsFormGrp.controls.rolename.value) : Number(0);
    //   editedInfo.userPropertyAccesses[spaRowIndex].accountBlocked = this._servicesetting.spaSettingsFormGrp.controls.accountblocked.value ? this._servicesetting.spaSettingsFormGrp.controls.accountblocked.value : false;
    //   editedInfo.userPropertyAccesses[spaRowIndex].autoLogOff = this._servicesetting.spaSettingsFormGrp.controls.autologoff.value ? this._servicesetting.spaSettingsFormGrp.controls.autologoff.value : false;
    //   editedInfo.userPropertyAccesses[spaRowIndex].logOffAfter = this._servicesetting.spaSettingsFormGrp.controls.autologoff.value ? Number(this._servicesetting.spaSettingsFormGrp.controls.logoffafter.value) : Number(0);
    // }
    let newRetailConf;
    if (retailConf) {
      retailConf.allowGratuity = this._servicesetting.retailSettingsFormGrp.controls.allowgratuity.value ? this._servicesetting.retailSettingsFormGrp.controls.allowgratuity.value : false;
      retailConf.allowServiceCharge = this._servicesetting.retailSettingsFormGrp.controls.allowservicecharge.value ? this._servicesetting.retailSettingsFormGrp.controls.allowservicecharge.value : false;
      retailConf.allowCommission = this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value ? this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value : false;
      retailConf.commissionClass = this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value ? Number(this._servicesetting.retailSettingsFormGrp.controls.commissionclass.value) : Number(0);
    } else {
      newRetailConf = {
        userId: editedInfo.userId,
        allowGratuity: this._servicesetting.retailSettingsFormGrp.controls.allowgratuity.value ? this._servicesetting.retailSettingsFormGrp.controls.allowgratuity.value : false,
        allowServiceCharge: this._servicesetting.retailSettingsFormGrp.controls.allowservicecharge.value ? this._servicesetting.retailSettingsFormGrp.controls.allowservicecharge.value : false,
        allowCommission: this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value ? this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value : false,
        commissionClass: this._servicesetting.retailSettingsFormGrp.controls.allowcommission.value ? Number(this._servicesetting.retailSettingsFormGrp.controls.commissionclass.value) : Number(0)
      };
    }
    try {
      this.saveDisabled = true;
      this.EditUser(
        editedInfo,
        Host.authentication,
        'UpdateUser',
        [retailConf, newRetailConf],
        { PropertyId: Number(this.utils.GetPropertyInfo('PropertyId')) }
      );
    } catch {
      this.saveDisabled = false;
    }
  }

  cancel() {
    this.dialogRef.close('cancelled');
  }

  CreateUser(data, host, callDesc, extraParams, uri?) {
    this.http.CallApiWithCallback<any>({
      host,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc,
      method: HttpMethod.Post,
      body: data,
      showError: true,
      extraParams,
      uriParams: uri
    });
  }

  EditUser(data, host, callDesc, extraParams, uri?) {
    this.http.CallApiWithCallback<any>({
      host,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc,
      method: HttpMethod.Put,
      body: data,
      showError: true,
      extraParams,
      uriParams: uri
    });
  }
  async InvokeServiceCallAsync(route: string, domain: Host, callType: HttpMethod, uriParams?: any, body?: any): Promise<BaseResponse<any>> {
    const result: BaseResponse<any> = await this.http.CallApiAsync({
      host: domain,
      callDesc: route,
      method: callType,
      body,
      uriParams,
    });
    return result;
  }

  async successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): Promise<void> {
    try {
      if (callDesc === 'CreateUser') {
        if (result.result) {
          extraParams[0].userId = Number(result.result);        
          this.CreateUser(extraParams[0], Host.retailManagement, 'CreateUserRetailConfig', []);
          if (this.subPropertyAccess && this.subPropertyAccess.length > 0) {
            this.subPropertyAccess.forEach(x => x.userID = extraParams[0].userId);
            await this._userOutletAccessDataService.CreateUserOutletAccess(this.subPropertyAccess);
          }
          this.dialogRef.close('saved');
        }
      } else if (callDesc === 'UpdateUser') {
        if (result.result) {
          if (extraParams[0]) {
            this.EditUser(extraParams[0], Host.retailManagement, 'UpdateUserRetailConfig', []);
          } else {
            this.CreateUser(extraParams[1], Host.retailManagement, 'CreateUserRetailConfig', []);
          }
          if (this.subPropertyAccess && this.subPropertyAccess.length > 0) {
            await this._userOutletAccessDataService.UpdateUserOutletAccess(this.subPropertyAccess);
          }
          this.dialogRef.close('saved');
        }
      }
    } catch {
      this.saveDisabled = false;
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'CreateUser' || callDesc == 'UpdateUser') {
      this.saveDisabled = false;
    }
  }

  async CreateUserConfig(callDesc, host, body, uri?) {
    const info = await this.http.CallApiAsync({
      host,
      uriParams: uri,
      callDesc,
      method: HttpMethod.Post,
      body
    });

    return info.result;
  }

}
