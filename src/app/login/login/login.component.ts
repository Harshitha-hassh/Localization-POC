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
import {
  JWT_TOKEN, USER_INFO,
  USER_SESSION, PROPERTY_INFO, PROPERTY_DATE, PROPERTY_CONFIGURATION_SETTINGS,
  FULL_STORY_ORG_ID,
  NO_OF_DECIMAL_DIGITS
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
import { PayAgentService } from 'src/app/retail/shared/service/payagent.service';
import { ConfigKeys } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { PropertyFeaturesConfigurationService } from 'src/app/retail/sytem-config/payment-features-config/property-feature-config.service';
import { FeatureName, RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { PropertyService } from 'src/app/common/services/property.service';
import * as FullStory from '@fullstory/browser';
import { CryptoUtility } from 'src/app/core/utilities/crypto.utility';
import { OAuthService, NullValidationHandler, OAuthEvent } from 'angular-oauth2-oidc';
import { AlertType, ButtonType } from 'src/app/shared/shared-models';
import { ADB2CAuthConfiguration } from 'src/app/common/shared/auth.config';
import { LoginRoutes } from '../login.routes';
import * as CONSTANTS from 'src/app/common/constants';

@Component({
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
  currYear = '2023';
  prevYear = '2020'
  passwordSetting: any;
  //Machine Name
  isMachineNameEnabled: boolean;
  isPromptOnLoginEnabled: boolean;
  defaultMachineId: number = 0;
  machineNames = [];
  userMachineInfo: UserMachineInfo;
  key: string;
  iv: string;
  ADB2CAuthenticationEnabled: boolean = false;
  errorvalue : string;
  errordescription : string;

  @ViewChild('fcs_userID') fcs_userID: ElementRef;
  @ViewChild('fcs_pwd') fcs_pwd: ElementRef;
  @ViewChild('fcs_custID') fcs_custID: ElementRef;

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
    private adb2cAuthConfiguration: ADB2CAuthConfiguration
  ) {
    // this.initializeForm();
    // this.captions = this.localize.captions;
  }

  async ngOnInit() {
    await this.initializeForm();
    let custId = this.commonLocalize.getLocalCookie('appRetailCustID');
    if (custId != '') {
      this.loginForms.controls['customerId'].setValue(custId);
      if (!this.ADB2CAuthenticationEnabled) {
        this.loginForms?.controls["customerId"].disable();
        this.getbuttonEmitvalue('');
      }
    }

    this.route.queryParams.subscribe(params => {    
      this.errorvalue = params.error;    
      this.errordescription = params.error_description;
      if(this.errorvalue != undefined && this.errordescription != undefined && this.errorvalue != '' && this.errordescription != '' )
      {
        this.utils.showAlert(this.errorvalue +"<br>"+ this.errordescription, AlertType.Info, ButtonType.Ok,(res=>{
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
        this.userIdDir = 'capitalise,notallowspace,nospecailchar';
        this.showCustomerID = false;
        this.loginForms?.controls["customerId"].disable();
        this.removeVal();
      }
    });
    this.setEncryptKey();
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
      machineName: ['0', Validators.required]
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

  getADB2CEmailClaim(claims) {
    let email = "";
    if (claims != null && claims != undefined && claims['emails'] != null && claims['emails'].length > 0)
      email = claims['emails'][0];
    return email;
  }

  async adb2cAuthLogin() {
    let tenantId = localStorage.getItem('TenantId');
    this.loginForms.controls.customerId.setValue(tenantId);
    let claims = this.adb2cClaims;
    const credentials = {
      email: this.getADB2CEmailClaim(claims),
      tenantId: tenantId,
      ProductId: Product.RETAIL
    };
    await this.validateAdb2cCredentials(credentials, claims, tenantId);
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
    } else if (!this.ADB2CAuthenticationEnabled && loginDetails.result.userLoginInfo.isPasswordExpired === true) {
      this.passwordSetting = loginDetails.result.passwordSetting;
      const content = { title: 'CHANGE PASSWORD', userName: this.userName, tenantId: this.tenantId, passwordSetting: this.passwordSetting };
      this.setUpPassword(content, false);
    } else {
      this.sessionService.UpdateUserSessionsInfo(loginDetails.result);
      this.propertyValues = loginDetails.result.userProperties;
      this.captionGenerator();
      this.loginSuccess = !this.loginSuccess;
      this.multipleProperties = this.propertyValues.map(x => ({
        id: x.propertyCode,
        name: x.propertyName
      }));
      this.userMachineInfo = await this.retailPropertySettingDataService.GetMachineNamesAndConfigurationSetting(this.userInfo.userId, Product.RETAIL,
        this.propertyValues.map(x => x.propertyId));
      // Selecting property by default when there is only one property configured for tenant
      if (this.multipleProperties.length == 1) {
        this.loginForms.controls.location.setValue(this.multipleProperties[0]);
        this.setMachineInfo(this.propertyValues[0].propertyId);
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
    this.adb2cAuthConfiguration.authConfig = {
      redirectUri: window.location.origin + '/Retail/login',
      postLogoutRedirectUri: window.location.origin + '/Retail/login',
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

    if (!this.loginSuccess) {
      // Validate credentials
      if (this.key && this.iv) {
        serviceParams.body.Password = this.crypto.EncryptString(credentials.Password, this.key, this.iv);
        serviceParams.route = RetailRoutes.LoginEncrypted;
      }
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
      const selectedProperty = this.propertyValues.find(
        item => item.propertyCode === credentials.Property.id
      );
      this.SetPropertyInfo(selectedProperty);
      this.userDefaultsService.syncDefaultValues(this.userInfo.userId);
      await this.setEatecConfig();
      this.setAutoLogOff();
      await this.SetUserSessionConfiguration(this.userInfo.userId);
      this.setMachineDetails();
      this.router.navigate(['/home']);
      await this.retailFunc.getRetailFunctionality();
      let userDetails = await this.sessionService.GetUserSessionsInfo();
      console.log(userDetails)
      const result = userDetails.userProperties.find(item => item.propertyId === selectedProperty.propertyId);
      await this.propertyServices.setJasperAttributes(result?.roleId);
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
    this.propertyInfo.SetPropertyDate(
      this.utils.getDate(result.propertyDate),
      false
    );
    this.localize.SetLocaleBasedProperties();
    this.commonLocalize.SetLocaleBasedProperties();
    this.UpdateUserRole(Selectedproperty.id);
  }

  async setEatecConfig() {
    this.propertyFeatureService.getPropertyFeatures().then(async (feature) => {
      const propIds = [];

      const eatecFeature = feature.find(x => x.featureName === FeatureName.EnhancedInventory);
      const pmsRevenuePosting = feature && feature.find(x => x.featureName === FeatureName.PMS_RevenuePosting && x.isActive);

      if (eatecFeature != null && eatecFeature.isActive) {
        sessionStorage.setItem('isEatecEnabled', 'true');
        propIds.push(eatecFeature.id);
        await this.setEatecToken();
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
    const supportedPmAgentVersion = await this.PropertySettingService.GetSupportedPMAgentVersionByPropertyID(propertyId);
    this.propertyInfo.SetSupportedPMAgentVersion(supportedPmAgentVersion);
    this.payAgentService.ValidatePayAgentVersion();
  }

  async GetWebCommunicationProxyVersion(){
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
    window.onbeforeunload = null;
    this.commonLocalize.setLocalCookie('appRetailCustID', this.loginForms.get('customerId').value);
    if (e) {
      e.preventDefault();
      this.loginForms.markAsUntouched();
    }
    if (this.showCustomerID) {
      localStorage.setItem('TenantId', this.loginForms.get('customerId').value);
      let tenantId = localStorage.getItem('TenantId');
      await this.configureAuth(tenantId);
      localStorage.setItem('ADB2CAuthenticationEnabled', this.ADB2CAuthenticationEnabled.toString());
      this.loginForms.get('customerId').markAsTouched();
      this.removeVal();
      if (this.ADB2CAuthenticationEnabled) {
        this.removeGeneralLoginVal();
        await this.adb2cAuthValidation();
      }
      else {
        this.showCustomerID = false;
        this.loginForms?.controls["customerId"].disable();
        setTimeout(() => {
          this.fcs_userID.nativeElement.focus();
        }, 0);
      }
    }
    else if (this.ADB2CAuthenticationEnabled) {
      this.removeGeneralLoginVal();
      await this.adb2cAuthValidation();
    }
    else {
      this.loginForms.controls['userId'].markAsTouched();
      this.loginForms.controls['password'].markAsTouched();
      this.setGeneralLoginVal();
      this.generalAuthValidation();
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
        this.setAutoLogOff();
        await this.SetUserSessionConfiguration(this.userInfo.userId);
        this.setMachineDetails();
        this.router.navigate(['/home']);
        await this.retailFunc.getRetailFunctionality();
      }
    }
  }

  generalAuthValidation() {
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
        encKeyIv: { key: this.key, iv: this.iv }
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

  private async configureAuth(tenantId: string) {
    await this.GetADB2CAuthConfig(tenantId);
    this.ADB2CAuthenticationEnabled = this.adb2cAuthConfiguration.ADB2CAuthFeatureEnabled;
    if (this.ADB2CAuthenticationEnabled) {
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

  public adb2cLogin() {
    this.oauthService.initCodeFlow();
  }

  public adb2cLogout() {
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
        this.userName = credentials.UserName;
        const loginResponse: any = loginDetails;
        if (loginResponse.result.loginDuration) {
          sessionStorage.setItem('loginDuration', loginResponse.result.loginDuration);
          localStorage.setItem('loginDuration', loginResponse.result.loginDuration);
          const tokenDuration = parseInt(sessionStorage.getItem('loginDuration'));
          this.sessionService.startTimer(0, tokenDuration);
          let currentDateTime = new Date();
          let jwtExpiryTime = new Date(currentDateTime.getTime() + tokenDuration * 1000);
          sessionStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());
          localStorage.setItem('jwtExpiryTime', jwtExpiryTime.toString());
        }
        await this.successCallBack(loginDetails);

      } else {
        if (loginDetails.errorCode == 5001) {
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
          name: x.name
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
    } else {
      this.localize.SetMachineId(0);
      this.localize.SetMachineName('');
    }
  }
  setEncryptKey() {
    let serviceParamsForKey = {
      route: RetailRoutes.GetEncryptKey,
      uriParams: '',
      header: '',
      body: '',
      showError: false,
      baseResponse: true
    };
    this.loginService.makeGetCall<any>(serviceParamsForKey, false).then(encryptKey => {
      if (encryptKey && encryptKey.result) {
        this.key = encryptKey.result.key;
        this.iv = encryptKey.result.iv;
      }
    })
  }

  clearLclCookie(idname) {
    this.commonLocalize.clearLocalCookie(idname);
    this.loginForms.controls['customerId'].setValue('');
    this.loginForms?.controls["customerId"].enable();
    this.loginForms.markAsUntouched();
    this.showCustomerID = true;
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

}
