import { Component, OnInit, ViewChild } from '@angular/core';
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
  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/setting');
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.secondary
    };
  }

  ngOnInit() {
   
  }

}