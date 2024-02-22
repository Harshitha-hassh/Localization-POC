import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/retail/retail.modals';

@Component({
  selector: 'app-config-validation',
  templateUrl: './config-validation.component.html',
  styleUrls: ['./config-validation.component.scss']
})
export class ConfigValidationComponent implements OnInit {

  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/utilities/configValidation', 3);
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.lowerLevel
    };
  }

  ngOnInit() {
  }

}
