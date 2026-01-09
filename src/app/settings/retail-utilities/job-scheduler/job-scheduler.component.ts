import { Component, OnInit } from '@angular/core';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/shared/enums/menu.constant';
@Component({
  standalone: false,
  selector: 'app-job-scheduler',
  templateUrl: './job-scheduler.component.html',
  styleUrls: ['./job-scheduler.component.scss']
})
export class JobSchedulerComponent {

  menuList: any;
  menuType = menuTypes;
  constructor(private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/utilities/jobScheduler', 3);
    this.menuList = {
      menu: value.linkedElement,
      menuType : value.linkedElement[0].menuAlignment
    };
  }


}
