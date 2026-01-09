import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { menuTypes } from '../shared/enums/menu.constant';
import { RouteLoaderService } from '../core/services/route-loader.service';
import { RetailPropertyInformation } from '../retail/common/services/retail-property-information.service';
import { RetailFeatureFlagInformationService } from '../retail/shared/service/retail.feature.flag.information.service';
@Component({
  standalone: false,
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit {
  menu :any;
  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService, private propertyInfo : RetailPropertyInformation,private featureSwitch: RetailFeatureFlagInformationService) {   
  }

  async ngOnInit() {
    const value = this.routeDataService.GetChildMenu('/reports');
    this.menu = value.linkedElement;
    if(!this.propertyInfo.IsEatecEnabled) {
      let configsToRemove = ['/reports/inventorycontrol'];
      this.menu = this.menu.filter(r => !configsToRemove.includes(r.routePath));
    }
   var result = sessionStorage.getItem('EnablePhilippinesFiscalReport')?.toLowerCase() === 'true' ? true : false;
    if(!result) {
      let configsToRemove = ['/reports/fiscalreports'];
      this.menu = this.menu.filter(r => !configsToRemove.includes(r.routePath));
    } else {
      const fiscalReportMenu = this.menu.find(r => r.routePath === '/reports/fiscalreports');
      if(fiscalReportMenu) {
        fiscalReportMenu.visibility = true;
      }
    }
    this.menuList = {
      menu: this.menu,
      menuType :  value.linkedElement[0].menuAlignment
    };
  }

}
