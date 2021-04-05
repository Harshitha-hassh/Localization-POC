import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from '../core/services/route-loader.service';
import { menuTypes } from '../shared/enums/menu.constant';

@Component({
  selector: 'app-form',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent implements OnInit {
  menuList: any;
  menuType = menuTypes;

  constructor(private routeDataService: RouteLoaderService) { 
    const value = this.routeDataService.GetChildMenu('/client');
    this.menuList = {
      menu: value.linkedElement,
      menuType : value.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
