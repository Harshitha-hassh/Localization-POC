import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { menuTypes } from '../shared/enums/menu.constant';
import { RouteLoaderService } from '../core/services/route-loader.service';
import { RetailPropertyInformation } from '../retail/common/services/retail-property-information.service';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit {
  menu :any;
  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService, private propertyInfo : RetailPropertyInformation) {
   }

  async ngOnInit() {
    const value = this.routeDataService.GetChildMenu('/reports');
    this.menu = value.linkedElement;
    if(!this.propertyInfo.IsEatecEnabled) {
      let configsToRemove = ['/reports/inventorycontrol'];
      this.menu = this.menu.filter(r => !configsToRemove.includes(r.routePath));
    } 
    this.menuList = {
      menu: this.menu,
      menuType :  value.linkedElement[0].menuAlignment
    };
  }

}
