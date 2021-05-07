import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { RetailPropertyInformation } from '../services/retail-property-information.service';
import { RouteLoaderService } from '../services/route-loader.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {

  menuList: any;
  propertyName: string;
  propertyDateTime: any;

  constructor(private routeDataService: RouteLoaderService,
    private localization: RetailLocalization,
    private propertyInfo: RetailPropertyInformation) {
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
  }

  applyTheme(name) {
    sessionStorage.setItem('theme', name);
    setTimeout(() => {
      const theme = sessionStorage.getItem('theme');
      document.querySelectorAll('body')[0].setAttribute('class', theme);
      // if css need to change for popover, apply class to body
    }, 1);
    this.propertyName = this.localization.GetPropertyInfo('PropertyName');
    this.propertyDateTime = this.localization.LocalizeDateTimeFormatSecondsDDMMMYYYY(this.propertyInfo.CurrentDate);
  }

}
