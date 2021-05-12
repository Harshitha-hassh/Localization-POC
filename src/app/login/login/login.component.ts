import { Compiler, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
import { PropertySettingDataService } from 'src/app/shared/data-services/authentication/propertysetting.data.service';
import { ManageSessionService } from '../manage-session.service';
import { SetPasswordComponent } from '../set-password/set-password.component';
import {
  JWT_TOKEN, USER_INFO,
  USER_SESSION, PROPERTY_INFO, PROPERTY_DATE, PROPERTY_CONFIGURATION_SETTINGS
} from 'src/app/app-constants';
import { LoginCommunicationService } from '../login-communication.service';
import moment from 'moment';
import { ButtonValue } from 'src/app/shared/shared-models';
import { Product, SELECTION_ON_LOGIN, TRANSACTION_BY_MACHINENAME } from 'src/app/common/shared/shared/globalsContant';
import { API } from 'src/app/shared/models/property-settings.model';
import { UserdefaultsInformationService } from 'src/app/core/services/UserdefaultsInformationService';
import { Localization } from 'src/app/common/localization/localization';
import { UserMachineConfigurationService } from 'src/app/retail/common/services/user-machine-configuration.service';
import { RetailSharedVariableService } from 'src/app/retail/shared/retail.shared.variable.service';
import { RetailFunctionalityBusiness } from 'src/app/retail/shared/business/retail-functionality.business';
import { RetailFunctionalityService } from 'src/app/retail/shared/service/retail-functionality.service';
import { UserMachineInfo } from 'src/app/common/shared/shared.modal';
import { PropertySettingDataService as RetailPropertySettingDataService } from 'src/app/retail/sytem-config/property-setting.data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers:[UserMachineConfigurationService, RetailFunctionalityBusiness, RetailFunctionalityService],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  captions: any;
  loginForms: FormGroup;
  loginError: boolean;
  loginSuccess = false;
  loginButton: ButtonValue;
  hidePassword: boolean;
  userProperties: any = [];
  errResponse: string;
  rememberMe: boolean;

  buttonValueprimary2: ButtonValue;
  buttonValueprimary1: ButtonValue;

  $destroyed: ReplaySubject<boolean> = new ReplaySubject(1);
  multipleProperties: any = [
    {
      id: 1,
      name: 'Agilysys'
    }
  ];
  userName: any;
  userInfo: any;
  propertyValues: any;
  errorMessage: { userId: string; password: string; customerId: string };
  useridSubscribe: any; passwordSubscribe: any;
  setPassword: boolean;
  private autoLogOff: any = false;
  private logOffAfter = 1;
  showCustomerID = false;
  custId: any;
  userIdDir = 'capitalise,notallowspace,nospecailchar';
  tenantId: number;
  tenantIdFromParam: string;
  currYear = '2020';

  //Machine Name
  isMachineNameEnabled: boolean;
  isPromptOnLoginEnabled: boolean;
  defaultMachineId: number = 0;
  machineNames = [];
  userMachineInfo: UserMachineInfo;

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private localize: RetailStandaloneLocalization,
    private commonLocalize: Localization,
    private utils: Utilities,
    private sessionService: ManageSessionService,
    private loginService: LoginCommunicationService,
    private PropertySettingService: PropertySettingDataService,
    private propertyInfo: PropertyInformation,
    private userDefaultsService: UserdefaultsInformationService,
    private retailPropertySettingDataService: RetailPropertySettingDataService,
    private compiler: Compiler,
    private router: Router,
    private userSessionConfig: UserMachineConfigurationService, 
    private retailSharedService: RetailSharedVariableService,
    private retailFunc: RetailFunctionalityBusiness    
  ) {
    this.initializeForm();
    this.captions = this.localize.captions;
  }

  ngOnInit() {
    this.compiler.clearCache();

    const token = sessionStorage.getItem(JWT_TOKEN);
    if (this.localize.validateString(token)) {
      this.router.navigate(['/home']);
    }

    this.captionGenerator();
    this.formGenerator();
    this.errorGenerator();
    this.getCustomerId();

    this.loginButton = {
      type: 'primary',
      label: this.captions.Login,
      customclass: 'w-307px'
    };
    this.buttonValueprimary1 = {
      type: 'primary',
      label: this.captions.setPassword,
      customclass: 'w-307px'
    };
    this.buttonValueprimary2 = {
      type: 'primary',
      label: 'login.ChangePassword',
      customclass: 'w-307px'
    };
    const getrememberresult = this.sessionService.GetRememberedUsers();
    const rememberedUser = (getrememberresult.length > 0) ? getrememberresult[0].name : '';
    this.loginForms.controls.userId.setValue(rememberedUser ? rememberedUser : '');
    this.loginForms.controls.rememberme.setValue(rememberedUser ? true : false);
    this.loginForms.controls.password.setValue('');
  }

  OnFormValueChanges(): any {
    this.useridSubscribe = this.loginForms.get('userId').valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(r => {
      if (r.includes('@')) {
        this.showCustomerID = false;
        this.removeVal();
      } else {
        this.showCustomerID = true;
        this.setVal();
      }
      this.loginError = false;
      this.errResponse = '';
    });
    this.passwordSubscribe = this.loginForms.get('password').valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(r => {
      this.loginError = false;
      this.errResponse = '';
    });
  }

  getCustomerId() {
    const serviceParams = {
      route: RetailRoutes.EnvironmentConfig,
      uriParams: '',
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    this.loginService.makeGetCall(serviceParams).then((res: any) => {
      this.custId = res ? res.result : 0;
      if (this.custId == '0') {
        this.userIdDir = 'capitalise,notallowspace';
        this.showCustomerID = true;
        this.setVal();
        this.OnFormValueChanges();
      } else {
        this.userIdDir = 'capitalise,notallowspace,nospecailchar';
        this.showCustomerID = false;
        this.removeVal();
      }
    });
  }

  formGenerator() {
    this.loginForms = this.formBuilder.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      customerId: [''],
      rememberme: false,
      location: ['Agilysys', Validators.required],
      machineName:['0', Validators.required]
    });
  }

  errorGenerator() {
    this.errorMessage = {
      userId: 'Please Enter the User ID',
      password: 'Please Enter the Password',
      customerId: 'Please Enter the Customer ID'
    };
  };

  captionGenerator() {
    this.captions = this.localize.getCaptions();
  }

  ngOnDestroy() {
    if (this.$destroyed) {
      this.$destroyed.next(true);
      this.$destroyed.complete();
    }
  }

  loadProperties() { }

  onPropertyChange(eve) {
    const propertyInfo = this.propertyValues.find(item => item.propertyCode === eve.value.id);
    this.setMachineInfo(propertyInfo.propertyId);
  }

  loadMachineNames() {
    this.machineNames = this.machineNames;
  }

  async handleclick() {
    if (this.loginForms.valid) {
      const credentials = {
        userName: this.loginForms.value.userId,
        password: this.loginForms.value.password,
        tenantId:
          this.tenantIdFromParam != null
            ? this.tenantIdFromParam
            : this.utils.GetLocalStorageValue('propertyInfo', 'TenantId'),
        Property: this.loginForms.controls.location.value,
        ProductId: Product.RETAIL
      };
      await this.validateCredentials(credentials);
      this.userName = this.loginForms.value.userId;
    } else {
      this.loginForms.markAllAsTouched();
    }
  }

  private async successCallBack(loginDetails: any) {
    sessionStorage.setItem(JWT_TOKEN, loginDetails.result.token);
    this.userName = loginDetails.result.userLoginInfo.userName;
    this.userInfo = loginDetails.result.userLoginInfo;
    const id = loginDetails.result.userLoginInfo.tenantId;
    this.setUserInfo(loginDetails);
    if (loginDetails.result.userLoginInfo.isNewUser === true) {
      this.setPassword = true;
      this.tenantId = Number(id);
      const content = { title: 'SETUP PASSWORD', userName: this.userName, tenantId: this.tenantId };
      this.setUpPassword(content, true);
    } else if (loginDetails.result.userLoginInfo.isPasswordExpired === true) {
      const content = { title: 'CHANGE PASSWORD', userName: this.userName, tenantId: this.tenantId };
      this.setUpPassword(content, false);
    } else {
      this.propertyValues = loginDetails.result.userProperties;
      this.captionGenerator();
      this.loginSuccess = !this.loginSuccess;
      this.multipleProperties = this.propertyValues.map(x => ({
        id: x.propertyCode,
        name: x.propertyName
      }));
      this.userMachineInfo = await this.retailPropertySettingDataService.GetMachineNamesAndConfigurationSetting(this.userInfo.userId,
        this.propertyValues.map(x=> x.propertyId));
      // Selecting property by default when there is only one property configured for tenant
      if (this.multipleProperties.length == 1) {
        this.loginForms.controls.location.setValue(this.multipleProperties[0]);
        this.setMachineDetails();
      }
    }
  }

  async setUserInfo(loginDetails) {
    this.userProperties = loginDetails.result.userProperties ? loginDetails.result.userProperties : {};
    const language = loginDetails.result.userLoginInfo && loginDetails.result.userLoginInfo.languageCode;
    const userInfo = `userId=${loginDetails.result.userLoginInfo.userId};
                      userName=${loginDetails.result.userLoginInfo.userName};
                      firstName=${loginDetails.result.userLoginInfo.firstName};
                      lastName=${loginDetails.result.userLoginInfo.lastName};
                      roleId=${this.userProperties ? this.userProperties[0].roleId : 1};
                      roleName=${this.userProperties ? this.userProperties[0].roleName : ''};
                      language=${language};
                    `;
    sessionStorage.setItem(USER_INFO, userInfo);
  }

  async validateCredentials(credentials) {
    const serviceParams = {
      route: RetailRoutes.Login,
      uriParams: '',
      header: '',
      body: credentials,
      showError: true,
      baseResponse: true
    };

    if (!this.loginSuccess) {
      // Validate credentials
      const loginDetails = await this.loginService.makePostCall(serviceParams);

      if (loginDetails.successStatus) {
        this.userName = credentials.UserName;
        await this.successCallBack(loginDetails);
        this.rememberUser();
      } else {
        if (loginDetails.errorCode == 5001) {
          this.loginError = true;
          this.loginButton.disabledproperty = false;
          this.errResponse = loginDetails.errorDescription;
        } else {
          this.utils.showError(loginDetails.errorDescription);
        }
      }
    } else {
      /*TODO: Uncomment this once jwt token update implementation done */
      // this.setpropertyvalues(credentials.Property).then(() => {
      //   this.systemDefaultsService.syncDefaultSettings();
      //   this.userDefaultsService.syncDefaultValues(this.userInfo.userId);
      //   this.router.navigate(['/home']);
      // });
      this.setpropertyvalues(credentials.Property);
      // this.systemDefaultsService.syncDefaultSettings();
      // this.userDefaultsService.syncDefaultValues(this.userInfo.userId);

      // create session and store session id into data service
      const usersessionId = await this.sessionService.createSession();
      sessionStorage.setItem(USER_SESSION, String(usersessionId));
      await this.setEatecToken();
      this.setAutoLogOff();
      await this.SetUserSessionConfiguration(this.userInfo.userId);
      this.setMachineDetails();
      this.router.navigate(['/home']);      
      await this.retailFunc.getRetailFunctionality();
    }
  }

  async setpropertyvalues(Selectedproperty: any) {
    const result = this.propertyValues.find(
      item => item.propertyCode === Selectedproperty.id
    );
    const userLanguageCode =
      this.userInfo != null && this.userInfo.languageCode != ''
        ? this.userInfo.languageCode
        : result.languageCode;
    let maxDecimalPlace = result["maximumDecimalPlaces"] ? result["maximumDecimalPlaces"] : 2;    

    const PropertyValues =
      'Language=' +
      result.languageCode +
      '; PropertyCode=' +
      result.propertyCode +
      '; SubPropertyCode=' +
      result.subPropertyCode +
      '; Currency=' +
      result.currencyCode +
      '; TenantId=' +
      result.tenantId +
      '; userName=' +
      this.userName +
      '; UserId=' +
      this.userInfo.userId +
      '; PropertyId=' +
      result.propertyId +
      '; SubPropertyId=' +
      result.subPropertyId +
      '; PlatformTenantId=' +
      result.platformTenantId +
      '; PropertyDate=' +
      result.propertyDate +
      '; TimeZone=' +
      result.timeZone +
      '; PropertyName=' +
      result.propertyName +
      '; UserLanguage=' +
      userLanguageCode +
      '; ProductId=' +
      result.productId +
      '; PlatformPropertyId=' +
      result.platformPropertyId +
      '; AutoLogOff=' +
      result.autoLogOff +
      ';LogOffAfter=' +
      result.logOffAfter +
      '; MaxDecimalPlaces=' +
        maxDecimalPlace;
    sessionStorage.setItem(PROPERTY_INFO, PropertyValues);
    sessionStorage.setItem(PROPERTY_DATE, result.propertyDate);
    /*TODO: Uncomment this once jwt token update implementation done */
    //  return this.GetUserToken(result).then(() => {
    //     this.SetPropertyInfo(result);
    //     this.setUserSettings(result);
    //     this.propertyInfo.SetPropertyDate(this.utils.getDate(result['propertyDate']), false);
    //     this.localize.SetLocaleBasedProperties();
    //   });
    this.SetPropertyInfo(result);
    this.userDefaultsService.syncDefaultValues(this.userInfo.userId);
    this.propertyInfo.SetPropertyDate(
      this.utils.getDate(result.propertyDate),
      false
    );
    this.localize.SetLocaleBasedProperties();
    this.commonLocalize.SetLocaleBasedProperties();
    this.UpdateUserRole(Selectedproperty.id);
  }

  async setEatecToken() {
    try {
      const serviceParams = {
        route: RetailRoutes.EatecToken,
        showError: true
      };
      const token = await this.loginService.makePostCall(serviceParams, false);
      sessionStorage.setItem('eatecJwt', token.result);
    } catch (ex) {

    }
  }

  async CreateUserSession(sessionInfo) {
    const sessionData = {
      id: 0,
      userId: Number(sessionInfo.userId),
      startTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
      propertyId: Number(sessionInfo.propertyId),
      productId: Number(sessionInfo.productId),
      timeZone: this.utils.GetClientTimeZone()
    };
    await this.CreateSession(sessionData);
  }

  async CreateSession(data) {
    const serviceParams = {
      route: RetailRoutes.CreateSession,
      uriParams: '',
      header: '',
      body: data,
      showError: true,
      baseResponse: true
    };
    const result = await this.loginService.makePostCall(serviceParams);
    const response = result.result as any;
    sessionStorage.setItem('userSession', response);
  }

  UpdateUserRole(propertyId: string) {
    let user = sessionStorage.getItem('_userInfo');
    let userSelectedProperty = this.userProperties.find(x => x.propertyCode == propertyId);
    let userInfoArr = user.split(';');

    userInfoArr = userInfoArr.map(function (item) {
      if (item.includes('roleId'))
        return userSelectedProperty && userSelectedProperty.roleId ? 'roleId=' + userSelectedProperty.roleId : item;
      else if (item.includes('roleName'))
        return userSelectedProperty && userSelectedProperty.roleName ? 'roleName=' + userSelectedProperty.roleName : item;
      else
        return item;
    });

    user = userInfoArr.join(';');
    sessionStorage.setItem('_userInfo', user);
  }
    

  async SetPropertyInfo(result: any) {
    const propertyId: number = Number(result.propertyId);
    this.propertyInfo.SetPropertyDate(result.propertyDate);
    this.propertyInfo.SetPropertyId(propertyId);
    this.SetPropertyConfiguration();
    if (!this.propertyInfo.UseRetailInterface) {
      this.SetPaymentConfiguration(propertyId);
    }

  }

  async SetPropertyConfiguration() {
    const propertityConfig = await this.PropertySettingService.getAllPropertySetting(this.propertyInfo.PropertyId);
    this.propertyInfo.SetPropertySetting(propertityConfig);
  }

  async SetPaymentConfiguration(propertyId: number) {
    const propertyPaymentConfig = await this.PropertySettingService.GetPaymentConfigurationByProperty(propertyId);
    this.propertyInfo.SetPaymentConfiguration(propertyPaymentConfig);
  }


  async SetPropertyApiConfiguration() {
    const propertityConfig = await this.PropertySettingService.GetAllPropertyConfigurationSettings({
      configurationName: PROPERTY_CONFIGURATION_SETTINGS,
      propertyId: this.propertyInfo.PropertyId,
      productId: 0
    } as API.PropertyConfigurationSettings<any>);
    if ((propertityConfig != null) && (Object.keys(propertityConfig.configValue).length > 0)) {
      this.propertyInfo.SetPropertyConfiguration(propertityConfig);
      // const language=this.utils.GetSessionStorageValue('_userInfo', 'language')||'en-US';
      // if(propertityConfig.configValue.GoogleMapApiKey)
      //   this.generateGoogleMapApi(propertityConfig.configValue.GoogleMapApiKey,language);
    }
  }


  async SetUserSessionConfiguration(userId: number) {
    let userSessionConfig = await this.userSessionConfig.getUserSessionConfiguration(userId);

    if (userSessionConfig) {
    //   let userSessionConfigValues =
    //     ` Id=${userSessionConfig.id};
    //       UserId=${userSessionConfig.userId};
    //       DefaultOutletId=${userSessionConfig.defaultOutletId};
    //       DefaultTerminalId=${userSessionConfig.defaultTerminalId};
    //       DefaultCourseId=${userSessionConfig.defaultCourseId};
    //       DefaultPaymentDevice=${userSessionConfig.defaultPaymentDevice};
    //       DefaultDeviceName=${userSessionConfig.defaultDeviceName};
    //       IsIdtechSred=${userSessionConfig.isIdtechSred};
    //       HangingTicketsPrinter=${userSessionConfig.hangingTicketsPrinter};
    //       SmallStickersPrinter=${userSessionConfig.smallStickersPrinter};
    // `;

      sessionStorage.setItem(this.userSessionConfig.userSessionConfigKey, JSON.stringify(userSessionConfig));

      // Set Retail Shop service - outlet dropdown value
      this.retailSharedService.SelectedOutletId = userSessionConfig.defaultOutletId;
      this.retailSharedService.SelectedTerminalId = userSessionConfig.defaultTerminalId;
    }
  }

  setAutoLogOff() {
    this.autoLogOff = this.utils.GetPropertyInfo('AutoLogOff');
    if (this.autoLogOff == 'true') {
      this.sessionService.resetOnTrigger = true;
      this.logOffAfter = +this.utils.GetPropertyInfo('LogOffAfter');
      this.sessionService.startTimer(this.logOffAfter);
    } else {
      this.sessionService.resetOnTrigger = false;
    }
  }

  /**
 * @function getbuttonEmitvalue;
 * @Param Input <object>
 * @param output <Nothing>
 * @description Get the return value of button emit
 */
  getbuttonEmitvalue(e): void {
    if (this.loginForms.valid) {
      let muname = '';
      let tenantCode = '';
      const id: any = (this.loginForms.controls.customerId.value !== '' && this.loginForms.controls.customerId.value !== undefined) ?
       this.loginForms.controls.customerId.value : this.custId;
      this.userName = this.loginForms.value.userId;

      if (this.userName.includes('@')) {
        muname = this.userName.substring(0, this.userName.indexOf('@'));
        tenantCode = this.userName.substring(this.userName.indexOf('@') + 1);
      } else {
        muname = this.userName;
      }
      this.tenantId = Number(id);
      this.validateCredentials({
        UserName: muname,
        Password: this.loginForms.controls.password.value,
        TenantId: this.tenantId != null ? this.tenantId : 0,
        Property: this.loginForms.controls.location.value, ProductId: Product.RETAIL, TenantCode: tenantCode
      });
    } else {
      this.loginForms.controls.userId.markAsTouched();
      this.loginForms.controls.password.markAsTouched();
      this.loginForms.controls['machineName'].markAsTouched();
    }
  }

  setVal() {
    const customerIdCtrl = this.loginForms.get('customerId');
    customerIdCtrl.setValidators([Validators.required]);
    customerIdCtrl.updateValueAndValidity();
    customerIdCtrl.markAsDirty();
  }

  removeVal() {
    const customerIdCtrl = this.loginForms.get('customerId');
    customerIdCtrl.clearValidators();
    customerIdCtrl.updateValueAndValidity();
    customerIdCtrl.markAsDirty();
  }

  private setUpPassword(arg, isSetPassword: boolean) {
    const componentDetails = {
      componentName: SetPasswordComponent,
      popUpDetails: {
        isStepper: false,
        eventName: 'notifyParent'
      }
    };
    this.dialog.open(SetPasswordComponent, {
      width: '55%',
      height: 'auto',
      disableClose: true,
      data: {
        title: arg.title,
        componentDetails,
        setPassword: isSetPassword,
        userName: arg.userName,
        tenantId: arg.tenantId
      }
    });
    this.loginForms.get('password').setValue('');
    this.errResponse = '';
  }

  private rememberUser() {
    this.rememberMe = this.loginForms.controls.rememberme.value;
    const user = this.loginForms.controls.userId.value;
    if (this.rememberMe) { this.sessionService.StoreUser(user); } else { this.sessionService.RemoveUser(user); }
  }

  private initializeForm(): void {
    this.loginForms = this.formBuilder.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      rememberme: false,
      location: ['Agilysys', Validators.required]
    });
    this.loginForms.valueChanges
      .pipe(takeUntil(this.$destroyed))
      .subscribe(r => {
        this.loginError = false;
        this.errResponse = '';
      });
  }

  private async setMachineInfo(propertyId: number) {
    this.resetMachineNameInfo();
    const userMachinePropertyInfo = this.userMachineInfo.userPropertiesMachineInfo.find(x=>x.propertyId == propertyId);
    const retailPropertyInfo = userMachinePropertyInfo.settings;
    // TRANSACTION_BY_MACHINENAME
    const retailMachineConfig = retailPropertyInfo.find(x=> x.switch == TRANSACTION_BY_MACHINENAME);
    if (retailMachineConfig) {
      this.isMachineNameEnabled = retailMachineConfig.value == 'true';
    }
    // SELECTION_ON_LOGIN
    const retailPromptConfig = retailPropertyInfo.find(x=> x.switch == SELECTION_ON_LOGIN);
    if (retailPromptConfig) {
      this.isPromptOnLoginEnabled = retailPromptConfig.value == 'true';
    }
    this.defaultMachineId = userMachinePropertyInfo.defaultMachineId;
    if(this.isMachineNameEnabled) {
      if(this.isPromptOnLoginEnabled) {      
        this.machineNames = userMachinePropertyInfo.machineNames.map(x => {
          return {
            id: x.id,
            name: x.name
          }
        });
        if(this.machineNames.length > 0) {
          this.loginForms.controls['machineName'].setValue('');
        }
      }      
    }
    if(this.defaultMachineId) {
      const machineName = this.machineNames.find(x => x.id == this.defaultMachineId);
      if(machineName) {
        this.loginForms.controls['machineName'].setValue(machineName);
      } else {
        this.loginForms.controls['machineName'].setValue(this.defaultMachineId);
      }
    }
  }

  compareSelect = (val1, val2) => {
    return val1 && val2 && val1.id === val2.id;
  }

  private resetMachineNameInfo() {
    this.isMachineNameEnabled = false;
    this.isPromptOnLoginEnabled = false;
    this.defaultMachineId = 0;
    this.machineNames = [];
    this.loginForms.controls['machineName'].setValue('0');  
  }

  private setMachineDetails() {
    const userMachine = this.loginForms.value.machineName;
    if(typeof(userMachine) == 'object') {
      this.localize.SetMachineId(userMachine.id);
      this.localize.SetMachineName(userMachine.name);
    } else {
      this.localize.SetMachineId(this.defaultMachineId);
      this.localize.SetMachineName('');
    }
  }
}
