import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/shared/enums/menu.constant';

@Component({
  selector: 'app-system-setup',
  templateUrl: './system-setup.component.html',
  styleUrls: ['./system-setup.component.scss']
})
export class SystemSetupComponent implements OnInit {

  menuList: any;

  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/systemsetup');
    this.menuList = {
      menu: value.linkedElement,
      menuType: menuTypes.lowerLevel
    };
  }

  ngOnInit() {
  }

}
