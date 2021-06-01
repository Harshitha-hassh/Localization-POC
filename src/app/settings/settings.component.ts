import { Component, OnInit } from '@angular/core';
import { menuTypes } from '../shared/enums/menu.constant';
import { RouteLoaderService } from '../core/services/route-loader.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  menuList: any;
  menuType = menuTypes;
  eatecEnabled:boolean;
  menu :any;

  constructor(private routeDataService: RouteLoaderService) {
    var value = this.routeDataService.GetChildMenu('/settings');
    this.menu = value.linkedElement;
    const e = sessionStorage.getItem('isEatecEnabled');
    this.eatecEnabled = e === 'true';
    let configsToRemove = ['/settings/enhancedInventory'];
  
    this.menu = !this.eatecEnabled? this.menu.filter(r => !configsToRemove.includes(r.routePath)) :  this.menu;

    this.menuList = {
      menu: this.menu ,
      menuType : value.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
