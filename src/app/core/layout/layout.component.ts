import { OnDestroy } from '@angular/core';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PropertyService } from 'src/app/common/services/property.service';
import { ManageSessionService } from 'src/app/login/manage-session.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { PropertyInformation } from '../services/property-information.service';
import { RetailPropertyInformation } from '../services/retail-property-information.service';
import { RouteLoaderService } from '../services/route-loader.service';
import { Router } from '@angular/router';
import { ChangePropertySevice } from 'src/app/common/services/change-property.service';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

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
    private changePropertySevice: ChangePropertySevice) {
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
      this.propertyService.changeTitle();
      this.loadGoogleMap();
      this.triggerNotification();
      this.time();
      this.toggleStyle();
      this.changePropertySevice.propertyName$.pipe(takeUntil(this.destroyed$)).subscribe(propertyName => {
        if (propertyName && propertyName != null) {
          this.propertyName = propertyName;
        }
      });
  }

  ngOnDestroy() {
    if (this.destroyed$) {
      this.destroyed$.next(true);
      this.destroyed$.complete();
    }
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
