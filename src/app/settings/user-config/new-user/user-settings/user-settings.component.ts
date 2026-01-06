import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, Validators } from '@angular/forms';
import { RetailStandaloneLocalization } from '../../../../core/localization/retailStandalone-localization';
import { SettingsService } from '../../../settings.service';
// import { HttpServiceCall, HttpMethod } from '../../../../shared/service/http-call.service';
// import { Host } from '../../../../shared/globalsContant';
// import * as GlobalConst from '../../../../shared/globalsContant';
// import { Utilities } from '../../../../shared/utilities/utilities';
import { PropertyInformation } from '../../../../core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { HttpMethod, BaseResponse } from 'src/app/common/Models/http.model';
import { Product } from 'src/app/common/Models/common.models';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import { UserAccessBreakPoints } from 'src/app/common/constants/useraccess.constants';
import { APIUserLoginType } from 'src/app/shared/shared-models';
// import { BaseResponse } from '../../../../shared/business/shared.modals';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  caption: any;
  languages: any[] = [];
  userLoginTypes: APIUserLoginType[];
  accesses: any[] = [];
  selectedAccess: any[] = [];
  minDateValue: any;
  IsReadOnly: boolean;
  userSettingsFormGrp: UntypedFormGroup;
  ActionButton: string;
  userIdPattern;
  commonCaptions: any;
  placeHolderFormat: string;
  @Input() popConfig: any;
  @Input() isADB2CConfigEnabled: boolean;
  floatLabel: string;
  isEmailEditUser : boolean = false;
  isToggleDisable : boolean = true;

  constructor(public localization: RetailStandaloneLocalization, public servicesetting: SettingsService,
              private http: HttpServiceCall, private utils: Utilities, private PropertyInfo: PropertyInformation,private UserAccess: UserAccessBusiness) {
                this.floatLabel = this.localization.setFloatLabel;
  }

  async ngOnInit() {
    this.caption = this.localization.captions;
    this.commonCaptions = this.localization.captions.common;
    this.placeHolderFormat = this.localization.inputDateFormat;
    this.ActionButton = this.caption.setting.save;
    this.userSettingsFormGrp = this.servicesetting.userSettingsFormGrp;
    // this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;
    // if (this.IsReadOnly) {
    //   this.utils.disableControls(this.userSettingsFormGrp);
    // }
    this.minDateValue = this.utils.getDate(this.PropertyInfo.CurrentDate);
    if(this.popConfig && this.popConfig.mode === 'Edit'){
      this.isToggleDisable = false;
      this.userSettingsFormGrp.controls['userid'].disable();
      this.isEmailEditUser=(this.userSettingsFormGrp.controls['email'].value !=  "" && this.isADB2CConfigEnabled) ? true : false;
      this.userSettingsFormGrp.controls?.nPassword?.setValidators(null);
      this.userSettingsFormGrp.controls?.cPassword?.setValidators(null);
    } else {
      this.userSettingsFormGrp.controls['userid'].enable();
    }
    // this.GetServiceCall('GetPropLanguages', {propertyId: 1});
    const tenantConfig = await this.GetTenantConfigurationCall('GetTenantConfiguration',{configurationName: 'TENANTCONFIGURATION'});
    this.setUserIdPattern(tenantConfig);
    this.GetServiceCall('GetAllLanguages');
    this.GetServiceCall('GetUserLoginTypes');
    this.GetServiceCall('GetPropLanguages', { propertyId: this.utils.GetPropertyInfo('PropertyId') });
    this.GetServiceCall('GetStandAloneProducts');
    this.GetRetailServiceCall('GetSubPropertyAccessByUser', { userId: this.utils.GetPropertyInfo('UserId') });
    this.toggleChange(this.userSettingsFormGrp.controls['newpassword'].value)
  }

  ButtonToggle(ga, gv) {
    if (ga.indexOf(gv) === -1) {
      ga.push(gv);
    } else {
      ga.splice(ga.indexOf(gv), 1);
    }
    this.utils.setUserAccessSettings(this.accesses, this.servicesetting.selectedAccess);
    this.servicesetting.isRadioButtonsChange = true;
  }

  isExist(coll, obj) {
    let index = -1;
    if (coll && obj) {
      index = coll.findIndex(x => ((x.id && x.id == 0) ? x.id : x) == obj);
    }
    return index;
  }

  sliderChange(event) {

  }

  async GetTenantConfigurationCall(Route, Uri?): Promise<any> {
    const response = await this.http.CallApiAsync<any>({
      host: Host.authentication,
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
    });
    return response.result;
  }

  GetServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  GetRetailServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.retailManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }



  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc === 'GetAllLanguages') {
      if (result.result) {
        const data = result.result as any;
        this.languages = data.map(x => ({ id: x.id, name: x.languageName, code: x.languageCode }));
      }
    } else if (callDesc === 'GetPropLanguages') {
      if (result.result) {
        const data = result.result as any;
        this.userSettingsFormGrp.controls.language.setValue(data);
      }
    } else if (callDesc === 'GetStandAloneProducts') {
      if (result.result) {
        this.servicesetting.products = result.result as any;
        const products: number[] = [Product.RETAIL];
        this.accesses = this.servicesetting.products.filter(r => products.includes(r.id)).map(x => ({ id: x.id, name: x.productName }));
        this.utils.setUserAccessSettings(this.accesses, this.servicesetting.selectedAccess);
      }
    }else if (callDesc == 'GetUserLoginTypes') {
      if (result.result) {
        let data = <any>result.result;
        this.userLoginTypes=data;
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  setUserIdPattern(jsonString) {
    if(jsonString) {
      const tenantConfig = jsonString.configValue;
      if(Object.keys(tenantConfig).length > 0) {
        this.userIdPattern = '^[\\w'+tenantConfig.AllowedSpecialCharacter+']+$';
      }
    }
  }


   //breakpoint access check
   async checkBreakPointAccess(breakPointNumber:number)
   {
     console.log('check access for',breakPointNumber)
     var response= await  this.UserAccess.getUserAccess(breakPointNumber)
     return response;
   }

  async toggleChange(eve,type?) {


    if(type=='PWD')
    {
      this.utils.ToggleLoader(true);

      var breakPointDetails=await this.checkBreakPointAccess(UserAccessBreakPoints.RESETUSERPASSWORD)
            if(!breakPointDetails.isAllow)
            {
              if(eve[0])
              {
                this.userSettingsFormGrp.controls?.newpassword?.setValue(false)
              }
              
             
            }
            else{
              if(eve[0] == true) {
                this.userSettingsFormGrp.controls?.nPassword?.setValidators([Validators.required]);
                this.userSettingsFormGrp.controls?.cPassword?.setValidators([Validators.required]);
              }
              else {
                this.userSettingsFormGrp.controls?.nPassword?.setValidators(null);
                this.userSettingsFormGrp.controls?.cPassword?.setValidators(null);
              }
            }

            this.utils.ToggleLoader(false);

    }
    else{
          if(eve[0] == true) {
          this.userSettingsFormGrp.controls?.nPassword?.setValidators([Validators.required]);
          this.userSettingsFormGrp.controls?.cPassword?.setValidators([Validators.required]);
        }
        else {
          this.userSettingsFormGrp.controls?.nPassword?.setValidators(null);
          this.userSettingsFormGrp.controls?.cPassword?.setValidators(null);
        }
    }

    
  }

  passwordValidation(){
    if(this.userSettingsFormGrp.controls['nPassword'].value != this.userSettingsFormGrp.controls['cPassword'].value){
      this.userSettingsFormGrp.controls.cPassword.setErrors({ invalid: true });
    } else {
      this.userSettingsFormGrp.controls.cPassword.setErrors(null);
    }
    this.userSettingsFormGrp.updateValueAndValidity();
  }


}
