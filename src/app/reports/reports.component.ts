import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { menuTypes } from '../shared/enums/menu.constant';
import { RouteLoaderService } from '../core/services/route-loader.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class ReportsComponent implements OnInit {

  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService) {    
   }

  async ngOnInit() {
    const value = this.routeDataService.GetChildMenu('/reports');
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.secondary
    };
  }

}
