import { Component, OnInit } from '@angular/core';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { RetailPropertyInformation } from 'src/app/core/services/retail-property-information.service';
@Component({
  selector: 'app-retail-utilities',
  templateUrl: './retail-utilities.component.html',
  styleUrls: ['./retail-utilities.component.scss']
})
export class RetailUtilitiesComponent implements OnInit {


  menuList: any;
  menuType = menuTypes;
  codeRoute: any;
  constructor(private routeDataService: RouteLoaderService,
    private propertyInfo: RetailPropertyInformation) {
    this.codeRoute = this.routeDataService.GetChildMenu('/settings/utilities', 3);
    this.codeRoute.linkedElement.map(res => {
      if (res) {
        if(!this.propertyInfo.IsEatecEnabled)
        {
          if(res.routePath === '/settings/utilities/inventorysync') 
          {
              res.visibility = false;
          }
        }
      }
    });
    this.menuList = {
      menu: this.codeRoute.linkedElement,
      menuType :this.codeRoute.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
