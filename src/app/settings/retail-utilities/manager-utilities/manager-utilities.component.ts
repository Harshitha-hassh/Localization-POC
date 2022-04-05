import { Component, OnInit } from '@angular/core';
import { ManagerUtilitiesService } from './manager-utilities.service';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/retail/retail.modals';

@Component({
  selector: 'app-manager-utilities',
  templateUrl: './manager-utilities.component.html',  
  providers: [ManagerUtilitiesService]
})
export class ManagerUtilitiesComponent implements OnInit {

  menuItems: any;
  captions: any;
  relativePath: string;
  menuList: any;
  menuType = menuTypes;
  constructor(private _ManagerUtilitiesService: ManagerUtilitiesService,private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/utilities/managerUtilities',3);
    this.menuList = {
      menu: value.linkedElement,
      menuType : menuTypes.lowerLevel
    };
   }

  ngOnInit() {
    this.captions = this._ManagerUtilitiesService.getCaptions();
    this.menuItems = [
      // { id: ManagerUtilsMenu.summerHandicaps, viewValue: this.captions.summerHandicaps },
      // { id: ManagerUtilsMenu.standardMembers, viewValue: this.captions.standardMembers },
     // { id: ManagerUtilsMenu.defaultUserConfig, viewValue: this.captions.defaultUserConfig }
      // { id: ManagerUtilsMenu.printerConfiguration, viewValue: this.captions.printerConfig }
    ];
    this.relativePath = "../managerUtilities";
  }

}
