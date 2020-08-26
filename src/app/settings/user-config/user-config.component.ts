import { Component, OnInit } from '@angular/core';
import { Localization } from '../../core/localization/Localization';
import { SettingsService } from '../settings.service';
import { SPAScheduleBreakPoint } from '../../shared/globalsContant';
import { SetupMenu } from '../../shared/business/view-settings.modals';
import { BreakPointAccess } from '../../shared/service/breakpoint.service';
import { UserBreakPoint } from '../../shared/business/shared.modals';
import { UserOutletAccessDataService } from './useroutletaccess.data.service';
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';
import { menuTypes } from 'src/app/shared/shared.modal';

@Component({
  selector: 'app-user-config',
  templateUrl: './user-config.component.html',
  styleUrls: ['./user-config.component.scss'],
  providers: [UserOutletAccessDataService]
})
export class UserConfigComponent implements OnInit {
  config: SetupMenu[];
  public setupBreakPoints: UserBreakPoint[] = [];
  configId: string;
  menuList: any;
  menuType = menuTypes;

  constructor(private _servicesetting: SettingsService, private localization: Localization,
    private breakpoint: BreakPointAccess, private routeDataService: RouteLoaderService) {
    const value = this.routeDataService.GetChildMenu('/settings/userconfig');
    this.menuList = {
      menu: value.linkedElement,
      menuType: menuTypes.tertiary
    };

    this._servicesetting.tabLoaderEnable.next(true);

  }

  ngOnInit() {
    this._servicesetting.GetBreakPoints();
    this.config = [

      { id: "userSetup", viewValue: this.localization.captions.setting.UserSetup, callDesc: "", breakPointNumber: SPAScheduleBreakPoint.UserSetup, IsAuthorized: true },
      { id: "roleSetup", viewValue: this.localization.captions.setting.RoleSetup, callDesc: "", breakPointNumber: SPAScheduleBreakPoint.UserRoleSetUp, IsAuthorized: true },
      { id: "userRole", viewValue: this.localization.captions.setting.UserRoleConfiguration, callDesc: "", breakPointNumber: SPAScheduleBreakPoint.UserRoleConfiguration, IsAuthorized: true }]
    this.config = this.userManagementBreakPoints(this.config);
    this.configId = this.config[0].id;
  }

  private IsActionAllowed(breakPoint: number): boolean {
    let _breakPoint: UserBreakPoint = this.setupBreakPoints.find(bp => bp.breakPointNumber == breakPoint);
    return _breakPoint ? (_breakPoint.allow || _breakPoint.view) : false;
  }

  public userManagementBreakPoints(setupMenu: SetupMenu[]): SetupMenu[] {
    this.setupBreakPoints = this._servicesetting.breakpoints;
    setupMenu.find(sm => sm.id == "roleSetup").IsAuthorized = this.IsActionAllowed(SPAScheduleBreakPoint.UserRoleSetUp);
    setupMenu.find(sm => sm.id == "userSetup").IsAuthorized = this.IsActionAllowed(SPAScheduleBreakPoint.UserSetup);
    setupMenu.find(sm => sm.id == "userRole").IsAuthorized = this.IsActionAllowed(SPAScheduleBreakPoint.UserRoleConfiguration);
    return setupMenu;
  }

  accessCheckAndAlert(setupMenu: SetupMenu) {
    if (!setupMenu.IsAuthorized) {
      this.breakpoint.showBreakPointPopup(this.localization.captions.breakpoint[setupMenu.breakPointNumber]);
    }
  }



}
