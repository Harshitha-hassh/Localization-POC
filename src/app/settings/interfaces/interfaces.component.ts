import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/shared/enums/menu.constant';

@Component({
  standalone: false,
  selector: 'app-interfaces',
  templateUrl: './interfaces.component.html',
  styleUrls: ['./interfaces.component.scss']
})
export class InterfacesComponent implements OnInit {
  menuList: any;

  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/interfaces');
    this.menuList = {
      menu: value.linkedElement,
      menuType: menuTypes.tertiary
    };
  }

  ngOnInit() {
  }

}
