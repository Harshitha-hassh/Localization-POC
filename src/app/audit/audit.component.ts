import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from '../core/services/route-loader.service';
import { menuTypes } from '../shared/enums/menu.constant';

@Component({
  selector: 'app-audit',
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss']
})
export class AuditComponent implements OnInit {
  menuList: any;
  menuType = menuTypes;

  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/audit');
    this.menuList = {
      menu: value.linkedElement,
      menuType : value.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
