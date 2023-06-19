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
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
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
    private snackBar: MatSnackBar) {
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
      this.propertyName = this.localization.GetPropertyInfo('PropertyName');
      let propConfig = JSON.parse(sessionStorage.getItem("propConfig")); 
      let enableSignalR = propConfig?.EnableSignalR;
      this.propertyService.changeTitle();
      this.loadGoogleMap();
      this.triggerNotification();
      this.time();
      this.toggleStyle();
      if(enableSignalR && enableSignalR.toLowerCase() == "true")
    {
      this.StartSignalrConnection();
    }
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

  async UpdatePropertyDateCache(message: SystemDateChangeMessage): Promise<void> {
    
    let newSystemDate = await this.GetPropertyDate();
    let localizedDate = this.localization.localizeDisplayDate(newSystemDate);
    let productId = Number(this.utils.GetPropertyInfo("ProductId"));
    let previousDate = moment(newSystemDate).subtract(1,"days");
      let localizedPreviousDate = this.localization.localizeDisplayDate(previousDate.toDate());
    if (newSystemDate != undefined && newSystemDate != null) {
      if(productId == Product.SPA || productId == Product.Golf || productId == Product.RETAIL )
      {
        this.utils.showToastMessage(this.localization.captions.NightAuditMessage+ ' for ' + localizedPreviousDate, SnackBarType.Success, 15000);
      }
      else{
        this.utils.showAlert(message.message + ' to ' + localizedDate, AlertType.Success, ButtonType.Ok, (res) => {
          if (res) {
            this.logoutHandler(true);
          }
        });
      }     
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
      this.propertyDateTime = this.localization.LocalizeDateTimeFormatSecondsDDMMMYYYYheader(this.propertyInfo.CurrentDate) ;
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

}
