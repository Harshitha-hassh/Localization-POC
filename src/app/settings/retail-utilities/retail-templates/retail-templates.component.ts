import { Component, OnInit } from '@angular/core';

import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/shared/enums/menu.constant';

@Component({
  selector: 'app-retail-templates',
  templateUrl: './retail-templates.component.html',
  styleUrls: ['./retail-templates.component.scss']
})
export class RetailTemplatesComponent implements OnInit {

  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/utilities/templates', 3);
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.lowerLevel
    };
  }

  ngOnInit() {
  }

}
