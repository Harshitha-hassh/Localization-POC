import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
import { RouteLoaderService } from '../services/route-loader.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LayoutComponent implements OnInit {

  menuList: any;

  constructor(private routeDataService: RouteLoaderService) { }

  ngOnInit() {
      const value = this.routeDataService.GetChildMenu("/");
      this.menuList = {
        menuType: menuTypes.primary,
        menu: value
      };
  }

}
