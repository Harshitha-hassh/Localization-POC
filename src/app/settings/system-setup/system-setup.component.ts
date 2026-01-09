import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';

@Component({
  standalone: false,
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
      menuType: value.linkedElement[0].menuAlignment
    };
  }

  ngOnInit() {
  }

}
