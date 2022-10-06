import { Component, OnInit } from '@angular/core';
import { menuTypes } from '../shared/enums/menu.constant';
import { RouteLoaderService } from '../core/services/route-loader.service';
import { RetailPropertyInformation } from '../retail/common/services/retail-property-information.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  menuList: any;
  menuType = menuTypes;
  menu :any;

  constructor(private routeDataService: RouteLoaderService, private propertyInfo : RetailPropertyInformation) {
    const value = this.routeDataService.GetChildMenu('/settings');
    this.menu = value.linkedElement;

    if(!this.propertyInfo.IsEatecEnabled) {
      let configsToRemove = ['/settings/enhancedInventory'];
      this.menu = this.menu.filter(r => !configsToRemove.includes(r.routePath));
    } else {
      this.propertyInfo.setICRoutes(this.menu);
    }

    this.menuList = {
      menu: this.menu ,
      menuType : value.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
