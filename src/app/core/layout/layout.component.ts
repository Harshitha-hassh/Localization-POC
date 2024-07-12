import { OnDestroy } from '@angular/core';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PropertyService } from 'src/app/common/services/property.service';
import { ManageSessionService } from 'src/app/login/manage-session.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { PropertyInformation } from '../services/property-information.service';
import { RouteLoaderService } from '../services/route-loader.service';
import { Router } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CommonUtilities, Product, SignalRMessages } from 'src/app/common/shared/shared/utilities/common-utilities';
import { SignalrService } from 'src/app/common/communication/signalR/signalr.service';
import { NotificationModel, SignalRMessage, SignalRNotificationType, SystemDateChangeMessage } from 'src/app/common/communication/signalR/signalR.model';
import { AlertType, SnackBarType } from 'src/app/common/shared/shared/enums/enums';
import { PropertySettingDataService } from 'src/app/common/dataservices/authentication/propertysetting.data.service';
import { RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { MatSnackBar} from '@angular/material/snack-bar';
import { ButtonType } from 'src/app/retail/shared/globalsContant';
import moment, { Moment } from 'moment';
import { RetailUtilities } from 'src/app/retail/shared/utilities/retail-utilities';
import { HttpCacheService } from 'src/app/common/services/cache/http-cache.service';
import { Localization } from 'src/app/common/localization/localization';
import * as FullStory from '@fullstory/browser';
import { FULL_STORY_ORG_ID } from 'src/app/app-constants';
import { JasperServerCommonDataService } from 'src/app/common/dataservices/jasperServerCommon.data.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit, OnDestroy {
 
  menuList: any;
  propertyName: string;
  propertyDateTime: any;
  logOutClicked=false;
  entityName:string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  private autoLogOff: any = false;
  private logOffAfter: number = 1;
  getThemeColor: string = '';
  constructor(private routeDataService: RouteLoaderService,
    private sessionService: ManageSessionService,
    private localization: RetailLocalization,
    private propertyInfo: PropertyInformation,
    private propertyService: PropertyService,
    private router: Router,
    private signalR: SignalrService,
    private PropertySettingService: PropertySettingDataService,
    private retailFeatureInformationService: RetailFeatureFlagInformationService,
    public dialog: MatDialog,
    private utils: RetailUtilities,
    private snackBar: MatSnackBar,
    private httpCacheService: HttpCacheService,
    private commonLocalization : Localization,
    private jasperServerCommonDataService:JasperServerCommonDataService) {
    this.routeDataService.loadSettings().then(result => {
      if (result) {
        const value = this.routeDataService.GetChildMenu('/');
        this.menuList = {
          menuType: menuTypes.primary,
          menu: value
        };
      }
    });
   }

  ngOnInit() {
      this.applyTheme('blacktheme');
      this.jasperServerCommonDataService.setauthTokenProvider();
      this.addThemeColor();
      this.propertyName = this.localization.GetPropertyInfo('PropertyName');
      let propConfig = JSON.parse(sessionStorage.getItem("propConfig"));
      let enableSignalR = propConfig?.EnableSignalR;
      let enableUICache = propConfig?.UICacheEnabled;     
      this.propertyService.changeTitle();
      this.loadGoogleMap();
      this.triggerNotification();
      this.time();
      this.toggleStyle();
      this.setAutoLogoff();
      if(!FullStory){
        this.setFullStory();
      }
      if(enableSignalR && enableSignalR.toLowerCase() == "true")
    {
      this.StartSignalrConnection();
    }
    if (enableUICache && enableUICache.toLowerCase() == "true") {
      this.setUICache();
    }
  }
  addThemeColor(){
    const defaultsettings =JSON.parse(sessionStorage.getItem("defaultSettings"));
    const themeColorSetting = defaultsettings?.find( x=>x.switch == 'THEME_COLOR');
    this.getThemeColor = themeColorSetting ? themeColorSetting?.value: '';
  };

  async setUICache() {
    await this.propertyService.readUICacheJsonData().then((result) => {
      this.commonLocalization.uiCacheData = result;
    });
  }
  ngOnDestroy() {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
  }

  private StartSignalrConnection() {
    this.signalR.startConnection();
    this.signalR.startedConnection.then(res => {
      this.addPropertyListener();
      this.addCacheListener();
    });
  }

  private addPropertyListener() {
    this.signalR.addPropertyListener(this, this.signalRPropertyListener)
      .catch((err) => console.log('Failure error ' + err));

    this.signalR.hubConnection.onreconnected((reconnect)=>{
      const list=this.signalR.GetSignalREvents();
      list.forEach(e=>{this.signalR.subscribeToEvent(e);});
      });
  }

  private addCacheListener(){
    this.signalR.addCacheListener(this, this.signalRCacheListener)
    .catch((err) => console.log('Failure error ' + err));
 
  this.signalR.hubConnection.onreconnected((reconnect)=>{
    const list=this.signalR.GetSignalREvents();
    list.forEach(e=>{this.signalR.subscribeToEvent(e);});
    });
 
  }

  async signalRPropertyListener(message: SignalRMessage<NotificationModel>): Promise<void> {
    if(message && message.content && message.content.notificationType==SignalRNotificationType.ToasterNotification)
    {
      const content =JSON.parse(message.content.notificationObjectString);
      if (message.name == SignalRMessages.ChangeSystemDate) {
        await this.UpdatePropertyDateCache(content);
      }
      else
      {
        this.utils.showToastMessage(content.message, SnackBarType.Success);
      }
    }
  }

  async signalRCacheListener(message: SignalRMessage<NotificationModel>):Promise<void>{
    if (message.name == "Clear Cache") {
      if (message.content.notificationObjectString != null) {
        this.entityName = message.content.notificationObjectString;
          if (this.entityName != null) {
            this.httpCacheService.cacheDelete(this.entityName);
          }
        return null;
      }
    }
  }

  async UpdatePropertyDateCache(message: SystemDateChangeMessage): Promise<void> {

    let newSystemDate = await this.GetPropertyDate();
    let localizedDate = this.localization.localizeDisplayDate(newSystemDate);
    if (newSystemDate != undefined && newSystemDate != null) {    
        this.utils.showAlert(message.message + ' to ' + localizedDate, AlertType.Success, ButtonType.Ok, (res) => {
          if (res) {
            this.logoutHandler(true);
          }
        });
      }
    
}

async GetPropertyDate() {
  const propertityConfig = await this.PropertySettingService.getAllPropertySetting(Number(this.getPropertyId()));
  return this.localization.getDate(propertityConfig.propertyDate);
}
private getPropertyId() {
  return this.localization.GetsessionStorageValue('propertyInfo', 'PropertyId');
}

logoutHandler(arg) {
  this.logOutClicked = true;
  this.retailFeatureInformationService.reset();
  this.sessionService.logout();
  const bodyTag = document.getElementsByTagName('body')[0];
  bodyTag.removeAttribute("id");
}

  triggerNotification(){
    if (!this.propertyInfo.UseRetailInterface) {
      // TODO
      this.sessionService.startTimerForNotification(1);
    }
  }

  private loadGoogleMap(){
    let propertyConfig = this.propertyInfo.GetPropertyConfiguration()
    if (propertyConfig?.GoogleMapApiKey) {
      const language = this.localization.GetsessionStorageValue('_userInfo', 'language') || 'en-US';
      this.propertyService.generateGoogleMapApi(propertyConfig.GoogleMapApiKey, language);
  }
  }

  applyTheme(name) {
    sessionStorage.setItem('theme', name);
    setTimeout(() => {
      const theme = sessionStorage.getItem('theme');
      document.querySelectorAll('body')[0].setAttribute('class', theme);
      // if css need to change for popover, apply class to body
    }, 1);

  }

  time() {
    if (!this.logOutClicked) {
      if(this.sessionService.GetPropertyInfo('TimeZone')){
      this.propertyDateTime = this.localization.LocalizeDateTimeFormatSecondsDDMMMYYYYheader(this.propertyInfo.CurrentDate) ;
      }
    }
  }

  ngAfterViewInit() {
    if (!this.logOutClicked) {
      setInterval(() => this.time(), 500);
    }
  }


  toggleStyle() {
    this.localization.isNewStyle = true;
    this.setView();
  }


  setView() {
    const bodyTag = document.getElementsByTagName('body')[0];
    if (this.localization.isNewStyle) {
      bodyTag.setAttribute("id", "new-mat-view");
      this.localization.setFloatLabel = 'always';
      this.localization.setFloatLabelNever = 'never';
    } else {
      bodyTag.removeAttribute("id");
      this.localization.setFloatLabel = 'never';
    }
  }

  setFullStory(){
    let propertyConfig = JSON.parse(sessionStorage.getItem('propConfig'));
    let userInfo = JSON.parse(sessionStorage.getItem('userInformation'));
    if (propertyConfig.configValue != undefined && propertyConfig.configValue[FULL_STORY_ORG_ID] != undefined) {
      FullStory.init({ orgId: propertyConfig.configValue[FULL_STORY_ORG_ID] });
      FullStory.identify('RETAIL-' + userInfo.userName, {
        "displayName": 'RETAIL-' + userInfo.userName,
        "productId": Product.RETAIL.toString(),
        "productName": "RETAIL",
        "tenantId": userInfo.tenantId?.toString() ?? "",
        "tenantCode": userInfo.tenantCode?.toString() ?? "",
        "propertyId": propertyConfig.propertyId?.toString() ?? "",
        "propertyName": this.propertyInfo.GetPropertyInfoByKey('PropertyName')
      });
    }
  } 


  setAutoLogoff() {
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

}
