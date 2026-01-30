import { Compiler, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { Utilities } from 'src/app/core/utilities';
import { PropertySettingDataService } from 'src/app/shared/data-services/authentication/propertysetting.data.service';
import { ManageSessionService } from '../manage-session.service';
import { SetPasswordComponent } from '../set-password/set-password.component';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { UserLoginType } from 'src/app/common/enums/shared-enums';

import {
  JWT_TOKEN, USER_INFO,
  USER_SESSION, PROPERTY_INFO, PROPERTY_DATE, PROPERTY_CONFIGURATION_SETTINGS,
  FULL_STORY_ORG_ID,
  NO_OF_DECIMAL_DIGITS,
  SUPPORT_TENANT,
  RETAIL_PRODUCT_ID,
  SUPPORT_USERNAME
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
import { TenantConfigurations, UserMachineInfo } from 'src/app/common/shared/shared.modal';
import { PropertySettingDataService as RetailPropertySettingDataService } from 'src/app/retail/sytem-config/property-setting.data.service';
import { PayAgentService } from 'src/app/retail/shared/service/payagent.service';
import { ConfigKeys, RetailConstants } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { PropertyFeaturesConfigurationService } from 'src/app/retail/sytem-config/payment-features-config/property-feature-config.service';
import { FeatureName, RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { PropertyService } from 'src/app/common/services/property.service';
import * as FullStory from '@fullstory/browser';
import { CryptoUtility } from 'src/app/core/utilities/crypto.utility';
import { OAuthService, NullValidationHandler, OAuthEvent } from 'angular-oauth2-oidc';
import { AlertType, ButtonType } from 'src/app/shared/shared-models';
import { AlertType as CommonAlertType } from 'src/app/common/Models/common.models';
import { CommonAlertPopupComponent } from 'src/app/common/shared/shared/common-alert-popup/common-alert-popup.component';
import { ADB2CAuthConfiguration } from 'src/app/common/shared/auth.config';
import { LoginRoutes } from '../login.routes';
import * as CONSTANTS from 'src/app/common/constants';
import { cloneDeep } from 'lodash';
import { UTempDataUtilities } from 'src/app/common/shared/shared/utilities/utempdata-utilities';
import { DMConfigDataService } from 'src/app/common/dataservices/datamagine-config.data.service';
import { TenantConfigurationDataService } from 'src/app/retail/shared/service/data- services/tenantConfiguration.data.service';
import { UserSecurityQuestionComponent } from 'src/app/common/user-security-question/user-security-question/user-security-question.component';
import { AlertAction } from 'src/app/common/enums/shared-enums';
import { UserSecurityQuestionBusinessService } from 'src/app/common/user-security-question/user-security-questions.business.service';
import { CommonApiRoutes } from 'src/app/common/common-route';
import { ForgetPasswordComponent } from 'src/app/common/components/forget-password/forget-password.component';
import { CommonControllersRoutes } from 'src/app/common/communication/common-route';
import jwt_decode from 'jwt-decode';
import { FiscalProcessingService } from 'src/app/common/services/fiscal-processing.service';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UserMachineConfigurationService, RetailFunctionalityBusiness, RetailFunctionalityService, CryptoUtility],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {
  captions: any;
  loginForms: UntypedFormGroup;
  loginError: boolean;
  loginSuccess = false;
  hideLoginForm = false;
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
  maxLength: number = CONSTANTS.CUSTOMERID_LENGTH;
  userIdDir = 'capitalise,notallowspace,nospecailchar';
  tenantId: number;
  tenantIdFromParam: string;
  currYear = '2026';// Intentionally hardcoded copyright year to prevent dynamic changes for customers not receiving the next release.
  prevYear = '2020'
  passwordSetting: any;
  //Machine Name
  isMachineNameEnabled: boolean;
  isPromptOnLoginEnabled: boolean;
  defaultMachineId: number = 0;
  machineNames = [];
  userMachineInfo: UserMachineInfo;
  uTempDataPrimary: string;
  uTempDataSecondary: string;
  ADB2CAuthenticationEnabled: boolean = false;
  errorvalue: string;
  errordescription: string;
  isSupportUser: boolean = false;
  allTenantDetails: any[] = [];
  tenantIdList: any[] = [];
  propertyIdListForATenant: any[] = [];
  allPropertyDetails: any[] = [];
  userDetail: any;
  ssoNotConfigured: boolean = false;

  @ViewChild('fcs_userID') fcs_userID: ElementRef;
  @ViewChild('fcs_pwd') fcs_pwd: ElementRef;
  @ViewChild('fcs_custID') fcs_custID: ElementRef;
  muname: string;
  tenantCode: string;
  enablePropertySelection: boolean = false;
  initialTenantIdList: any[] = [];
  @ViewChild('myInput') myInput: ElementRef;
  inputSearch;
  showLoginloader: boolean = false;
  showSSOLoginloader: boolean = false;
  private intervalId: any; // Type 'any' can be replaced with 'number'
  private elapsedTime: number = 0;
  commonCaptions: any;
  securityUserId: number;
  isUserValid: any;
  disableForgetPassword: boolean = false;
  showSignInOptions: boolean = false;

  constructor(
    private dialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
    private localize: RetailStandaloneLocalization,
    private commonLocalize: Localization,
    private utils: Utilities,
    private sessionService: ManageSessionService,
    private loginService: LoginCommunicationService,
    private PropertySettingService: PropertySettingDataService,
    private propertyInfo: PropertyInformation,
    private propertyServices: PropertyService,
    private userDefaultsService: UserdefaultsInformationService,
    private retailPropertySettingDataService: RetailPropertySettingDataService,
    private compiler: Compiler,
    private router: Router,
    private userSessionConfig: UserMachineConfigurationService,
    private retailSharedService: RetailSharedVariableService,
    private propertyFeatureService: PropertyFeaturesConfigurationService,
    private retailpropertyInfo: RetailPropertyInformation,
    private retailFunc: RetailFunctionalityBusiness,
    private payAgentService: PayAgentService,
    private crypto: CryptoUtility,
    private oauthService: OAuthService,
    private route: ActivatedRoute,
    private adb2cAuthConfiguration: ADB2CAuthConfiguration,
    private dmConfigDataService: DMConfigDataService,
    private _subPropertyDataService: SubPropertyDataService,
    private utempdatautils: UTempDataUtilities,
    private configuration: TenantConfigurationDataService,
    private _userSecurityQuestionsService: UserSecurityQuestionBusinessService,
    private _fiscalProcessingService: FiscalProcessingService
  ) {
    // this.initializeForm();
    // this.captions = this.localize.captions;
    this.commonCaptions = this.localize.getCaptions().common;
  }

  async ngOnInit() {
    document.querySelectorAll('body')[0].setAttribute('id', "bodyId");
    this.enableLoginloader(false);
    this.enablePropertySelection = false;

    if(!sessionStorage.getItem('showSignInOptions')){
      sessionStorage.setItem('showSignInOptions', true.toString());
    }
    await this.initializeForm();
    let custId = this.commonLocalize.getLocalCookie('appRetailCustID');
    if (custId != '') {
      this.loginForms.controls['customerId'].setValue(custId);
      if (!this.ADB2CAuthenticationEnabled) {
        this.loginForms?.controls["customerId"].disable();
        this.getbuttonEmitvalue('');
      }
    }

    if (this.router.url && this.router.url === '/supportlogin') {
      this.isSupportUser = true;
      this.loginForms.controls['customerId'].setValue(SUPPORT_TENANT);
      this.loginForms?.controls["customerId"].disable();
      this.getbuttonEmitvalue('');
    }

    this.route.queryParams.subscribe(params => {
      this.errorvalue = params.error;
      this.errordescription = params.error_description;
      if (this.errorvalue != undefined && this.errordescription != undefined && this.errorvalue != '' && this.errordescription != '') {
        this.utils.showAlert(this.errorvalue + "<br>" + this.errordescription, AlertType.Info, ButtonType.Ok, (res => {
          window.location.href = window.location.origin + '/Retail/login';
        }));
        return false;
      }
    });
  }

  OnFormValueChanges(): any {
    if (!this.ADB2CAuthenticationEnabled) {
      this.useridSubscribe = this.loginForms.get('userId').valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(r => {
        // if (r.includes('@')) {
        //   this.showCustomerID = false;
        //   this.removeVal();
        // } else {
        //   this.showCustomerID = true;
        //   this.setVal();
        // }
        this.loginError = false;
        this.errResponse = '';
      });
      this.passwordSubscribe = this.loginForms.get('password').valueChanges.pipe(takeUntil(this.$destroyed)).subscribe(r => {
        this.loginError = false;
        this.errResponse = '';
      });
    }
  }

  async getCustomerId() {
    const serviceParams = {
      route: RetailRoutes.EnvironmentConfig,
      uriParams: '',
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    await this.loginService.makeGetCall(serviceParams).then((res: any) => {
      this.custId = res ? res.result : 0;
      if (this.custId == '0' || this.ADB2CAuthenticationEnabled) {
        this.userIdDir = 'capitalise,notallowspace';
        this.showCustomerID = true;
        this.setVal();
        this.OnFormValueChanges();
      } else {
        this.enableLoginloader(false);
        this.userIdDir = 'capitalise,notallowspace,nospecailchar';
        this.showCustomerID = false;
        this.loginForms?.controls["customerId"].disable();
        this.removeVal();
      }
    });
    this.setValues();
    let tenantId = localStorage.getItem('TenantId');
    let adb2cEnabled = localStorage.getItem('ADB2CAuthenticationEnabled');
    if (adb2cEnabled != null && adb2cEnabled.toLowerCase() == "true") {
      await this.configureAuth(tenantId);
    }
    //To load form for general authentication
    if (adb2cEnabled == null || (adb2cEnabled != null && adb2cEnabled.toLowerCase() == "false")) {
      this.hideLoginForm = false;
    }
  }

  formGenerator() {
    this.loginForms = this.formBuilder.group({
      userId: ['', Validators.required],
      password: ['', Validators.required],
      customerId: [''],
      rememberme: false,
      location: ['Agilysys', Validators.required],
      machineName: ['0', Validators.required],
      tenantId: [''],
      propertyId: ['']
    });
  }

  errorGenerator() {
    this.errorMessage = {
      userId: this.captions.login.enterUserId,
      password: this.captions.login.enterPassword,
      customerId: this.captions.login.customerID
    };
  };

  captionGenerator() {
    this.captions = this.localize.getCaptions();
  }

  ngOnDestroy() {
    this.stopInterval();
    // Stopwatch is now managed by ManageSessionService and persists after login component is destroyed
    if (this.$destroyed) {
      this.$destroyed.next(true);
      this.$destroyed.complete();
    }
  }

  loadProperties() {
    if (!this.ADB2CAuthenticationEnabled) {
      const customerId: any = (this.loginForms.controls.customerId.value !== '' && this.loginForms.controls.customerId.value !== undefined) ? this.loginForms.controls.customerId.value : this.custId;
    }
  }

  onPropertyChange(eve) {
    const propertyInfo = this.propertyValues.find(item => item.propertyCode === eve.value.id);
    this.setMachineInfo(propertyInfo.propertyId);
  }

  loadMachineNames() {
    this.machineNames = this.machineNames;
  }

  async handleclick() {
    if (!this.ADB2CAuthenticationEnabled) {
      this.generalAuthLogin();
    }
  }

  async getADB2CEmailClaim(claims, tenantId) {
    let email = "";
    let user;
    let userName = claims['name'];

    if (claims != null && claims != undefined) {
      if (claims['emails'] != null && claims['emails'].length > 0) {
        email = claims['emails'][0];
      }
      else if (claims['email'] != null) {
        email = claims['email'];
      }
      else if (userName != null) {
        const serviceParams = {
          route: RetailRoutes.GetUserByTenantId,
          uriParams: { "UserName": userName, "tenantId": tenantId },
          header: '',
          body: '',
          showError: true,
          baseResponse: true
        };
        let token = localStorage.getItem('id_token');
        sessionStorage.setItem('_jwt', token);
        user = await this.loginService.makeGetCall(serviceParams);
        email = user.result.email;
      }
      else {
        this.utils.showAlert(this.captions.lbl_UserTokenErrorMessage, AlertType.Error, ButtonType.Ok, (res => {
          this.adb2cLogout();
        }));
      }
    }

    return email;
  }

  async adb2cAuthLogin() {
    let tenantId = localStorage.getItem('TenantId');
    this.loginForms.controls.customerId.setValue(tenantId);
    let claims = this.adb2cClaims;
    const credentials = {
      email: await this.getADB2CEmailClaim(claims, tenantId),
      tenantId: tenantId,
      ProductId: Product.RETAIL
    };
    if (!credentials.email) {
      this.utils.showAlert(this.captions.lbl_AzureTokenErrorMessage, AlertType.Error, ButtonType.Ok, (res => {
        this.adb2cLogout();
      }));
      return false;
    }
    if (Number(tenantId) == SUPPORT_TENANT) {
      await this.ProcessSupportUserLogin(credentials.email);
    } else {
      await this.validateAdb2cCredentials(credentials, claims, tenantId);
    }
  }

  async generalAuthLogin() {
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
    if (!this.ADB2CAuthenticationEnabled && loginDetails.result.userLoginInfo.isNewUser === true) {
      this.setPassword = true;
      this.tenantId = Number(id);
      const content = { title: 'SETUP PASSWORD', userName: this.userName, tenantId: this.tenantId };
      this.setUpPassword(content, true);
    } else if ((!this.ADB2CAuthenticationEnabled || this.showSignInOptions) && loginDetails.result.userLoginInfo.isPasswordExpired === true) {
      this.passwordSetting = loginDetails.result.passwordSetting;
      const content = { title: 'CHANGE PASSWORD', userName: this.userName, tenantId: this.tenantId, passwordSetting: this.passwordSetting };
      this.setUpPassword(content, false);
    } else {
      this.sessionService.UpdateUserSessionsInfo(loginDetails.result);
      //Commented as Reminder Popup is not required as of now
      // if(!this.ADB2CAuthenticationEnabled && !this.isSupportUser && !this.disableForgetPassword)
      //   await this.setupUserSecurityQuestions();
      this.propertyValues = loginDetails.result.userProperties;
      this.captionGenerator();
      // this.loginSuccess = !this.loginSuccess;
      this.multipleProperties = this.propertyValues.map(x => ({
        id: x.propertyCode,
        name: x.propertyName
      }));
      this.userMachineInfo = await this.retailPropertySettingDataService.GetMachineNamesAndConfigurationSetting(this.userInfo.userId, Product.RETAIL,
        this.propertyValues.map(x => x.propertyId));
      if (this.propertyValues.length > 1 || this.propertyValues.length == 0) {
        this.loginSuccess = !this.loginSuccess;
      }
      this.enableLoginloader(false);
      // Selecting property by default when there is only one property configured for tenant
      if (this.multipleProperties.length == 1) {
        this.setMachineInfo(this.propertyValues[0].propertyId);
        this.loginSuccess = false;
        this.enablePropertySelection = true;
        if (this.isMachineNameEnabled && this.isPromptOnLoginEnabled && this.machineNames.length > 0) {
          this.enableLoginloader(false);
          this.loginSuccess = true;
          this.loginForms.controls.location.setValue(this.multipleProperties[0]);
        } else {
          this.validateCredentials({ UserName: this.muname, Password: this.loginForms.controls["password"].value, TenantId: this.tenantId != null ? this.tenantId : 0, Property: this.multipleProperties[0], ProductId: Product.RETAIL, TenantCode: this.tenantCode });
        }
      }
      // else //For AD B2C Auth flow - show login form property selection
      // {
      //   this.hideLoginForm = false;
      // }
      this.hideLoginForm = false;
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
                      changePropertyEnabled=${loginDetails.result.userLoginInfo.isPropertyChangeAllow};
                    `;
    sessionStorage.setItem(USER_INFO, userInfo);
  }

  async GetADB2CAuthConfig(tenantId: string) {
    const iTenantId: number = Number(tenantId);
    const serviceParams = {
      route: LoginRoutes.GetADB2CAuthConfig,
      uriParams: { "tenantId": iTenantId, "productId": Product.RETAIL },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    let adb2cConfig: any;
    adb2cConfig = await this.loginService.makeGetCall(serviceParams);
    this.adb2cAuthConfiguration.ADB2CAuthFeatureEnabled = adb2cConfig.result.adB2CAuthenticationEnabled;
    this.adb2cAuthConfiguration.DiscoveryDocumentConfigUrl = adb2cConfig.result.discoveryDocumentUrl;
    this.adb2cAuthConfiguration.enableFormsAuthentication = adb2cConfig.result.enableFormsAuthentication;

    let adb2cUrl = this.commonLocalize.getLocalCookie('supportUserMailId') || sessionStorage.getItem('supportUserMailId') || this.isSupportUser ? '/Retail/supportlogin' : '/Retail/login';
    this.adb2cAuthConfiguration.authConfig = {
      redirectUri: window.location.origin + adb2cUrl,
      postLogoutRedirectUri: window.location.origin + adb2cUrl,
      responseType: 'code',
      issuer: adb2cConfig.result.issuer,
      strictDiscoveryDocumentValidation: false,
      tokenEndpoint: adb2cConfig.result.tokenEndPoint,
      loginUrl: adb2cConfig.result.loginUrl,
      clientId: adb2cConfig.result.clientId,
      scope: 'openid',
      skipIssuerCheck: true,
      clearHashAfterLogin: true,
      oidc: true
    };
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
    if (!this.loginSuccess && !this.enablePropertySelection) {
      // Validate credentials
      if (this.uTempDataPrimary && this.uTempDataSecondary) {
        serviceParams.body.Password = this.crypto.EncryptString(credentials.Password, this.uTempDataPrimary, this.uTempDataSecondary);
        serviceParams.route = RetailRoutes.LoginEncrypted;
      }
      const loginDetails = await this.loginService.makePostCall(serviceParams);
      
      if (loginDetails.successStatus) {
        if(this.ADB2CAuthenticationEnabled && loginDetails.result?.userLoginInfo?.loginType !== UserLoginType.Forms){
          this.loginError = true;
          this.enableLoginloader(false);
          this.loginButton.disabledproperty = false;
          this.errResponse = this.captions.formAuthenticationDenied;
        }
        else{
          this.userName = credentials.UserName;
          //implement one methd for storing time in localstorage from api
          if(loginDetails.errorCode==0)
          {
              await this.HMACAuthSetup(loginDetails);
          }
          
          await this.successCallBack(loginDetails);
          this.rememberUser();
        }
      } 
      else {
        if (loginDetails.errorCode == 5001) {
          this.loginError = true;
          this.enableLoginloader(false);
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
      const selectedProperty = this.propertyValues.find(
        item => item.propertyCode === credentials.Property.id
      );
      this.SetPropertyInfo(selectedProperty);
      this.userDefaultsService.setOutlets();
      await this.setEatecConfig();
      await this.dmConfigDataService.SetDataMagineConfig();
      this.setAutoLogOff();
      await this.SetUserSessionConfiguration(this.userInfo.userId);
      this.setMachineDetails();
      sessionStorage.setItem(RetailConstants.EnableResortFinance, this.userInfo.enableResortFinance.toString());
      await this.propertyServices.setAuthorizeTokenBySession();
      // Set ProcessInvoice type based on fiscal legal entity sync type
      await this._fiscalProcessingService.setProcessInvoiceType();
      this.router.navigate(['/home']);
      this.propertyServices.Checkfordeployment();
      await this.retailFunc.getRetailFunctionality();
      let userDetails = await this.sessionService.GetUserSessionsInfo();
      console.log(userDetails)
      const result = userDetails.userProperties.find(item => item.propertyId === selectedProperty.propertyId);
      await this.propertyServices.setJasperAttributes(result?.roleId);
    }
  }

  async HMACAuthSetup(loginDetails: any)
  {
    const decodeToken = jwt_decode(loginDetails.result?.token);
    if(decodeToken && decodeToken['hauth'])
    {

    
    
    // Get UTC time from token
    const tokenUtcTime = decodeToken['utc_time'];
    
    if (tokenUtcTime) {
      // Get current client UTC time
      const clientUtcTime = new Date().toISOString();
      
      // Convert both times to Date objects for comparison
      const tokenDate = new Date(tokenUtcTime);
      const clientDate = new Date(clientUtcTime);
      
      // Calculate the difference in milliseconds
      const timeDifference = Math.abs(tokenDate.getTime() - clientDate.getTime());
      
      // Convert milliseconds to minutes
      const differenceInMinutes = timeDifference / (1000 * 60);
      
      
      //need to implement for now i comment this part
      // Check if difference is greater than 1 minute )
      // if (differenceInMinutes > 1) {
      //   const warningMessage = this.captions.timeDifferenceWarning 
      //   //|| 'Please change your local time setup to ensure proper synchronization.';
        
      //   this.utils.showAlert(
      //     warningMessage,
      //     AlertType.Warning,
      //     ButtonType.Ok
      //   );
      // }
      
      // Start the client-side stopwatch using the service (runs throughout the app lifecycle)
      this.sessionService.startClientStopwatch(tokenUtcTime);
    }
  }

  }

  async setpropertyvalues(Selectedproperty: any, userProperties?) {
    const result = userProperties ? userProperties.find(item => item.propertyCode === Selectedproperty.id) : this.propertyValues.find(
      item => item.propertyCode === Selectedproperty.id
    );
    const userLanguageCode =
      this.userInfo != null && this.userInfo.languageCode != ''
        ? this.userInfo.languageCode
        : result.languageCode;
    let maxDecimalPlace = result["maximumDecimalPlaces"] >= 0 ? result["maximumDecimalPlaces"] : 2;

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
      maxDecimalPlace +
      '; PropTimeFormat=' +
      result.propTimeFormat +
      '; PlatFormExtendedSearchRequired=' +
      result.platFormExtendedSearchRequired +
      ';';
    sessionStorage.setItem(PROPERTY_INFO, PropertyValues);
    sessionStorage.setItem(PROPERTY_DATE, result.propertyDate);
    /*TODO: Uncomment this once jwt token update implementation done */
    //  return this.GetUserToken(result).then(() => {
    //     this.SetPropertyInfo(result);
    //     this.setUserSettings(result);
    //     this.propertyInfo.SetPropertyDate(this.utils.getDate(result['propertyDate']), false);
    //     this.localize.SetLocaleBasedProperties();
    //   });
    this.propertyInfo.SetPropertyDate(
      this.utils.getDate(result.propertyDate),
      false
    );
    this.localize.SetLocaleBasedProperties();
    this.commonLocalize.SetLocaleBasedProperties();
    this.UpdateUserRole(Selectedproperty.id);
    await this.configuration.SetAllowTokenSharing();
  }

  async setEatecConfig() {
    this.propertyFeatureService.getPropertyFeatures().then(async (feature) => {
      const propIds = [];

      const eatecFeature = feature.find(x => x.featureName === FeatureName.EnhancedInventory);
      const pmsRevenuePosting = feature && feature.find(x => x.featureName === FeatureName.PMS_RevenuePosting && x.isActive);
      if (eatecFeature != null && eatecFeature.isActive) {
        let isEatecAsMaster = false;
        const configuration = await this.configuration.GetTenantConfiguration();
        if (configuration?.configValue) {
          isEatecAsMaster = configuration.configValue?.IsEatecMaster ? configuration.configValue.IsEatecMaster.toLowerCase() == 'true' : false;
          sessionStorage.setItem("isEatecAsMaster", isEatecAsMaster.toString());
        }
        if (!isEatecAsMaster) {
          sessionStorage.setItem('isEatecEnabled', 'true');
          propIds.push(eatecFeature.id);
          const propConfig: {} = JSON.parse(sessionStorage.getItem('propConfig'));
          const enableRetailIC = propConfig ? (propConfig['EnableRetailIC'] == 'true' ? true : false) : false;
          if (enableRetailIC) {
            const siteId = await this.retailPropertySettingDataService.GetSiteIdForIC();
            sessionStorage.setItem('LoggedInSiteId', JSON.stringify(siteId));
            let outlets = await this._subPropertyDataService.getOutlets();
            let OutletIdlist: any = outlets.map(x => x.id);
            sessionStorage.setItem('FromLocId', JSON.stringify((OutletIdlist ? OutletIdlist : '')));
            sessionStorage.setItem('IniDateFieldFormat', this.localize.inputDateFormat);
            sessionStorage.setItem('LocalCurrencyCode', this.localize.currencyCode);
          } else {
            await this.setEatecToken();
          }
        }
      } else {
        sessionStorage.setItem('isEatecEnabled', 'false');
        this.retailpropertyInfo.SetEatecRI('');
      }
      if (pmsRevenuePosting) {
        propIds.push(pmsRevenuePosting.id);
      }

      if (propIds.length > 0) {
        this.propertyFeatureService.GetFeatureConfigurationsById(propIds).then((featureconfigurations) => {
          if (eatecFeature && featureconfigurations != null && featureconfigurations.length > 0) {
            const eatecUser = featureconfigurations.find(f => f.configurationKey === ConfigKeys.Eatec.EatecTenantUser);
            const uri = featureconfigurations.find(f => f.configurationKey === ConfigKeys.Eatec.EatecURI);
            const EIFeature = {
              EISSOWaitPeriodInSecs: featureconfigurations.find(f => f.configurationKey === ConfigKeys.Eatec.EISSOWaitPeriodInSecs)?.configurationValue,
              EISSOTriggerAlways: featureconfigurations.find(f => f.configurationKey === ConfigKeys.Eatec.EISSOTriggerAlways)?.configurationValue,
            };
            this.retailpropertyInfo.SetEatecConfiguration(EIFeature);
            if (eatecUser && eatecUser.configurationValue && uri && uri.configurationValue) {
              this.retailpropertyInfo.SetEatecRI(uri.configurationValue);
            } else {
              this.retailpropertyInfo.SetEatecRI('');
            }
          } else {
            this.retailpropertyInfo.SetEatecRI('');
          }

          if (pmsRevenuePosting && featureconfigurations != null && featureconfigurations.length > 0) {
            const pmsSystem = featureconfigurations.find(f => f.configurationKey === ConfigKeys.PMSRevenuePosting.PMSSystem)?.configurationValue;
            if (pmsSystem && pmsSystem != null) {
              sessionStorage.setItem('pmsSystem', pmsSystem);
            }
          }
        });
      }
    });
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
    this.SetPropertyApiConfiguration();
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
    this.GetSupportedPMAgentVersionByPropertyID(propertyId);
    this.GetWebCommunicationProxyVersion();
  }

  async GetSupportedPMAgentVersionByPropertyID(propertyId: number) {
    if (this.propertyInfo.SkipPMAgent) return; //No need to Validate the PMAgent version if SkipPMAgent is enabled
    const supportedPmAgentVersion = await this.PropertySettingService.GetSupportedPMAgentVersionByPropertyID(propertyId);
    this.propertyInfo.SetSupportedPMAgentVersion(supportedPmAgentVersion);
    this.payAgentService.ValidatePayAgentVersion();
  }

  async GetWebCommunicationProxyVersion() {
    const WebProxyCheck = await this.retailPropertySettingDataService.GetWebCommunicationProxyVersion();
    this.retailpropertyInfo.SetWebCommunicationProxyVersionCheck(WebProxyCheck)
  }

  async getDefaultsSetting() {
    return await this.userSessionConfig.getAllClientSetting();
  }

  async SetPropertyApiConfiguration() {
    const propertityConfig = await this.PropertySettingService.GetAllPropertyConfigurationSettings({
      configurationName: PROPERTY_CONFIGURATION_SETTINGS,
      propertyId: this.propertyInfo.PropertyId,
      productId: 0
    } as API.PropertyConfigurationSettings<any>);
    this.SetNoOfDecimalDigits(propertityConfig);
    if ((propertityConfig != null) && (Object.keys(propertityConfig.configValue).length > 0)) {
      this.propertyInfo.SetPropertyConfiguration(propertityConfig);
      this.SetFullStory(propertityConfig);
      if (propertityConfig.configValue.GoogleMapApiKey !== undefined) {
        if (propertityConfig.configValue.GoogleMapApiKey) {
          if (propertityConfig.configValue.GoogleMapApiKey !== localStorage.getItem('googleMapsApiKey')) {
            localStorage.setItem('googleMapsApiKey', propertityConfig.configValue.GoogleMapApiKey);
            localStorage.removeItem('invalidKey');
            localStorage.removeItem('resetMapApiKey');
            this.propertyServices.reloadPage();
          }
        }

        if (!propertityConfig.configValue.GoogleMapApiKey && localStorage.getItem('googleMapsApiKey')) {
          localStorage.removeItem('googleMapsApiKey');
          localStorage.setItem('resetMapApiKey', 'true');
          this.propertyServices.reloadPage();
        } else {
          localStorage.removeItem('resetMapApiKey');
        }
      }
    }
  }

  SetFullStory(propertyConfig: any) {
    if (propertyConfig.configValue != undefined && propertyConfig.configValue[FULL_STORY_ORG_ID] != undefined) {
      FullStory.init({ orgId: propertyConfig.configValue[FULL_STORY_ORG_ID] });
      FullStory.identify('RETAIL-' + this.userInfo.userName, {
        "displayName": 'RETAIL-' + this.userInfo.userName,
        "productId": Product.RETAIL.toString(),
        "productName": "RETAIL",
        "tenantId": this.userInfo.tenantId?.toString() ?? "",
        "tenantCode": this.userInfo.tenantCode?.toString() ?? "",
        "propertyId": propertyConfig.propertyId?.toString() ?? "",
        "propertyName": this.propertyInfo.GetPropertyInfoByKey('PropertyName')
      });
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

      let defaultsSetting = await this.getDefaultsSetting();
      sessionStorage.setItem('defaultSettings', JSON.stringify(defaultsSetting));

      // Set Retail Shop service - outlet dropdown value
      this.retailSharedService.SelectedOutletId = userSessionConfig.defaultOutletId;
      this.retailSharedService.SelectedTerminalId = userSessionConfig.defaultTerminalId;
    }
  }

  setAutoLogOff() {
    this.autoLogOff = this.utils.GetPropertyInfo('AutoLogOff');
    const tokenDuration = parseInt(sessionStorage.getItem('loginDuration'));
    if (this.autoLogOff == 'true') {
      this.sessionService.resetOnTrigger = true;
      this.logOffAfter = +this.utils.GetPropertyInfo('LogOffAfter');
      this.sessionService.startTimer(this.logOffAfter, tokenDuration);
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
  async getbuttonEmitvalue(e): Promise<void> {
    this.ssoNotConfigured = false;
    let eventKey: string = '';
    if (!this.showLoginloader) {

      window.onbeforeunload = null;
      this.commonLocalize.setLocalCookie('appRetailCustID', this.loginForms.get('customerId').value);
      if (e) {
        this.enableLoginloader(true);

        e.preventDefault();
        this.loginForms.markAsUntouched();
        sessionStorage.setItem('showSignInOptions', true.toString());
        this.showSignInOptions = true;
      }
      else{
        sessionStorage.setItem('showSignInOptions', false.toString());
        this.showSignInOptions = false;
      }
      sessionStorage.setItem('logineventKey', '');
      if (this.showCustomerID) {
        if (e instanceof KeyboardEvent) {
          if (e.key === 'Enter') {
            eventKey = e.key;
            sessionStorage.setItem('logineventKey', 'Enter');
          }
        }

        localStorage.setItem('TenantId', this.loginForms.get('customerId').value);
        let tenantId = localStorage.getItem('TenantId');
        await this.configureAuth(tenantId, eventKey);
        localStorage.setItem('ADB2CAuthenticationEnabled', this.ADB2CAuthenticationEnabled.toString());
        this.loginForms.get('customerId').markAsTouched();
        //Get Config for disable forget password
        await this.GetTenantConfigurationForForgetPassword();
        if (this.ADB2CAuthenticationEnabled && (eventKey === 'Enter' || this.loginSuccess  || this.isSupportUser || !this.adb2cAuthConfiguration.enableFormsAuthentication)) {
          this.removeGeneralLoginVal();
          await this.adb2cAuthValidation();
        }
        else {
          this.enableLoginloader(false);
          this.showCustomerID = false;
          this.loginForms?.controls["customerId"].disable();
          setTimeout(() => {
            this.fcs_userID.nativeElement.focus();
          }, 0);
        }
      }
      else if (this.ADB2CAuthenticationEnabled && this.isSupportUser) {
        this.removeGeneralLoginVal();
        this.validateAdb2cCredentialsForSupportUser();
      }
      else if (this.ADB2CAuthenticationEnabled && !this.showSignInOptions) {
        this.removeGeneralLoginVal();
        await this.adb2cAuthValidation();
      }
      else {
        this.loginForms.controls['userId'].markAsTouched();
        this.loginForms.controls['password'].markAsTouched();
        this.setGeneralLoginVal();
        this.generalAuthValidation();
        await this.GetTenantConfigurationForForgetPassword();
      }
    }
  }

  async loginwithSSO(e): Promise<void> {
    sessionStorage.setItem('showSignInOptions', false.toString());
    if (!this.showLoginloader) {
      window.onbeforeunload = null;
      this.commonLocalize.setLocalCookie('appRetailCustID', this.loginForms.get('customerId').value);
      if (e) {
        this.enableLoginloader(true, false, true);
        e.preventDefault();
        this.loginForms.markAsUntouched();
      }
      if (this.showCustomerID) {
        localStorage.setItem('TenantId', this.loginForms.get('customerId').value);
        let tenantId = localStorage.getItem('TenantId');
        await this.configureAuth(tenantId);
        localStorage.setItem('ADB2CAuthenticationEnabled', this.ADB2CAuthenticationEnabled.toString());
        this.loginForms.get('customerId').markAsTouched();
        //Get Config for disable forget password
        await this.GetTenantConfigurationForForgetPassword();
        this.removeVal();
        if (this.ADB2CAuthenticationEnabled) {
          this.removeGeneralLoginVal();
          await this.adb2cAuthValidation();
        }
        else {
          this.enableLoginloader(false, false, true);
          this.showCustomerID = false;
          this.ssoNotConfigured = true;
          //this.utils.showAlert(this.captions.lbl_ssoAlert, AlertType.Info);
        }
      }
    }
  }

  async adb2cAuthValidation() {
    if (this.loginForms.valid) {
      if (!this.loginSuccess) {//  && !this.enableLocation
        localStorage.setItem('TenantId', this.loginForms.get('customerId').value);
        this.adb2cLogin();
      }
      else {
        let claims = this.adb2cClaims;
        const credentials = {
          Property: this.loginForms.get('location').value,
          ProductId: Product.RETAIL
        };
        this.setpropertyvalues(credentials.Property);
        const usersessionId = await this.sessionService.createSession();
        sessionStorage.setItem(USER_SESSION, String(usersessionId));
        await this.setEatecConfig();

        const selectedProperty = this.propertyValues.find(
        item => item.propertyCode === credentials.Property.id
        );
        this.SetPropertyInfo(selectedProperty);

        this.setAutoLogOff();
        await this.SetUserSessionConfiguration(this.userInfo.userId);
        this.setMachineDetails();
        // Set ProcessInvoice type based on fiscal legal entity sync type
        await this._fiscalProcessingService.setProcessInvoiceType();
        this.router.navigate(['/home']);
        await this.retailFunc.getRetailFunctionality();
      }
    }
  }

  generalAuthValidation() {
    if (this.loginForms.valid) {
      this.muname = '';
      this.tenantCode = '';
      const id: any = (this.loginForms.controls.customerId.value !== '' && this.loginForms.controls.customerId.value !== undefined) ?
        this.loginForms.controls.customerId.value : this.custId;
      this.userName = this.loginForms.value.userId;

      if (this.userName.includes('@')) {
        this.muname = this.userName.substring(0, this.userName.indexOf('@'));
        this.tenantCode = this.userName.substring(this.userName.indexOf('@') + 1);
      } else {
        this.muname = this.userName;
      }
      this.tenantId = Number(id);
      this.validateCredentials({
        UserName: this.muname,
        Password: this.loginForms.controls.password.value,
        TenantId: this.tenantId != null ? this.tenantId : 0,
        Property: this.loginForms.controls.location.value, ProductId: Product.RETAIL, TenantCode: this.tenantCode
      });
    } else {
      this.loginForms.controls.userId.markAsTouched();
      this.loginForms.controls.password.markAsTouched();
      this.loginForms.controls['machineName'].markAsTouched();
      if (this.showCustomerID) {
        this.loginForms.get('customerId').markAsTouched();
      }
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

  setGeneralLoginVal() {
    const userIdCtrl = this.loginForms.get('userId');
    userIdCtrl.setValidators([Validators.required]);
    userIdCtrl.updateValueAndValidity();
    userIdCtrl.markAsDirty();

    const passwordCtrl = this.loginForms.get('password');
    passwordCtrl.setValidators([Validators.required]);
    passwordCtrl.updateValueAndValidity();
    passwordCtrl.markAsDirty();
  }

  removeGeneralLoginVal() {
    const userIdCtrl = this.loginForms.get('userId');
    userIdCtrl.clearValidators();
    userIdCtrl.updateValueAndValidity();
    userIdCtrl.markAsDirty();

    const passwordCtrl = this.loginForms.get('password');
    passwordCtrl.clearValidators();
    passwordCtrl.updateValueAndValidity();
    passwordCtrl.markAsDirty();
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
        tenantId: arg.tenantId,
        passwordSetting: arg.passwordSetting,
        uTempData: { uTempPri: this.uTempDataPrimary, uTempSec: this.uTempDataSecondary }
      }
    }).afterClosed().subscribe(res => {
      this.enableLoginloader(false);
    });
    this.loginForms.get('password').setValue('');
    this.errResponse = '';
  }

  private async setupUserSecurityQuestions(): Promise<void> {
    let existingQuestionAvailableForUser = await this._userSecurityQuestionsService.isUserSecurityQuestionsAvailable(this.userInfo.userId);
    if (existingQuestionAvailableForUser) {
      return; // Questions already exist, continue with login
    }

    return new Promise<void>((resolve) => {
      // Create custom button labels for this specific dialog
      const customMessage = this.commonCaptions.lbl_securityQuestionReminder;
      const customData = {
        type: CommonAlertType.Confirmation,
        message: customMessage,
        buttontype: ButtonType.ContinueCancel,
        customButtons: {
          continueText: this.commonCaptions.lbl_setUpNow,
          cancelText: this.commonCaptions.lbl_setUpLater
        }
      };

      const dialogRef = this.dialog.open(CommonAlertPopupComponent, {
        height: 'auto',
        width: '300px',
        data: customData,
        panelClass: 'small-popup',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe(res => {
        if (res === AlertAction.CONTINUE) {
          const securityDialogRef = this.dialog.open(UserSecurityQuestionComponent, {
            width: '55%',
            maxHeight: '90vh',
            disableClose: true,
            panelClass: 'custom-dialog-container'
          });

          securityDialogRef.afterClosed().subscribe(dialogResult => {
            // Dialog closed, now we can continue with login process
            resolve();
          });
        } else {
          // User clicked cancel, continue without setting up security questions
          resolve();
        }
      });
    });
  }

  private rememberUser() {
    this.rememberMe = this.loginForms.controls.rememberme.value;
    const user = this.loginForms.controls.userId.value;
    if (this.rememberMe) { this.sessionService.StoreUser(user); } else { this.sessionService.RemoveUser(user); }
  }

  private async initializeForm() {
    this.hideLoginForm = true;
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

    this.captions = this.localize.captions;

    this.compiler.clearCache();
    //this.enableLocation = false;
    let _token = sessionStorage.getItem(JWT_TOKEN);
    if (this.localize.validateString(_token)) {
      this.router.navigate(['/home']);
    }

    this.captionGenerator();
    this.formGenerator();
    this.errorGenerator();
    await this.getCustomerId();

    this.loginButton = {
      type: 'primary',
      label: this.captions.lbl_login,
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
    if (!this.ADB2CAuthenticationEnabled) {
      const getrememberresult = this.sessionService.GetRememberedUsers();
      const rememberedUser = (getrememberresult.length > 0) ? getrememberresult[0].name : '';
      this.loginForms.controls['userId'].setValue(rememberedUser ? rememberedUser : '');
      this.loginForms.controls['rememberme'].setValue(rememberedUser ? true : false);
      this.loginForms.controls['password'].setValue('');
    }
  }

  // async isFeatureFlagEnabled(featureName:string) : Promise<boolean>
  // {
  //   const isEnabled = await this.PropertySettingService.IsFeatureEnabled(featureName);
  //   return isEnabled;
  // }

  private async configureAuth(tenantId: string, eventKey?: string) {
    await this.GetADB2CAuthConfig(tenantId);
    this.ADB2CAuthenticationEnabled = this.adb2cAuthConfiguration.ADB2CAuthFeatureEnabled;
    if(sessionStorage.getItem('showSignInOptions').toLowerCase() == 'true'){
      this.showSignInOptions = true;
    }
    else{
      this.showSignInOptions = false;
    }

    if(sessionStorage.getItem('logineventKey') == 'Enter'){
      eventKey = 'Enter';
    }

    if (this.ADB2CAuthenticationEnabled && ((!this.showSignInOptions || eventKey === 'Enter') || !this.adb2cAuthConfiguration.enableFormsAuthentication)) {
      this.hideLoginForm = true;
      this.oauthService.configure(this.adb2cAuthConfiguration.authConfig);
      this.oauthService.customQueryParams = {
        'customerId': tenantId,
        'productId': Product.RETAIL
      };
      this.oauthService.tokenValidationHandler = new NullValidationHandler();
      this.oauthService.setStorage(localStorage);
      //Event Subscription
      this.oauthService.events.subscribe(({ type }: OAuthEvent) => {
        switch (type) {
          case 'token_received':
            console.log([this.oauthService.state]);
            break;
          default:
            console.log([this.oauthService.state]);
            break;
        }
      });

      this.oauthService.loadDiscoveryDocument(this.adb2cAuthConfiguration.DiscoveryDocumentConfigUrl)
        .then(async doc => {
          console.log(doc);
          this.oauthService.tryLogin().then(async res => {
            if (this.oauthService.hasValidIdToken()) {
              this.hideLoginForm = true;
              await this.adb2cAuthLogin();
              //this.setUserSessionInfo(this.claims,this.oauthService.getIdToken());
            }
            else {
              this.hideLoginForm = false;
            }
            let _token = this.oauthService.getIdToken()
            //let _token = sessionStorage.getItem(JWT_TOKEN);
            console.log(_token);
          });
        });
    }
    else {
      this.hideLoginForm = false;
    }
  }

  private async GetTenantConfigurationForForgetPassword() {
    let tenantId = this.loginForms.controls['customerId']?.value ? this.loginForms.controls['customerId']?.value : this.custId;
    const serviceParams = {
      route: CommonControllersRoutes.GetConfigurationsByNameAndConfigValue,
      uriParams: { "configurationName": TenantConfigurations.TenantSetupConfiguration, "configKeyName": "DisableForgetPassword", "tenantId": tenantId },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    let result: any = {};
    result = await this.loginService.makeGetCall(serviceParams);
    sessionStorage.setItem('DisableForgetPassword', result.result ? result.result.toLowerCase() : 'false');
    this.disableForgetPassword = result.result ? result.result.toLowerCase() == 'true' ? true : false : false;
  }

  public adb2cLogin() {
    this.oauthService.initCodeFlow();
  }

  public adb2cLogout() {
    this.sessionService.stopClientStopwatch(); // Stop the stopwatch on logout
    this.oauthService.logOut();
  }

  public get adb2cClaims() {
    let claims = this.oauthService.getIdentityClaims();
    return claims;
  }

  async validateAdb2cCredentials(credentials, claims: any, strTenantId: string) {
    const serviceParams = {
      route: LoginRoutes.ADB2CLogin,
      uriParams: '',
      header: '',
      body: credentials,
      showError: true,
      baseResponse: true
    };
    if (!this.loginSuccess) {//  && !this.enableLocation
      // Validate credentials
      let token = this.oauthService.getIdToken();
      const tenantId = Number(strTenantId);
      const loginDetails = await this.loginService.makePostCall(serviceParams);
      if (loginDetails.successStatus) {
        loginDetails.result.token = token;
        const jwtToken = JSON.parse(atob(token.split('.')[1]));
        const jwtExpiryTime = new Date(jwtToken.exp * 1000);
        const timeout = jwtExpiryTime.getTime() - Date.now();
        const loginDuration = Math.round(timeout / 1000);
        this.userName = credentials.UserName;
        const loginResponse: any = loginDetails;
        if (loginResponse.result.loginDuration) {
          loginResponse.result.loginDuration = loginDuration;
          sessionStorage.setItem('loginDuration', loginResponse.result.loginDuration);
          localStorage.setItem('loginDuration', loginResponse.result.loginDuration);
          const tokenDuration = parseInt(sessionStorage.getItem('loginDuration'));
          this.sessionService.startTimer(0, tokenDuration);
          sessionStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());
          localStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());
        }
        await this.successCallBack(loginDetails);

      } else {
        if (loginDetails.errorCode == 5001) {
          this.enableLoginloader(false);
          this.loginError = true;
          this.loginButton.disabledproperty = false;
          this.errResponse = loginDetails.errorDescription;
          this.hideLoginForm = false;
        }
        this.utils.showAlert(loginDetails.errorDescription, AlertType.Error, null, async (res) => {
          this.adb2cLogout();
        });
      }
    }
  }

  private async setMachineInfo(propertyId: number) {
    this.resetMachineNameInfo();
    const userMachinePropertyInfo = this.userMachineInfo.userPropertiesMachineInfo.find(x => x.propertyId == propertyId);
    const miscConfiguration = userMachinePropertyInfo.miscConfiguration;
    // TRANSACTION_BY_MACHINENAME
    this.isMachineNameEnabled = miscConfiguration.enableTransactionByMachineName;
    // SELECTION_ON_LOGIN
    this.isPromptOnLoginEnabled = miscConfiguration.promptOnLogin;
    if (miscConfiguration.printerManagerURI) {
      this.localize.SetPrinterManagerURI(miscConfiguration.printerManagerURI);
    }
    if (this.isMachineNameEnabled) {
      this.defaultMachineId = userMachinePropertyInfo.userDefault.defaultMachineId;
      this.machineNames = userMachinePropertyInfo.machineNames.map(x => {
        return {
          id: x.id,
          name: x.name,
          min:x.min,
          serial:x.serial
        }
      });
      if (this.isPromptOnLoginEnabled && this.machineNames.length > 0) {
        this.loginForms.controls['machineName'].setValue('');
      }
    }
    const machineName = this.machineNames.find(x => x.id == this.defaultMachineId);
    this.defaultMachineId = machineName ? machineName.id : 0;
    if (this.defaultMachineId) {
      this.loginForms.controls['machineName'].setValue(machineName);
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
    if (typeof (userMachine) == 'object') {
      this.localize.SetMachineId(userMachine.id);
      this.localize.SetMachineName(userMachine.name);
      this.propertyServices.SetMachinePrinterConfigForMachine(userMachine.id);
      this.localize.SetMachineMin(userMachine?.min);
      this.localize.SetMachineSerial(userMachine?.serial);
    } else {
      this.localize.SetMachineId(0);
      this.localize.SetMachineName('');
    }
  }
  setValues() {
    this.uTempDataPrimary = this.utempdatautils.GetUTempData(3);
    this.uTempDataSecondary = this.utempdatautils.GetUTempData(1);
  }

  clearLclCookie(idname) {
    this.commonLocalize.clearLocalCookie(idname);
    this.loginForms.controls['customerId'].setValue('');
    this.loginForms?.controls["customerId"].enable();
    this.loginForms.markAsUntouched();
    this.showCustomerID = true;
    this.ssoNotConfigured = false;
    this.loginError = false;
    setTimeout(() => {
      this.fcs_custID.nativeElement.focus();
    }, 0);
    this.setVal();
  }

  SetNoOfDecimalDigits(propertyConfig: any) {
    var noOfDecimalDigits: string = '2';
    if (propertyConfig != null && propertyConfig.configValue != undefined && propertyConfig.configValue[NO_OF_DECIMAL_DIGITS] != undefined) {
      noOfDecimalDigits = propertyConfig.configValue[NO_OF_DECIMAL_DIGITS];
    }
    sessionStorage.setItem('noOfDecimalDigits', noOfDecimalDigits);
  }


  async validateAdb2cCredentialsForSupportUser() {
    var credentials = {
      productId: RETAIL_PRODUCT_ID,
      tenantId: this.loginForms.controls['tenantId'].value,
      supportTenantId: SUPPORT_TENANT
    };

    const serviceParams = {
      route: LoginRoutes.SupportUserLogin,
      uriParams: '',
      header: '',
      body: credentials,
      showError: true,
      baseResponse: true

    };
    const loginDetails = await this.loginService.makePutCall(serviceParams, false);
    if (loginDetails.successStatus) {
      let token = this.oauthService.getIdToken();
      loginDetails.result.token = token;
      const loginResponse: any = loginDetails;
      const jwtToken = JSON.parse(atob(token.split('.')[1]));
      const jwtExpiryTime = new Date(jwtToken.exp * 1000);
      const timeout = jwtExpiryTime.getTime() - Date.now();
      const loginDuration = Math.round(timeout / 1000);
      if (loginResponse.result.loginDuration) {
        loginResponse.result.loginDuration = loginDuration;
        sessionStorage.setItem('loginDuration', loginResponse.result.loginDuration);
        localStorage.setItem('loginDuration', loginResponse.result.loginDuration);
        const tokenDuration = parseInt(sessionStorage.getItem('loginDuration'));
        this.sessionService.startTimer(0, tokenDuration);
        sessionStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());
        localStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());

      }
      await this.setPropertyForSupportUser(loginDetails);
    } else {
      if (loginDetails.errorCode == 5001) {
        this.loginError = true;
        this.enableLoginloader(false);
        this.loginButton.disabledproperty = false;
        this.errResponse = loginDetails.errorDescription;
        this.hideLoginForm = false;
      }
      this.utils.showAlert(loginDetails.errorDescription, AlertType.Error, ButtonType.Ok);
    }
  }


  async setPropertyForSupportUser(loginDetails) {
    // Need to remove this hardcoded value
    loginDetails.result.userLoginInfo.isPropertyChangeAllow = true;
    this.userName = loginDetails.result.userLoginInfo.userName;
    this.userInfo = loginDetails.result.userLoginInfo;
    this.setUserInfo(loginDetails);
    // this.userDetail = loginDetails;
    let selectedProperty = this.allPropertyDetails.filter(x => x.id == this.loginForms.controls['propertyId'].value);
    if (!selectedProperty || !selectedProperty[0]) {
      console.log('Error in property selected data');
      return;
    }
    this.sessionService.UpdateUserSessionsInfo(loginDetails.result);
    let locationData = {
      id: selectedProperty[0].propertyCode,
      name: selectedProperty[0].propertyName
    };
    this.captionGenerator();
    this.loginForms.controls.location.setValue(locationData);
    // this.enableLocation = true;
    const credentials = {
      Property: this.loginForms.get('location').value,
      ProductId: RETAIL_PRODUCT_ID
    };

    this.setpropertyvalues(credentials.Property, loginDetails.result.userProperties);
    const usersessionId = await this.sessionService.createSession();
    sessionStorage.setItem(USER_SESSION, String(usersessionId));
    await this.setEatecConfig();
    this.SetPropertyInfo(selectedProperty);

    this.setAutoLogOff();
    await this.SetUserSessionConfiguration(this.userInfo.userId);
    this.setMachineDetails();
    // Set ProcessInvoice type based on fiscal legal entity sync type
    await this._fiscalProcessingService.setProcessInvoiceType();
    this.router.navigate(['/home']);
    await this.retailFunc.getRetailFunctionality();
    try {
      if (this.localize.GetSupportUserMailId()) {
        let data = {
          userEmail: this.localize.GetSupportUserMailId(),
          sessionId: String(usersessionId)
        };
        const auditParams = {
          route: LoginRoutes.AuditSupportUser,
          uriParams: '',
          header: '',
          body: data,
          showError: true,
          baseResponse: true
        };

        this.loginService.makePutCall(auditParams, false);
      }
    } catch (error) {
      console.log("Error in auditing support user")
    }
  }


  async onTenantIdChange(eve) {
    this.propertyIdListForATenant = this.filterPropertyByTenant(this.allPropertyDetails, eve.value);
    await this.updateSupportUserInfoOnTenantSelection(eve.value);
    if (!this.propertyIdListForATenant || this.propertyIdListForATenant.length <= 0) {
      return;
    }
    this.loginForms.controls['propertyId'].setValue(this.propertyIdListForATenant[0].id);
    this.onPropertyIdChange({ value: this.propertyIdListForATenant[0].id });
  }

  async onPropertyIdChange(eve) {
    if (!this.userInfo || !eve) {
      return;
    }
    this.userMachineInfo = await this.retailPropertySettingDataService.GetMachineNamesAndConfigurationSetting(this.userInfo.userId, RETAIL_PRODUCT_ID, [eve.value]);
    this.setMachineInfo(eve.value);
  }

  filterPropertyByTenant(data: any[], tenantId: number) {
    var tenantProperities = cloneDeep(data.filter(x => x.tenantId == tenantId));


    return tenantProperities.map(x => {
      return {
        id: x.id,
        value: x.id,
        viewValue: x.propertyName
      };
    });
  }

  getTenantIdList(data: any[]) {
    return data.map(x => {
      return {
        id: x.tenantId,
        value: x.tenantId,
        viewValue: x.contextName
      };
    });
  }

  async updateSupportUserInfoOnTenantSelection(tenantId: number) {
    const userParams = {
      route: RetailRoutes.GetUserByTenantId,
      uriParams: { UserName: SUPPORT_USERNAME, tenantId: tenantId },
      header: '',
      showError: true,
      baseResponse: true
    };
    let userData: any = await this.loginService.makeGetCall(userParams, false);
    this.userInfo = userData.result;
  }


  async ProcessSupportUserLogin(email: string) {
    let token = this.oauthService.getIdToken();
    sessionStorage.setItem(JWT_TOKEN, token);
    localStorage.setItem(JWT_TOKEN, token);
    this.localize.SetSupportUserMailId(email);
    this.commonLocalize.setLocalCookie('supportUserMailId', email);
    const mailValidationParams = {
      route: RetailRoutes.ValidateUserByProductTenantAndEmail,
      uriParams: { productId: Product.RETAIL, tenantId: SUPPORT_TENANT, emailId: email },
      header: '',
      showError: true,
      baseResponse: true
    };

    let isUserExistsInSupportTenant: any = await this.loginService.makePutCall(mailValidationParams, false);

    if (!isUserExistsInSupportTenant?.result) {
      await this.utils.showAlert(this.captions.err_userAccess_Denied_message, AlertType.Error, ButtonType.Ok).afterClosed().toPromise();
      this.sessionService.logout();
      return;
    }
    this.enableSupportUserInputElementsRequiredField(true);
    this.captionGenerator();
    // this.loginSuccessCaption = this.captions.SelectYourLoginDetails;

    const tenantParams = {
      route: RetailRoutes.GetTenantGroupDetailByProductId,
      uriParams: { productId: RETAIL_PRODUCT_ID },
      header: '',
      showError: true,
      baseResponse: true
    };

    const propertyParams = {
      route: RetailRoutes.GetPropertyDetailsByProductId,
      uriParams: { productId: RETAIL_PRODUCT_ID },
      header: '',
      showError: true,
      baseResponse: true
    };
    let tenantData: any = this.loginService.makeGetCall(tenantParams, false);
    let propertyData: any = this.loginService.makeGetCall(propertyParams, false);
    let responses = await Promise.all([tenantData, propertyData]);
    this.allTenantDetails = responses[0].result;
    this.allPropertyDetails = responses[1].result;
    this.tenantIdList = this.getTenantIdList(this.allTenantDetails);
    this.tenantIdList.sort((a, b) => a.viewValue.localeCompare(b.viewValue))
    this.initialTenantIdList = [...this.tenantIdList]
    if (!this.tenantIdList || this.tenantIdList.length <= 0) {
      console.log('Empty tenant List to display');
      return;
    }
    this.propertyIdListForATenant = this.filterPropertyByTenant(this.allPropertyDetails, this.tenantIdList[0].id);
    if (!this.propertyIdListForATenant || this.propertyIdListForATenant.length <= 0) {
      console.log('Empty property List to display');
      return;
    }
    this.loginForms?.controls['tenantId']?.setValue(this.tenantIdList[0].id);
    this.loginForms?.controls['propertyId']?.setValue(this.propertyIdListForATenant[0].id);
    this.enableLoginloader(false);
    this.showCustomerID = false;
    this.hideLoginForm = false;
    this.loginSuccess = true;
    this.isSupportUser = true;
    await this.updateSupportUserInfoOnTenantSelection(this.tenantIdList[0].id);
    this.userMachineInfo = await this.retailPropertySettingDataService.GetMachineNamesAndConfigurationSetting(this.userInfo.userId, RETAIL_PRODUCT_ID, [this.propertyIdListForATenant[0].id]);
    this.setMachineInfo(this.propertyIdListForATenant[0].id);

  }

  enableSupportUserInputElementsRequiredField(isEnableRequiredField: boolean) {
    if (!this.loginForms || !this.loginForms.controls['tenantId'] || !this.loginForms.controls['propertyId'] || !this.loginForms.controls['roleId']) {
      return;
    }
    if (isEnableRequiredField) {
      this.loginForms.controls['tenantId'].addValidators(Validators.required);
      this.loginForms.controls['propertyId'].addValidators(Validators.required);
    } else {
      this.loginForms.controls['tenantId'].removeValidators(Validators.required);
      this.loginForms.controls['propertyId'].removeValidators(Validators.required);
    }

  }

  private _filter(value: string) {
    if (value) {
      const filterValue = value.toLowerCase();
      return this.tenantIdList = this.initialTenantIdList.filter(x => (x.viewValue.toLowerCase().includes(filterValue)) || (x.id.toString().toLowerCase().includes(filterValue)))
    } else {
      return this.tenantIdList = this.initialTenantIdList;
    }

  }

  filterOptions(event) {
    this._filter(event.target.value);
  }

  openedChange(opened: boolean) {
    this.myInput.nativeElement.focus()
    if (!opened) {
      this.inputSearch = ''
      this._filter("");

    }
  }

  enableLoginloader(val: boolean, forceEnable: boolean = false, ssoLogin:boolean=false) {
    if ((this.loginForms?.valid && val) || (forceEnable && val)) {
      if(ssoLogin){
        this.showSSOLoginloader = val ? val : false;
      }
      else{
        this.showLoginloader = val ? val : false;
      }
      
      this.startInterval(ssoLogin);
    } else if(ssoLogin){
      this.showSSOLoginloader = false;
    }
    else{
      this.showLoginloader = false;
    }
  }
  startInterval(ssoLogin:boolean=false) {
    // Set up the interval to execute a function every 1000 milliseconds (1 second)
    this.elapsedTime = 0;
    this.intervalId = setInterval(() => {
      this.elapsedTime += 1000; // Increment elapsed time by 1 second
      // Check if 30 seconds have passed
      if ((document.getElementById("bodyId")?.getElementsByClassName("Errorpop-container-Golf").length > 0) ||
        (document.getElementById("bodyId")?.getElementsByClassName("errorpop-container").length > 0) || (document.getElementById("bodyId")?.getElementsByClassName("Errorpop-container").length > 0)) {
        this.stopInterval(ssoLogin); // Clear the interval if the condition is met
      }
      if (this.elapsedTime >= 50000) {
        this.stopInterval(ssoLogin); // Clear the interval if 50 seconds have passed
      }
    }, 1000);
  }
  stopInterval(ssoLogin:boolean=false) {
    // Clear the interval when called
    this.enableLoginloader(false,false,ssoLogin);
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async openForgetPasswordDialog(): Promise<void> {
    const userId = this.loginForms.get('userId')?.value;
    const customerId = this.loginForms.get('customerId')?.value || this.custId;
    const tenantId = customerId ? parseInt(customerId) : this.tenantId;

    if (!userId || !tenantId) {
      this.utils.showAlert(this.commonCaptions.invaliduserIdLogin, AlertType.Error);
      return;
    }

    try {
      // Show loading indicator (force enable even if form is not fully valid)



      // Verify if user exists for the given tenant
      this.isUserValid = await this.verifyUserExists(userId, tenantId);

      if (this.isUserValid?.result?.tenantSecurityQuestions == undefined
        || this.isUserValid?.result?.tenantSecurityQuestions == null) {
        this.enableLoginloader(false);
        this.utils.showAlert(this.commonCaptions.lbl_PasswordReset, AlertType.Error);
        return;
      }

      this.passwordSetting = this.isUserValid?.result?.passwordSetting;

      this.securityUserId = this.isUserValid?.result.userId;

      const dialogRef = this.dialog.open(ForgetPasswordComponent, {
        width: '500px',
        maxWidth: '90vw',
        disableClose: true,
        data: {
          userName: userId,
          tenantId: tenantId,
          propertyId: this.propertyInfo.PropertyId,
          userId: this.securityUserId,
          userinfo: this.isUserValid,
          uTempData: {
            uTempPri: this.uTempDataPrimary,
            uTempSec: this.uTempDataSecondary
          },
          tenantSecurityQuestions: this.isUserValid?.result?.tenantSecurityQuestions
        }
      });

      // Keep loading active until dialog is fully opened and ready
      dialogRef.afterOpened().subscribe(() => {
        // Disable loading once dialog is fully opened and rendered
        setTimeout(() => {
          this.enableLoginloader(false);
        }, 300);
      });

      dialogRef.afterClosed().subscribe(result => {
        // Ensure loader is disabled when dialog closes
        this.enableLoginloader(false);

        console.log('ForgetPasswordComponent result:', result); // Debug log

        if (result && result.success) {
          if (result.action === 'openSetPassword') {
            this.openSetPasswordDialog(result);
          }
        } else if (result && result.action === 'returnToLogin' && !result.message.includes('cancel')) {
          this.utils.showAlert(this.commonCaptions.common.lbl_invalidsecurityAnswer, AlertType.Error);
        }
        else if (result && result.action === 'userLocked') {
          this.utils.showAlert(result.message, AlertType.Error);
        }
        else {
          console.log('ForgetPasswordComponent returned unexpected result:', result);
        }
      });
    } catch (error) {
      this.enableLoginloader(false);
      this.utils.showAlert(this.commonCaptions.lbl_noDataFound, AlertType.Error);
    }
  }

  private async verifyUserExists(userId: string, tenantId: number): Promise<any> {
    try {
      const serviceParams = {
        route: CommonControllersRoutes.FetchUserSecurityQuestionsForPasswordReset,
        uriParams: '',
        header: '',
        body: { "UserName": userId, "tenantId": tenantId, Property: this.loginForms.controls["location"].value, ProductId: Product.RETAIL, TenantCode: this.tenantCode },
        showError: false,
        baseResponse: true
      };

      const response: any = await this.loginService.makePostCall(serviceParams, false);

      // If we get a successful response, the user exists
      if (response && response?.successStatus && response?.result) {
        return response;
      }
      return false; // User doesn't exist
    } catch (error) {
      console.error(this.commonCaptions.lbl_noDataFound, error);
      return false;
    }
  }

  private openSetPasswordDialog(userData: any): void {
    const userName = this.loginForms.get('userId')?.value;
    const customerId = this.loginForms.get('customerId')?.value || this.custId;
    const tenantId = customerId ? parseInt(customerId) : this.tenantId;
    const dialogRef = this.dialog.open(SetPasswordComponent, {
      width: '50%',
      maxWidth: 'Auto',
      disableClose: true,
      data: {
        userName: userName,
        tenantId: customerId,
        setPassword: true, // This will hide the old password field
        userInfo: this.isUserValid,
        passwordSetting: this.passwordSetting,
        uTempData: {
          uTempPri: this.uTempDataPrimary,
          uTempSec: this.uTempDataSecondary
        },
        isForgetPassword: true,
        userSecurityQnAModel: userData?.userSecurityQnAModel || [],
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success === true) {
        this.utils.showAlert(this.commonCaptions.lbl_passwordResetSuccess, AlertType.Success);
      } else {
        this.utils.showAlert(this.commonCaptions.lbl_passwordResetCancelled, AlertType.Info);
      }
    });
  }
}
