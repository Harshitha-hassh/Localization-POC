import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { ReplaySubject, Subscription } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { ManageSessionService } from 'src/app/login/manage-session.service';
// import { SortOrderPipe } from 'src/app/pipes/sort-order.pipe';
import { menuTypes } from '../../enums/menu.constant';
import { MatDialog } from '@angular/material/dialog';
import { AboutComponent } from '../about/about.component';
import { PropertyFeaturesConfigurationService } from 'src/app/retail/sytem-config/payment-features-config/property-feature-config.service';
import {  RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import {  RetailFeatureFlagInformationService } from 'src/app/retail/shared/service/retail.feature.flag.information.service';
import { RetailServiceRegistry } from 'src/app/retail/shared/service/base.service';
import { SPAConfig } from 'src/app/retail/common/config/SPA-config';
import { HttpServiceCall } from 'src/app/retail/shared/service/http-call.service';
import { QuickLoginUtilities } from 'src/app/common/shared/shared/utilities/quick-login-utilities';
import { AgMenuTypes, NotificationFailureType } from './menu.model';
import {TooltipPosition} from '@angular/material/tooltip';
import { UntypedFormControl } from '@angular/forms';
import { PropertyService } from 'src/app/common/services/property.service';
import { ChangePropertyComponent } from 'src/app/common/components/change-property/change-property.component';
import { ChangePropertySevice } from 'src/app/common/services/change-property.service';
import { UserdefaultsInformationService } from 'src/app/core/services/UserdefaultsInformationService';
import { UserMachineConfigurationService } from 'src/app/retail/common/services/user-machine-configuration.service';
import { AuthenticationService } from 'src/app/common/shared/services/authentication.service';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MenuComponent implements OnInit, AfterViewInit, OnDestroy {

  menuList: any;
  menuItems: any;
  isMenu: boolean;
  positionOptions: TooltipPosition[] = ['right', 'above', 'left', 'below']; 
  position = new UntypedFormControl(this.positionOptions[0]);
  moreTextName = 'More';
  moreListItem: any = [];
  isSubMenu = false;
  searchOpen = false;
  menusearchOpen = false;
  headerPopOver: any;
  logOutPopOver: any;
  lowerLevelSubMenu: any;
  verticalFlag = false;
  levelMenu: menuTypes | AgMenuTypes;
  menuType = menuTypes;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  agMenuTypes  = AgMenuTypes;

  @ViewChild('userPopOver') userPopUp: ElementRef;
  @ViewChild('logOutPopOver') logPopOver: ElementRef;
  @ViewChild('navBar') navBar: ElementRef;
  @ViewChild('RouterOutlet') outlet: RouterOutlet;
  @ViewChild('notificationPopOver') notificationPopOver;

  selectedItem: any;
  userName: string;
  userText: string; // change after login creation
  userRole: string;
  firstName: string;
  lastName: string;
  // sortPipe: SortOrderPipe;
  captions: any;
  isEatecEnabled: boolean;
  transactionCountSubscription: Subscription;
  notificationCount: number = 0;
  notificationInfo: {id: number , message: string }[] = [];
  isChangePropertyEnabled: boolean;
  @Input('menu')
  set MenuValue(value) {
    this.menuList = value;
    this.levelMenu = value.menuType;
    // this.menuList.menu = this.sortPipe.transform(this.menuList.menu, 'order', 'aesc');
     console.log("menulist", this.menuList);
  }

  constructor(public router: Router
    , private _localization: RetailStandaloneLocalization
    , private _sessionService: ManageSessionService
    , private activeRoute: ActivatedRoute
    , private dialog: MatDialog
    , private _featureFlagService: RetailFeatureFlagInformationService
    , private _propertyFeatureService: PropertyFeaturesConfigurationService
    , private _propertyInfo: RetailPropertyInformation
    , private elementRef: ElementRef
    , private retailServiceRegistry: RetailServiceRegistry
    , private _headerService: SPAConfig
    , private _http: HttpServiceCall
    ,public quickLoginUtils: QuickLoginUtilities
    , private propertyService: PropertyService
    , private changePropertySevice: ChangePropertySevice
    , private userDefaultsService: UserdefaultsInformationService
    , private userSessionConfig: UserMachineConfigurationService
    , private authentication: AuthenticationService
    ) {
    // this.sortPipe = new SortOrderPipe();
  }

  ngOnInit() {
    this.captions = this._localization.captions;
    this.userName = this._localization.GetUserInfo("userName");
    this.firstName = this._localization.GetUserInfo("firstName");
    this.lastName = this._localization.GetUserInfo("lastName");
    this.userRole = this._localization.GetUserInfo("roleName");

    this.transactionCountSubscription = this._sessionService.transactionCount.subscribe(res => {
      const revenueresult = res && res.find(x => x.id === NotificationFailureType.revenuePostingFailure) ;
      const paymentresult = res && res.find(x => x.id === NotificationFailureType.paymentTransactionFailure) ;
      if (revenueresult && revenueresult.count > 0) {
        if (this.notificationInfo && this.notificationInfo.length > 0 &&
           this.notificationInfo.some(x => x.id === NotificationFailureType.revenuePostingFailure )) {
            this.notificationInfo.find(x => x.id === NotificationFailureType.revenuePostingFailure ).message =
            this._localization.replacePlaceholders(this.captions.RevenuePostingInfo, ['count'], [ revenueresult.count]);
          }
        else {
          this.notificationInfo.push({
            id :  NotificationFailureType.revenuePostingFailure,
            message : this._localization.replacePlaceholders(this.captions.RevenuePostingInfo, ['count'], [ revenueresult.count])
          });
        }
      }
      if (paymentresult && paymentresult.count > 0) {
        if (this.notificationInfo && this.notificationInfo.length > 0 &&
          this.notificationInfo.some(x => x.id === NotificationFailureType.paymentTransactionFailure )) {
           this.notificationInfo.find(x => x.id === NotificationFailureType.paymentTransactionFailure ).message =
           this._localization.replacePlaceholders(this.captions.FailedTransLogInfo, ['count'], [ paymentresult.count]);
         }
       else {
         this.notificationInfo.push({
           id :  NotificationFailureType.paymentTransactionFailure,
           message :  this._localization.replacePlaceholders(this.captions.FailedTransLogInfo, ['count'], [ paymentresult.count])
         });
       }
      }
      this.notificationCount = this.notificationInfo.length;
    });

    this.quickLoginUtils.resetQuickIdDetails(); 
    if (!sessionStorage.getItem("QuickIdConfig")) {
      this._propertyFeatureService.SetQuickIdConfigSettingForRetail("QuickIdConfig"); 
    }
    this.isChangePropertyEnabled = this.propertyService.isChangePropertyEnabled();

    if (this.firstName == "undefined" || this.lastName == "undefined" || this.firstName == undefined || this.lastName == undefined) {
      this.userText = this.userName ? this.userName.charAt(0).toUpperCase() : '';
    }
    else {
      this.userText = this.firstName.charAt(0).toUpperCase() + this.lastName.charAt(0).toUpperCase();
    }
    if (this.levelMenu === menuTypes.tertiary || this.levelMenu === AgMenuTypes.combo) {
     
      this.selectedItem = this.menuList.menu.find(x => this.router.url.indexOf(x.routePath) > -1);
      this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(x => {
        this.selectedItem = this.menuList.menu.find(menu => this.router.url.indexOf(menu.routePath) > -1);
        this.selectedItem = { ...this.selectedItem };
      });
    }
    this.RefreshConfig();
    if(!sessionStorage.getItem("enableMachineTransaction")) {
      this._propertyFeatureService.GetMiscConfig();
    }
    // On Property Change 
    this.changePropertySevice.propertyChanged$.pipe(takeUntil(this.destroyed$)).subscribe(propertyChanged => {
      if (propertyChanged) {
        console.log(propertyChanged);
        this.userRole = this._localization.GetUserInfo("roleName");
        this._featureFlagService.reset();
        this.RefreshConfig(propertyChanged);
        this.userDefaultsService.syncDefaultValues(Number(this._localization.GetUserInfo("userId")));
        this.userSessionConfig.getAllClientSetting().then(defaultsSetting => {
          sessionStorage.setItem('defaultSettings', JSON.stringify(defaultsSetting));
        });
        if (!this._propertyInfo.UseRetailInterface) {
          this.notificationCount = 0;
          this.notificationInfo = [];
          this._sessionService.startTimerForNotification(1);
        }
        this.quickLoginUtils.resetQuickIdDetails(); 
        this._propertyFeatureService.SetQuickIdConfigSettingForRetail("QuickIdConfig"); 
        this._propertyFeatureService.GetMiscConfig();
        this.changePropertySevice.UnSubscribePropertyChangedEvent();
        // ths.setAcesToken(); For getting Member token 
      }
    });

  }

  RefreshConfig(isFromPropertyChangeEvent : boolean = false){
    if (!sessionStorage.getItem("giftCardConfiguration") || isFromPropertyChangeEvent) {
      this._propertyFeatureService.GetGiftCardConfiguration().then((config) => {
        this._propertyInfo.SetGiftCardConfiguration(config);
      });
    }
    this._featureFlagService.RefreshConfig();
  }

  changeProperty(e) {
    const dialogRef = this.dialog.open(ChangePropertyComponent, {
      width: '30%',
      height: '35%',
      disableClose: true,
      hasBackdrop: true,
      data: {}
    });
    dialogRef.afterClosed().subscribe((res) => {
      console.log(res);
    });
    this.logOutPopOver.hide();
    e.stopPropagation();

  }

  async setAcesToken() {
    try {
      const token = await this.authentication.getEngageToken();
      sessionStorage.setItem('acesJwt', token.result);
    } catch (ex) {
      console.log(ex);
    }
  }

  compareSelect = (val1, val2) => {
    return val1 && val2 && val1.text === val2.text;
  }

  ngAfterViewInit() {
    if (this.levelMenu === menuTypes.primary || this.levelMenu === AgMenuTypes.initial) {
      setTimeout(() => {
        this.bindHeaderData();
      }, 1);
    }
  }

  ngOnDestroy() {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
    if (this.transactionCountSubscription) {
      this.transactionCountSubscription.unsubscribe();
    }
  }

  // Calculation for more options
  bindHeaderData() {
    const menuItem = cloneDeep(this.menuList.menu);
    let menuTobeShown = [];
    this.moreListItem = [];
    let headerWidth = 0;
    let moreCalc = false;
    const parentelementWidth =  this.navBar && this.navBar.nativeElement.clientWidth;
    for (let i = 0; i < menuItem.length; i++) {
      const elementWidth = this.getTextWidth(menuItem[i].text, '100 14px LatoWeb');
      headerWidth += elementWidth + 66;
      if ((parentelementWidth - headerWidth) >= elementWidth) {
        moreCalc = false;
        menuTobeShown.push(menuItem[i]);
      } else {
        moreCalc = true;
        break;
      }
    }
    if (moreCalc) {
      menuTobeShown = [];
      headerWidth = 0;
      const moreWidth = this.getTextWidth(this.moreTextName, '100 14px LatoWeb');
      const LegendsWidth = parentelementWidth - (moreWidth + 66);
      for (let i = 0; i < menuItem.length; i++) {
        const elementWidth = this.getTextWidth(menuItem[i].text, '100 14px LatoWeb');
        headerWidth += elementWidth + 66;
        if ((LegendsWidth - headerWidth) >= elementWidth) {
          menuTobeShown.push(menuItem[i]);
        } else {
          this.moreListItem.push({ imgPath: menuItem[i].imgPath, text: menuItem[i].text, routePath: menuItem[i].routePath, visibility: menuItem[i].visibility });
        }
      }
    }
    this.menuItems = menuTobeShown;
    this.onResize();
  }

  // Text width
  getTextWidth(text, font) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text.toUpperCase());
    if (canvas) {
      canvas.remove();
    }
    return Math.ceil(metrics.width);
  }

  userPop(logOutPopOver) {
    this.logOutPopOver = logOutPopOver;
    const logOut = this.logOutPopOver.element.nativeElement;
    logOut.querySelectorAll('div')[0].style.display = 'none';
    setTimeout(() => {
      const popover = logOut.querySelectorAll('div');
      const leftValue = popover[0].style.left.split('px');
      popover[0].style.left = (Number(leftValue[0])) + 'px';
      popover[0].style.top = 60 + 'px';
      popover[0].style.display = 'block';
    }, 100);
  }

  onResize() {
    // For closing the more pop over
    if (this.headerPopOver) {
      this.headerPopOver.hide();
    }

    // For closing the logout pop over
    if (this.logOutPopOver) {
      this.logOutPopOver.hide();
    }
  }

  openPopUp(popOver) {
    this.headerPopOver = popOver;
  }

  async logout() {
    this.logoutEatec();
    this._featureFlagService.reset();
    await this._sessionService.logout();
    this.retailServiceRegistry.resetAllServiceData();
    const bodyTag = document.getElementsByTagName('body')[0];
    bodyTag.removeAttribute("id");
  }

  logoutEatec() {

    let eatecUrl = this._propertyInfo.getEatecURI;
    const url = 'sso/logout';

    const eatecToken = sessionStorage.getItem('eatecJwt');

    if (!eatecUrl || !eatecToken) {
      return '';
    }

    if (!eatecUrl.endsWith('/')) {
      eatecUrl += '/';
    }

    eatecUrl = `${eatecUrl}${url}`;

    const doc = this.elementRef.nativeElement.offsetParent;
    const eatecIframe = doc.querySelector('#eatec-iframe');

    if (eatecIframe) {
      doc.removeChild(eatecIframe);
    }

    doc.insertAdjacentHTML('beforeend', '<iframe id="eatec-iframe" style="display:none" src="' + eatecUrl + '"></iframe>');
  }

  onSearch(e: any) {

  }

  openGlobalSearch(e, type) {
    this.searchOpen = !this.searchOpen;
    this.menusearchOpen = false;
  }

  openMenuSearch() {
    this.menusearchOpen = !this.menusearchOpen;
    this.searchOpen = false;
  }

  OptionSelected(event) {
    this.searchOpen = false;
  }

  MenuOptionSelected(event) {
    this.menusearchOpen = false;
  }

  navigateTo(option) {
    this.router.navigate([option.value.routePath], { state: { ShowPopup: true, onSubmoduleChange: true } });
  }

  //  help about

  async openIcon() {
    const hostUrl = this._headerService.getUrl('host.documentation') + 'retail/';
    //let help_hosturl = hostUrl + '/retail/';
    let help_page = 'AgilysysRetail_Home.htm';
    const appver = sessionStorage.getItem('productVersion');
    const dotRegEx = /\./gi;
    const productVersion = appver && appver != 'null' ? appver : '12.4';
    let _applicationVersion = productVersion.replace(dotRegEx, '_');
    let url = hostUrl + _applicationVersion + '/' + help_page;
    const jwt = sessionStorage.getItem('_jwt');
    const isAuthorized = await this._http.createHelpUserSession(jwt);
    if (isAuthorized && jwt) {
      url = url + '?jwt=' + jwt
      setTimeout(() => { window.open(url, '_blank') }, 1000)
    }
  }

  openAboutDialog() {
    const message = this._localization.replacePlaceholders(this.captions.versionInfo, ['productVersion'], [sessionStorage.getItem('userProductVersion')]);
    const dialogRef = this.dialog.open(AboutComponent, {
      height: 'auto',
      width: '300px',
      data: { title: this.captions.about, message, buttonText: this.captions.okay, },
      panelClass: 'small-popup',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(res => {
    });
  }

  removeRevenuePostInfo(){
    this.notificationInfo = this.notificationInfo?.filter(x => x.id !== NotificationFailureType.revenuePostingFailure);
  }

  removePaymentFailureInfo(){
    this.notificationInfo = this.notificationInfo?.filter(x => x.id !== NotificationFailureType.paymentTransactionFailure);
  }

  routeTransc(id: number) {
    if (id === NotificationFailureType.revenuePostingFailure) {
      this.router.navigate(['/shop/viewshop/retailtransactions/revenuepostingslog']);
      this.removeRevenuePostInfo();
      this.notificationCount = this.notificationInfo?.length;
    }
    else if (id === NotificationFailureType.paymentTransactionFailure){
      this.router.navigate(['/shop/viewshop/retailtransactions/transactionslog']);
      this.removePaymentFailureInfo();
      this.notificationCount = this.notificationInfo?.length;
    }
    this.notificationPopOver.hide();
  }
}
