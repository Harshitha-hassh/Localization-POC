import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { RetailPropertyInformation } from '../../retail/common/services/retail-property-information.service';
import { menuTypes } from '../../retail/retail.modals';
import { SsoPostMessage, UserBreakPoint } from '../../retail/shared/business/shared.modals';
import { BreakPointAccess } from '../../retail/shared/service/breakpoint.service';
import { RetailBreakPoint } from '../../retail/shared/globalsContant';
import { RetailLocalization } from '../../retail/common/localization/retail-localization';
import { interval,ReplaySubject,Subscription, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RetailUtilities } from '../../retail/shared/utilities/retail-utilities';
import {TooltipPosition} from '@angular/material/tooltip';
import { UntypedFormControl } from '@angular/forms';


@Component({
  selector: 'app-eatec',
  templateUrl: './eatec.component.html',
  styleUrls: ['./eatec.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EatecComponent implements OnInit, OnDestroy {

  menuList: any;
  menuType = menuTypes;
  verticalList: any;
  isEnable = false;
  isShow = false;
  isPrimaryHighlight: number;
  selectedItem: any;
  eatecSetupBreakPoints: UserBreakPoint[] = [];
  eatecMenu:any;
  src: SafeResourceUrl = '';
  baseRoute = '/settings/enhancedInventory';
  initialRoute ='';
  eatecSignOn = false;
  initialBreakPoint :number;
  @ViewChild('embed') embedEatec: ElementRef;
  floatLabel: string;
  stateData: any;
  selectedBreakPoint: number;
  waitTime: number;
  public timerSubscription: Subscription;
  enableRefresher:boolean = false;
  selectedRoutePath: string;
  captions: any;
  destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  currentNavURLIdx;
  routeElementId: any;
  positionOptions: TooltipPosition[] = ['right', 'above', 'left', 'below'];
  position = new UntypedFormControl(this.positionOptions[0]);
  EnableRetailIC: boolean;
  HasAccess: boolean;
  
  constructor(private routeDataService: RouteLoaderService
    , public router: Router,public localization: RetailLocalization
    , private propertyInformation: RetailPropertyInformation,private breakpoint: BreakPointAccess
    , private utils: RetailUtilities
    , private cdr: ChangeDetectorRef) {
    let propConfig = sessionStorage.getItem('propConfig') ? JSON.parse(sessionStorage.getItem('propConfig')) : null;
    this.EnableRetailIC = propConfig? (propConfig.EnableRetailIC == 'true'? true: false): null;
    this.stateData = this.router.getCurrentNavigation()?.extras?.state;  
    this.routeElementId = this.stateData?.data?.id; 
    const value = this.routeDataService.GetChildMenu(this.baseRoute);
    this.eatecMenu = value;
    value.linkedElement[0].linkedElement.map(res => {
      if (res) {
        if(res.text === "Transfer")
        {
              res.visibility = false;
        }
      }
    });
    this.menuList = {
      menu: value.linkedElement.filter(x => x.visibility),
      menuType: value.linkedElement[0].menuAlignment,
      breakPointNumber : value.breakPointNumber,
    };

    const waitTime : number = this.propertyInformation.getEatecConfiguration?.EISSOWaitPeriodInSecs ;
    this.enableRefresher = waitTime && waitTime > 0;
    this.waitTime = waitTime ? Number(waitTime) : 30;
    this.eatecSignOn =  sessionStorage.getItem('eatecSignOn') === 'true';
    this.floatLabel = this.localization.setFloatLabel;
    this.captions = this.localization.captions.common;

  }
  ngOnDestroy(): void {
    this.stopAutoEIRefresher();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  ngOnInit() {
    this.GetRetailBreakPoints();
    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(x => {
    this.routeElementId = this.router.getCurrentNavigation()?.extras?.state?.data?.EntityElementID;
    this.menuList.menu.filter(m => m.visibility).forEach(x => {
        if(x.elementID == this.routeElementId){
          this.navigateFunc(x);
          return;
        } else {
          x.linkedElement.filter(m => m.visibility).find(y => {
            if(y.elementID == this.routeElementId){
              this.navigateFunc(x);
              return;
            }
          } )
        }
      }
    )});

    if(this.stateData?.data == null){
      this.initialLoad();
    }
    this.redirectToSelectedMenu();
    console.log("route", this.router.url)
  }

  redirectToSelectedMenu(){
    if(this.EnableRetailIC){
      if(this.router.url.includes("inventorylist")){
        this.navigateToMenu("/settings/enhancedInventory/inventory","inventorylist");
      }
      else if(this.router.url.includes("physicalinventory")){
        this.navigateToMenu("/settings/enhancedInventory/inventory","physicalinventory");
      }
      else if(this.router.url.includes("receiving")){
        this.navigateToMenu("/settings/enhancedInventory/procurement", "receiving");
      }
      else if( this.router.url.includes("purchaseorder")){
        this.navigateToMenu("/settings/enhancedInventory/procurement", "purchaseorder");
      }
    }else {
        this.navigateToMenu("/settings/enhancedInventory/inventory","inventory");
    }
  }

  navigateToMenu(menuRoute,verticalMenuRoute){
    this.menuList.menu.find(menu=>{
      if(menu.routePath == menuRoute || menu.routePathIC == menuRoute){
        this.selectedItem = menu;
        this.verticalList = menu.linkedElement.filter(x => x.visibility);
        let index = this.verticalList.findIndex(x => x.routePath.includes(verticalMenuRoute))
        this.showSidecontainer(this.verticalList[index],index);
      }
     })
  }

  navigateFunc(data){
    this.menuList.menu.forEach((element,index) => {
      if(index== data.order-1){
        this.selectedItem = this.menuList.menu[index];
      }
    });
    this.changeElements( this.selectedItem);
    this.verticalList.forEach((x,yindex)=>{
      if(x.elementID ==  this.router.getCurrentNavigation()?.extras?.state?.data?.EntityElementID){
        this.isPrimaryHighlight = yindex;
      }
    });
  }

  ngAfterViewInit(){
    if(this.stateData?.data){
      this.menuList.menu.forEach((element,index) => {
        if(index== this.stateData.data.parent){
          this.selectedItem = this.menuList.menu[index];
        }
      });
      this.changeElements( this.selectedItem);
      this.verticalList.forEach((x,yindex)=>{
        if(x.text == this.stateData.data.text){
          this.isPrimaryHighlight = yindex;
        }
      });
    }
  }

  triggerAutoEIRefresher(){
    this.utils.ToggleLoader(true);
    this.eventListener();
    const refresher$ =  interval(500);
    this.timerSubscription = refresher$.pipe(takeUntil(timer(this.waitTime*1000))).subscribe(
      res => {
        const ssoMessage = sessionStorage.getItem('SSOMessage');
        if(!ssoMessage) {
          return ;
        }

        try{
          const response : SsoPostMessage = JSON.parse(ssoMessage);
          const statusCode  = response.SSOStatusCode;
          if(statusCode == 200){
            console.log('Sign On succeeded');
            sessionStorage.setItem('eatecSignOn', 'true');
            this.eatecSignOn = true;
            this.stopAutoEIRefresher();
          } 
          else{
            this.stopAutoEIRefresher();
            const error = response.Message ? response.Message : this.localization.getUnexpectedErrorMessage();
            this.utils.showError(error);
          }
        }
        catch(error){
          console.log(error);
          this.stopAutoEIRefresher(); 
        }
     },
     err => {
      console.log(err);
      this.stopAutoEIRefresher(); // unsubscribe on error
     },
     () => {
      this.stopAutoEIRefresher(); // unsubscribe on complete
     }
    ); 
  }

  eventListener() {
  const eatecuri = sessionStorage.getItem('EIURI');    
  let result;
  if (eatecuri) {
    result = eatecuri.split('/#')[0];
  } else {
    result = null;
  }
  window.addEventListener('message', function (e) {          
    if (e.origin === result) {
      console.log("SSOMessage", e.data);      
    sessionStorage.setItem('SSOMessage', e.data);
   }     
  });
}
  
  stopAutoEIRefresher(){
    this.utils.ToggleLoader(false);
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
    }
  }

  validateLoginandSetRoute() {
    if (!this.eatecSignOn) {
      this.doEatecLogin();
      if(this.enableRefresher) {
        this.triggerAutoEIRefresher();
      }
      else {
        this.eatecSignOn = true;
        sessionStorage.setItem('eatecSignOn', this.eatecSignOn.toString());
        this.setRoute(this.selectedRoutePath);
      }
    } else {
      this.setRoute(this.selectedRoutePath);
    }
  }

  initialLoad() {
    if(this.menuList.menu){
      this.menuList.menu.forEach(element => {
        if(this.selectedItem){
          return;
        }
        else{
          element.linkedElement.filter(x => x.visibility).forEach((item,index) => {
            if(!this.initialRoute){
              item['IsAllow'] = this.eatecSetupBreakPoints.find(x => x.breakPointNumber == item.breakPointNumber) && this.eatecSetupBreakPoints.find(x => x.breakPointNumber == item.breakPointNumber).allow;
              if(item['IsAllow']){
                this.initialRoute=item.routePath;
                this.initialBreakPoint=item.breakPointNumber;
                this.isPrimaryHighlight = index;
                return;
              }
            }
          });
          if(this.initialRoute){
            this.selectedItem = element;
            this.verticalList = element.linkedElement.filter(x => x.visibility);
            return;
          }
        }
      });
    }

    if(!this.initialRoute){
      this.selectedItem =this.menuList.menu[this.menuList.menu.length -1 ];
      this.verticalList =  this.selectedItem.linkedElement.filter(x => x.visibility);
      this.isPrimaryHighlight = this.verticalList.length - 1;
      this.initialBreakPoint=this.verticalList[this.verticalList.length - 1].breakPointNumber
    }

    this.isEnable = this.verticalList.length > 0 ? true : false;
    this.isShow = this.isEnable ? true : false;
    this.selectedBreakPoint = this.initialBreakPoint;
    this.selectedRoutePath = this.initialRoute;
    this.authorizeElementsOnChange();
  }

  compareSelect = (val1, val2) => {
    return val1 && val2 && val1.text === val2.text;
  }

  changeElements(value){
    this.verticalList = value.linkedElement.filter(x => x.visibility);
    this.isEnable = this.verticalList.length > 0 ? true : false;
    this.isPrimaryHighlight = 0;
    const selectedElement = this.verticalList.find(x => x.elementID == this.routeElementId );
    this.selectedBreakPoint = selectedElement ? selectedElement.breakPointNumber : this.verticalList[0].breakPointNumber;
    this.selectedRoutePath = selectedElement ? selectedElement.routePath : this.verticalList[0].routePath;
    this.authorizeElementsOnChange();
  }

  change(e) {
    this.verticalList = e.value.linkedElement.filter(x => x.visibility);
    this.isEnable = this.verticalList.length > 0 ? true : false;
    this.isPrimaryHighlight = 0;
    this.selectedBreakPoint = this.verticalList[0].breakPointNumber;
    this.selectedRoutePath = this.verticalList[0].routePath;
    if(this.EnableRetailIC){
      this.routeToURL(this.verticalList[0]);
    }
    this.authorizeElementsOnChange();
  }

  authorizeElementsOnChange(){
    if(this.IsAuthorizedEatecMenu(this.selectedBreakPoint)){
      this.validateLoginandSetRoute();
    }
    else{
      this.showBreakpointPopup(this.selectedBreakPoint);
    }
  } 

  setRoute(url: string) {
    if (!url) { return; }
    url = this.formatEatecUrl(url);
    this.src = url;
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    })
    this.cdr.detectChanges();
    this.isShow = true;
  }

  showSidecontainer(data, idx) {
    this.isShow = true;
    this.selectedBreakPoint = data.breakPointNumber;
    this.selectedRoutePath = data.routePath;
    if(this.IsAuthorizedEatecMenu(this.selectedBreakPoint)){
      this.isPrimaryHighlight = idx;
      if(this.EnableRetailIC){
        this.routeToURL(data);
      } else{
        this.validateLoginandSetRoute();
      }
    }
    else{
      this.isPrimaryHighlight = idx;
      this.showBreakpointPopup(this.selectedBreakPoint);
    }
    this.cdr.detectChanges();
  }

  routeToURL(data){
    if(this.EnableRetailIC){
      if(data.routePath === "/settings/enhancedInventory/masterlist/inventorylist"){
        this.router.navigate(['/settings/enhancedInventory/masterlist/inventorylist']);
      } else if(data.routePath === "/settings/enhancedInventory/transaction/view-physicalinventory"){
        this.router.navigate(['/settings/enhancedInventory/transaction/view-physicalinventory']);
      } else if(data.routePath === "/settings/enhancedInventory/transaction/view-receiving"){
        this.router.navigate(['/settings/enhancedInventory/transaction/view-receiving']);
      } else if(data.routePath === "/settings/enhancedInventory/transaction/view-purchaseorder"){
        this.router.navigate(['/settings/enhancedInventory/transaction/view-purchaseorder']);
      }
    }
  }

  private doEatecLogin(): void {
    const token = sessionStorage.getItem('eatecJwt');
    const propertyId = this.propertyInformation.GetPropertyInfoByKey('PropertyId');
    const tenantId = this.propertyInformation.GetPropertyInfoByKey('TenantId');
    const key = NavigationRoute[this.selectedBreakPoint];
    const originKey = window.location.origin;
    const url = `/sso/login?propertyid=${propertyId}&tenantid=${tenantId}&token=${token}&navigationKey=${key}&origin=${originKey}`;
    this.setRoute(url);
  }

  private formatEatecUrl(url: string): string {

    url = url.replace(this.baseRoute, '');
    let eatecUrl = this.propertyInformation.getEatecURI;

    if (!eatecUrl) {
      return '';
    }

    if (!eatecUrl.endsWith('/') && !url.startsWith('/')) {
      eatecUrl += '/';
    }

    return `${eatecUrl}${url}`;
  }

  GetRetailBreakPoints(){
    this.eatecSetupBreakPoints = this.breakpoint.GetBreakPoint([
      RetailBreakPoint.EatecInventory,
      RetailBreakPoint.EatecTransfer,
      RetailBreakPoint.EatecPhysicalInventory,
      RetailBreakPoint.EatecReceiving,
      RetailBreakPoint.EatecPurchaseOrder]).result;
  }
  
  IsAuthorizedEatecMenu(bkPoint: number){
    var isAllow = true;
    isAllow = this.eatecSetupBreakPoints.find(x => x.breakPointNumber == bkPoint) && this.eatecSetupBreakPoints.find(x => x.breakPointNumber == bkPoint).allow;
    this.HasAccess = isAllow;
    return isAllow;
  }

  showBreakpointPopup(bkPoint: number){
    this.src = '';
    this.isShow = true;
    this.breakpoint.showBreakPointPopup(this.localization.captions.breakpoint[bkPoint]);
    return;
  }
}

enum NavigationRoute{
  EatecInventory = 8731,
  EatecTransfer = 8732,
  EatecPhysicalInventory = 8733,
  EatecReceiving = 8734,
  EatecPurchaseOrder = 8735,
}
