import { Component, OnInit } from '@angular/core';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';

@Component({
  selector: 'app-retail-utilities',
  templateUrl: './retail-utilities.component.html',
  styleUrls: ['./retail-utilities.component.scss']
})
export class RetailUtilitiesComponent implements OnInit {


  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/utilities', 3);
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.tertiary
    };
  }

  ngOnInit() {
  }

}
