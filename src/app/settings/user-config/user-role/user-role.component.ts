import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { SettingsService } from '../../settings.service';
import { MatDialog } from '@angular/material';
import { Localization } from '../../../core/localization/Localization';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { PropertyInformation } from '../../../core/services/property-information.service';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { HttpMethod } from 'src/app/shared/models/http.model';
import { BaseResponse } from 'src/app/common/Models/http.model';
import { CommonAlertMessagePopupComponent } from 'src/app/common/shared/shared/alert-message-popup/alert-message-popup.component';
import { Utilities } from 'src/app/core/utilities';
import { Host } from 'src/app/common/shared/shared/globalsContant';
import { Product } from 'src/app/common/Models/common.models';
import { CopyRolesComponent } from '../copy-roles/copy-roles.component';

@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UserRoleComponent implements OnInit, OnDestroy {
  arrayData: any;
  selectedOption: any;
  userRoleConfiguration: any = [];
  captions: any = this.localization.captions.userConfig;
  availableOptions: any = [{ id: 1, name: 'System Administrator' }]
  hasAccess = true;
  IsReadOnly: boolean;
  dialogSubscription: ISubscription;;


  constructor(public _settingService: SettingsService, private http: HttpServiceCall, private dialog: MatDialog,
    private localization: Localization, private BPoint: BreakPointAccess, private utils: Utilities, private PropInfo: PropertyInformation,private ss: SettingsService) {

  }

  ngOnInit() {
    // if (!this.BPoint.CheckForAccess([GlobalConst.SPAScheduleBreakPoint.UserRoleConfiguration])) {
    //   this.hasAccess = false;
    //   return;
    // }
    // this.IsReadOnly = this.BPoint.GetBreakPoint([GlobalConst.SPAScheduleBreakPoint.UserRoleConfiguration]).result[0].view;
    // if (!this.IsReadOnly) {
    //   this.hasAccess = true;
    // }
    this.getUserRoles();
    this.ss.tabLoaderEnable.next(false);
  }

  async getArrayData() {
    this._settingService.changedBreakPoints = [];
    let result: any;
    result = [{
      headerData: {
        titleData: this.localization.captions.userConfig.SecurityCategories,//"Security Categories",
        titledesc: this.localization.captions.userConfig.Selected,//"Selected ",
        details: this.userRoleConfiguration
      }
    }];
    this.arrayData = result ? result : [];
    this._settingService.roleConfiguration = this.arrayData;
  }

  openDialog() {
    const dialogRef = this.dialog.open(CopyRolesComponent, {
      width: '850px',
      height: '230px',
      data: { headername: this.captions.copyRoles, closebool: true, templatename: 'Fdf', datarecord: '', popupConfig: '' },
      panelClass: 'small-popup',
      disableClose: true,
      hasBackdrop: true
    });
    this.dialogSubscription = dialogRef.afterClosed().subscribe(s => { this.getuserConfig(this.selectedOption); });
  }

  ngOnDestroy() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  Save() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'UpdateUserRoles',
      method: HttpMethod.Put,
      body: this._settingService.changedBreakPoints,
      showError: true,
      extraParams: [false]
    });
  }

  getUserRoles() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetActiveUserRolesByPropertyId',
      method: HttpMethod.Get,
      uriParams: { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) , includeInActive : false },
      showError: true,
      extraParams: [false]
    });
    // return this.userRoles;
  }

  getuserConfig(roleId: number): any {
    //return this.httpCall.get(this.searchPath).map(response => response.json());
    // this.userRoleConfiguration = this.httpCall.get(this.searchPath).map(response => response.json());
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetUserRoleConfiguration',
      method: HttpMethod.Get,
      uriParams: { userRoleId: roleId },
      showError: true,
      extraParams: [false]
    });
  }

  LoadUserConfig() {
    if (!this.hasAccess) {
      return;
    }
    this.getuserConfig(this.selectedOption);
  }

  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'GetActiveUserRolesByPropertyId') {
      this.availableOptions = result.result ? result.result : [];
      this.availableOptions = this.availableOptions.filter(x => x.productId.includes(Number(this.utils.GetPropertyInfo('ProductId'))));
      this.selectedOption = this.availableOptions[0].id;
      this.getuserConfig(this.selectedOption);
    } else if (callDesc == 'GetUserRoleConfiguration') {
      this.userRoleConfiguration = result.result ? result.result : [];
      if (this.userRoleConfiguration != null) {
        this.userRoleConfiguration = this.userRoleConfiguration.filter(r => [Product.RETAIL, Product.COMMON].includes(r.productId));
        if (this.PropInfo.UseRetailInterface) {
          this.RemoveBreakPoints();
        }
      }
      this.getArrayData();
    } else if (callDesc == 'UpdateUserRoles') {
      this._settingService.roleConfiguration = [];
      const dialogRef = this.dialog.open(CommonAlertMessagePopupComponent, {
        width: '305px',
        height: '300px',
        hasBackdrop: true,
        panelClass: 'small-popup',
        data: { headername: this.captions.wellDone, headerIcon: 'icon-success-icon', headerMessage: this.captions.configSaveSuccessFrom, buttonName: this.captions.okay, type: 'message' },
        disableClose: true
      });
      dialogRef.afterClosed().subscribe(result => {
        this.getuserConfig(this.selectedOption);
    });
    }
  }

  errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  RemoveBreakPoints() {
    // this.userRoleConfiguration.forEach((claims, index) => {
    //   if (this.userRoleConfiguration[index].userClaims.length > 0)
    //     this.userRoleConfiguration[index].userClaims = this.userRoleConfiguration[index].userClaims.filter(claims => {
    //       return claims.breakPointNumber != RetailBreakPoint.Taxconfiguration &&
    //         claims.breakPointNumber != RetailBreakPoint.DiscountConfiguration &&
    //         claims.breakPointNumber != RetailBreakPoint.DiscountType &&
    //         claims.breakPointNumber != RetailBreakPoint.PaymentMethods
    //     });
    // });
  }
}
