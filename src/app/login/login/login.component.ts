import { Compiler, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { Localization } from 'src/app/core/localization/Localization';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
// import { PropertySettingDataService } from 'src/app/shared/data-services/authentication/propertysetting.data.service';
import { ManageSessionService } from '../manage-session.service';
import { SetPasswordComponent } from '../set-password/set-password.component';
import { JWT_TOKEN, USER_INFO, USER_SESSION, PROPERTY_INFO, PROPERTY_DATE, USER_SETTINGS } from 'src/app/core/app-constants';
import { LoginCommunicationService } from '../login-communication.service';
import * as moment from 'moment';
import { ButtonValue } from 'src/app/shared/shared-models';
import { Product } from 'src/app/common/shared/shared/globalsContant';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
  private _autoLogOff: any = false;
  private _logOffAfter = 1;
  showCustomerID = false;
  custId: any;
  userIdDir = 'capitalise,notallowspace,nospecailchar';
  tenantId: number;
  tenantIdFromParam: string;

  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private localize: Localization,
    private utils: Utilities,
    private route: ActivatedRoute,
    private sessionService: ManageSessionService,
    private loginService: LoginCommunicationService,
    // private PropertySettingService: PropertySettingDataService,
    private propertyInfo: PropertyInformation,
    // private sncService: SalesCateringCommunication,
    private _compiler: Compiler,
    private router: Router
  ) {
    this.initializeForm();
    this.captions = this.localize.captions;
  }

  ngOnInit() {
    this._compiler.clearCache();

    let _token = sessionStorage.getItem(JWT_TOKEN);
    if (this.localize.validateString(_token)) {
      this.router.navigate(['/home']);
    }

    this.captionGenerator();
    this.formGenerator();
    this.errorGenerator();
    this.getCustomerId();

    this.loginButton = {
      type: 'primary',
      label: this.captions.login,
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
    this.loginForms.controls['userId'].setValue(rememberedUser ? rememberedUser : '');
    this.loginForms.controls['rememberme'].setValue(rememberedUser ? true : false);
    this.loginForms.controls['password'].setValue('');
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
      location: ['Agilysys', Validators.required]
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

  async handleclick() {
    if (this.loginForms.valid) {
      const credentials = {
        userName: this.loginForms.value.userId,
        password: this.loginForms.value.password,
        tenantId:
          this.tenantIdFromParam != null
            ? this.tenantIdFromParam
            : this.utils.GetLocalStorageValue('propertyInfo', 'TenantId'),
        Property: this.loginForms.controls['location'].value,
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

      // Selecting property by default when there is only one property configured for tenant
      if (this.multipleProperties.length == 1) {
        this.loginForms.controls.location.setValue(this.multipleProperties[0]);
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
      this.router.navigate(['/home']);
    }
  }

  setpropertyvalues(Selectedproperty: any) {
    const result = this.propertyValues.find(
      item => item.propertyCode === Selectedproperty.id
    );
    const userLanguageCode =
      this.userInfo != null && this.userInfo.languageCode != ''
        ? this.userInfo.languageCode
        : result['languageCode'];
    const PropertyValues =
      'Language=' +
      result['languageCode'] +
      '; PropertyCode=' +
      result['propertyCode'] +
      '; SubPropertyCode=' +
      result['subPropertyCode'] +
      '; Currency=' +
      result['currencyCode'] +
      '; TenantId=' +
      result['tenantId'] +
      '; userName=' +
      this.userName +
      '; UserId=' +
      this.userInfo.userId +
      '; PropertyId=' +
      result['propertyId'] +
      '; SubPropertyId=' +
      result['subPropertyId'] +
      '; PlatformTenantId=' +
      result['platformTenantId'] +
      '; PropertyDate=' +
      result['propertyDate'] +
      '; TimeZone=' +
      result['timeZone'] +
      '; PropertyName=' +
      result['propertyName'] +
      '; UserLanguage=' +
      userLanguageCode +
      '; ProductId=' +
      result['productId'] +
      '; PlatformPropertyId=' +
      result['platformPropertyId'] +
      ';';
    sessionStorage.setItem(PROPERTY_INFO, PropertyValues);
    sessionStorage.setItem(PROPERTY_DATE, result['propertyDate']);
    /*TODO: Uncomment this once jwt token update implementation done */
    //  return this.GetUserToken(result).then(() => {
    //     this.SetPropertyInfo(result);
    //     this.setUserSettings(result);
    //     this.propertyInfo.SetPropertyDate(this.utils.getDate(result['propertyDate']), false);
    //     this.localize.SetLocaleBasedProperties();
    //   });
    this.SetPropertyInfo(result);
    this.setUserSettings(result);
    this.propertyInfo.SetPropertyDate(
      this.utils.getDate(result['propertyDate']),
      false
    );
    //this.CreateUserSession(result); Duplicate Call For Session Creation 
    this.localize.SetLocaleBasedProperties();
    this.UpdateUserRole(Selectedproperty.id);
  }

  async CreateUserSession(sessionInfo) {
    const sessionData = {
      id: 0,
      userId: Number(sessionInfo['userId']),
      startTime: moment().format('YYYY-MM-DDTHH:mm:ss'),
      propertyId: Number(sessionInfo['propertyId']),
      productId: Number(sessionInfo['productId']),
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
    var response = <any>result.result;
    sessionStorage.setItem('userSession', response);
  }

  UpdateUserRole(propertyId: string) {
    let user = sessionStorage.getItem('_userInfo');
    const userSelectedProperty = this.userProperties.find(x => x.propertyCode == propertyId);
    let userInfoArr = user.split(';');

    userInfoArr = userInfoArr.map(function (item) {
      if (item.includes('roleId')) {
        return userSelectedProperty && userSelectedProperty.roleId ? 'roleId=' + userSelectedProperty.roleId : item;
      } else if (item.includes('roleName')) {
        return userSelectedProperty && userSelectedProperty.roleName ? 'roleName=' + userSelectedProperty.roleName : item;
      } else {
        return item;
      }
    });

    user = userInfoArr.join(';');
    sessionStorage.setItem('_userInfo', user);
  }

  async SetPropertyInfo(result: any) {
    const propertyId: number = Number(result['propertyId']);
    this.propertyInfo.SetPropertyDate(result['propertyDate']);
    this.propertyInfo.SetPropertyId(propertyId);
    this.SetPropertyConfiguration();
    if (!this.propertyInfo.UseRetailInterface) {
      this.SetPaymentConfiguration(propertyId);
    }

  }

  async SetPropertyConfiguration() {
    // const propertityConfig = await this.PropertySettingService.getAllPropertySetting(this.propertyInfo.PropertyId);
    // this.propertyInfo.SetPropertySetting(propertityConfig);
  }

  async SetPaymentConfiguration(propertyId: number) {
    // const propertyPaymentConfig = await this.PropertySettingService.GetPaymentConfigurationByProperty(propertyId);
    // this.propertyInfo.SetPaymentConfiguration(propertyPaymentConfig);
  }

  async setUserSettings(properties) {
    /*To get the daysout value*/
    // const serviceParams = {
    //   route: RetailApiRoute.GetSncUserConfig,
    //   uriParams: { id: this.userInfo.userId },
    //   header: '',
    //   body: '',
    //   showError: true,
    //   baseResponse: true
    // };
    // const userConfig: any = await this.sncService.getPromise(serviceParams);
    // const userSettings = `daysOut=${
    //   userConfig && userConfig.userSncConfiguration
    //     ? userConfig.userSncConfiguration.daysOut
    //     : ''
    //   };
    //       AutoLogOff=${properties ? properties['autoLogOff'] : ''};
    //       LogOffAfter=${properties ? properties['logOffAfter'] : ''};`;
    // sessionStorage.setItem(USER_SETTINGS, userSettings);
    // this.setAutoLogOff();
  }

  setAutoLogOff() {
    this._autoLogOff = this.utils.GetUserSettings('AutoLogOff');
    if (this._autoLogOff == 'true') {
      this.sessionService.resetOnTrigger = true;
      this._logOffAfter = +this.utils.GetUserSettings('LogOffAfter');
      this.sessionService.startTimer(this._logOffAfter);
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
      const id: any = (this.loginForms.controls.customerId.value !== '' && this.loginForms.controls.customerId.value !== undefined) ? this.loginForms.controls.customerId.value : this.custId;
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
        Password: this.loginForms.controls['password'].value,
        TenantId: this.tenantId != null ? this.tenantId : 0,
        Property: this.loginForms.controls['location'].value, ProductId: Product.RETAIL, TenantCode: tenantCode
      });
    } else {
      this.loginForms.controls['userId'].markAsTouched();
      this.loginForms.controls['password'].markAsTouched();
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
    this.rememberMe = this.loginForms.controls['rememberme'].value;
    const user = this.loginForms.controls['userId'].value;
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
}
