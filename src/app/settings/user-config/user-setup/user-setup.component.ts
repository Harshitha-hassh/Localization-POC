import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Localization } from '../../../core/localization/Localization';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';
import * as _ from 'lodash';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { UserOutletAccessDataService } from '../useroutletaccess.data.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { GridType, Host, Product } from 'src/app/common/shared/shared/globalsContant';
import { popupConfig } from 'src/app/common/shared/shared.modal';
import { HttpMethod, BaseResponse } from 'src/app/common/Models/http.model';
import { Utilities } from 'src/app/core/utilities';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { SettingDialogPopupComponent } from 'src/app/retail/shared/setting-dialog-popup/setting-dialog-popup.component';

@Component({
  selector: 'app-user-setup',
  templateUrl: './user-setup.component.html',
  styleUrls: ['./user-setup.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [UserOutletAccessDataService]
})
export class UserSetupComponent implements OnInit, OnDestroy {

  captions: any;
  tableoptions: any[];
  searchText: any;
  searchFilter: any = [];
  Categories: any[];
  tableData: any = [];
  products: any = [];
  roles: any = [];
  rolelst: any = [];
  usersInfo: any = [];

  IsReadOnly: boolean;
  hasAccess: boolean = true;
  dialogSubscription: ISubscription;

  FormGrp: FormGroup;
  searchValue: boolean = true;

  constructor(private Form: FormBuilder, public localization: Localization, private dialog: MatDialog,
    private _servicesetting: SettingsService,
    private http: HttpServiceCall,
    private utils: Utilities, private BPoint: BreakPointAccess,
    private _userOutletsService: UserOutletAccessDataService) {

  }

  ngOnInit() {
    this._servicesetting.tabLoaderEnable.next(false);
    this.captions = this.localization.captions.userConfig;
    this.FormGrp = this.Form.group({
      searchtext: '',
    });

    // if (!this.BPoint.CheckForAccess([GlobalConst.SPAScheduleBreakPoint.UserSetup])) {
    //   this.hasAccess = false;
    //   return;
    // }
    // this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;

    this.GetServiceCall('GetProductsByPropertyId', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetActiveUserRolesByPropertyId', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')), includeInActive: false });
    // this.GetServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetRetailServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
    this.GetSPAServiceCall('GetAllServiceGrp');
    this.Categories = [
      {
        id: 1,
        name: 'outlet',
        title: this.captions.Outlet,
        filters: [],
        filtered: []
      },
      {
        id: 2,
        name: 'application',
        title: this.captions.Application,
        filters: [],
        filtered: []
      },
      {
        id: 3,
        name: 'blockStatus',
        title: this.captions.BlockStatus,
        filters: [{ id: 0, name: this.localization.captions.common.all, isAll: true },
        { id: 2, name: this.captions.Blocked, value: true },
        { id: 3, name: this.captions.Unblocked, value: false }],
        filtered: []
      },
      {
        id: 4,
        name: 'activeStatus',
        title: this.captions.ActiveStatus,
        filters: [{ id: 0, name: this.localization.captions.common.all, isAll: true },
        { id: 2, name: this.captions.Active, value: true },
        { id: 3, name: this.captions.Inactive, value: false }],
        filtered: []
      }
    ]

  }

  ngOnDestroy() {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  displayFn(searchVal: any) {
    if (searchVal) { return searchVal.value; }
  }

  bindTable(tableData) {
    const header = [{ title: this.captions.UserID, jsonkey: 'userId', alignType: 'left' },
    { title: this.captions.Name, jsonkey: 'name', alignType: 'left', "showStatus": true },
    { title: this.captions.Email, jsonkey: 'email', alignType: 'left' },
    { title: this.captions.ApplicationAllowed, jsonkey: 'applicationAllowed', alignType: 'left' },
    { title: this.captions.Roles, jsonkey: 'roles', alignType: 'left' },
    { title: this.captions.CreatedOn, jsonkey: 'createdOn', alignType: 'left' },
    { title: this.captions.LastAccessedOn, jsonkey: 'lastAccessedOn', alignType: 'left' }];
    this.tableoptions = [{
      TableHdrData: header,
      TablebodyData: tableData,
      EditMoreOption: false,
      Sortable: 'userId',
      SelectedSettingId: GridType.userSetup,
      CustomColumn: true,
      TableSearchText: this.FormGrp.value.searchtext,
      EnableActions: true,
      sticky: true,
      userAction: true,
      disableDelete: true,
      TableDraggable: false
    }]
  }

  createUser(type) {
    let Dialogtitle;
    if (type == 'New') {
      this.ResetServiceAttributes();
      Dialogtitle = this.captions.NewUser;
    } else {
      Dialogtitle = this.captions.EditUser;
    }

    let popupConfiguration: popupConfig;
    popupConfiguration = {
      operation: type
    }
    const DialogTemplate = 'NU';
    const dialogRef = this.dialog.open(SettingDialogPopupComponent, {
      height: '80%',
      width: '1000px',
      data: { headername: Dialogtitle, closebool: true, templatename: DialogTemplate, datarecord: '', popupConfig: popupConfiguration },
      panelClass: 'small-popup',
      disableClose: true,
      hasBackdrop: true
    });


    this.dialogSubscription = dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.ResetServiceAttributes();
        this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
      }
    });
  }

  onChange() {
    this.bindTable(this.tableData);
    this.searchValue = this.FormGrp.value.searchtext == '' ? true : false;
  }

  clearSearch() {
    this.FormGrp.controls.searchtext.setValue('');
    this.searchValue = true;
  }

  filterChange(arg) {
    let tableData = _.clone(this.tableData);
    _.forEach(arg, (filter) => {
      const appliedFilter = filter.filters.filter(r => filter.filtered.includes(r.id));
      if (filter.name == 'blockStatus' && appliedFilter.length > 0) {
        tableData = tableData.filter(data => {
          return _.some(appliedFilter, x => x.value === data.isAccountBlocked);
        });
      }
      if (filter.name == 'activeStatus' && appliedFilter.length > 0) {
        tableData = tableData.filter(data => {
          return _.some(appliedFilter, x => x.value === data.isActive);
        });
      }
      if (filter.name == 'application' && appliedFilter.length > 0) {
        tableData = _.filter(tableData, (data) => {
          return _.some(data.allowedAppId, item => {
            return _.some(appliedFilter, dataFilter => dataFilter.id === item);
          });
        });
      }
      if (filter.name == 'outlet' && appliedFilter.length > 0) {
        tableData = _.filter(tableData, (data) => {
          return _.some(data.allowedOutId, item => {
            return _.some(appliedFilter, dataFilter => dataFilter.id === item);
          });
        });
      }
    });
    this.bindTable(tableData);
  }

  async EditRecords(event) {
    const clientObj = this.usersInfo.filter(x => x.userId == event[0].id)[0];
    const userRetailConfig: any = await this.GetUserConfigAsync('GetUserRetailConfiguration', Host.retailManagement, event[0].id)

    const userData: any = {
      activeuser: clientObj.isActive,
      fname: clientObj.firstName,
      lname: clientObj.lastName,
      userid: clientObj.userName,
      quickid: clientObj.quickId,
      email: clientObj.email,
      language: clientObj.languageId,
      newpassword: clientObj.isNewUser,
      pwdexpirationdate: clientObj.passwordExpireDate ? this.utils.getDate(clientObj.passwordExpireDate) : ''
    };

    let spaData: any;
    let retailData: any;
    let retailOutletMap: any;
    clientObj.userPropertyAccesses = clientObj.userPropertyAccesses.filter(x => x.propertyID === Number(this.utils.GetPropertyInfo('PropertyId'))
      && this.products.map(v => v.id).includes(x.productId));
    for (let i = 0; i < clientObj.userPropertyAccesses.length; i++) {
      const prodId = clientObj.userPropertyAccesses[i].productId;
      const prodName = this.products.filter(x => x.id == prodId)[0].productName.replace(/ /g, '');
      if (prodName.toUpperCase() == 'SPA') {
        spaData = {
          rolename: clientObj.userPropertyAccesses[i].roleId,
          accountblocked: clientObj.userPropertyAccesses[i].accountBlocked,
          autologoff: clientObj.userPropertyAccesses[i].autoLogOff,
          logoffafter: clientObj.userPropertyAccesses[i].logOffAfter,
        }
      } else if (prodName.toUpperCase() == 'RETAIL') {
        retailData = {
          rolename: clientObj.userPropertyAccesses[i].roleId,
          accountblocked: clientObj.userPropertyAccesses[i].accountBlocked,
          autologoff: clientObj.userPropertyAccesses[i].autoLogOff,
          logoffafter: clientObj.userPropertyAccesses[i].logOffAfter,
          allowgratuity: userRetailConfig ? userRetailConfig.allowGratuity : false,
          allowservicecharge: userRetailConfig ? userRetailConfig.allowServiceCharge : false,
          allowcommission: userRetailConfig ? userRetailConfig.allowCommission : false,
          commissionclass: userRetailConfig ? userRetailConfig.commissionClass : false
        }
        retailOutletMap = clientObj.userPropertyAccesses[i].userSubPropertyAccess;
      }
    }
    this._servicesetting.userSettingsFormGrp.patchValue(userData);
    retailData ? this._servicesetting.retailSettingsFormGrp.patchValue(retailData) : '';
    this._servicesetting.editUserInfo = {
      clientInfo: clientObj,
      retainInfo: userRetailConfig,
      retailOutletMap: retailOutletMap
    };
    this.createUser('Edit');
  }

  async GetUserConfigAsync(callDesc, host, id) {
    const info = await this.http.CallApiAsync({
      host: host,
      uriParams: { id: id },
      callDesc: callDesc,
      method: HttpMethod.Get
    });
    return info ? info.result : null;
  }

  GetServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  GetRetailServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.retailManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }


  GetSPAServiceCall(Route, Uri?) {
    this.http.CallApiWithCallback<any>({
      host: Host.spaManagement,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: Route,
      uriParams: Uri,
      method: HttpMethod.Get,
      showError: true,
      extraParams: []
    });
  }

  async successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): Promise<void> {
    if (callDesc == 'GetProductsByPropertyId') {
      if (result.result) {
        this.products = result.result;
        this.Categories[1].filters = this.products.map(x => { return { id: x.id, name: x.productName, value: false } })
      }
    } else if (callDesc == 'GetOutlets') {
      if (result.result) {
        this._servicesetting.propOutlets = result.result;
        this.Categories[0].filters = this._servicesetting.propOutlets.map(x => { return { id: x.subPropertyID, name: x.subPropertyName, value: false } })
      }
    } else if (callDesc == 'GetActiveUserRolesByPropertyId') {
      if (result.result) {
        this.roles = this.rolelst = result.result;
        this._servicesetting.userRoles = this.roles;
        this.roles = this.roles.filter(x => x.productId.includes(Number(this.utils.GetPropertyInfo('ProductId'))));
      }
    } else if (callDesc == 'GetAllUsers') {
      if (result.result) {
        this.usersInfo = result.result;
        let data = _.cloneDeep(result.result as any);
        if (data.length > 0) {
          data = await this.FillUserOutletsAccess(this.usersInfo);
          data = data.filter(u => u.userPropertyAccesses && u.userPropertyAccesses.some(a => a.propertyID === Number(this.utils.GetPropertyInfo('PropertyId')) && a.productId === Number(this.utils.GetPropertyInfo("ProductId"))));
          this.tableData = [];
          this._servicesetting.existingUserIds = [];
          this._servicesetting.existingQuickIds = [];
          for (let x = 0; x < data.length; x++) {
            const propertyAccess = data[x].userPropertyAccesses;
            let appAllowedNames, appAllowedIds, roleNames, roleIds;
            const outletAllowedIds = [];
            if (propertyAccess && propertyAccess.length > 0) {
              appAllowedIds = propertyAccess.filter(x => x.hasAccess).map(y => y.productId);
              roleIds = propertyAccess.filter(z => z.propertyID == Number(this.utils.GetPropertyInfo('PropertyId')) && (z.productId === Product.RETAIL)).map(y => y.roleId);
              appAllowedNames = this.products.filter(y => appAllowedIds.includes(y.id)).map(z => z.productName).toString();
              roleNames = this.rolelst.filter(y => roleIds.includes(y.id)).map(z => z.description).toString();

              for (let y = 0; y < propertyAccess.length; y++) {
                const subPropAccess = propertyAccess[y].userSubPropertyAccess;
                let outIds;
                if (subPropAccess && subPropAccess.length > 0) {
                  outIds = subPropAccess.filter(x => x.hasAccess == true).map(z => z.subPropertyID);
                  outletAllowedIds.push(...outIds);
                }
              }
            }
            const userInfo = {
              userId: (data[x].userName ? data[x].userName : '').toUpperCase(),
              name: data[x].firstName + ' ' + data[x].lastName,
              email: data[x].email,
              isActive: data[x].isActive,
              isAccountBlocked: propertyAccess && propertyAccess.length > 0 ? propertyAccess[0].accountBlocked : false,
              createdOn: data[x].createdOn ? `${this.localization.LocalizeDate(this.utils.getDate(data[x].createdOn))} | ${this.localization.LocalizeTime(this.utils.getDate(data[x].createdOn))}` : '',
              lastAccessedOn: data[x].lastAccessDate ? `${this.localization.LocalizeDate(this.utils.getDate(data[x].lastAccessDate))} | ${this.localization.LocalizeTime(this.utils.getDate(data[x].lastAccessDate))}` : '',
              applicationAllowed: appAllowedNames,
              roles: roleNames,
              allowedAppId: appAllowedIds,
              allowedOutId: outletAllowedIds,
              id: data[x].userId
            }

            this.tableData.push(userInfo);
            this._servicesetting.existingUserIds.push((data[x].userName ? data[x].userName : '').toUpperCase());
            data[x].quickId ? this._servicesetting.existingQuickIds.push(data[x].quickId) : '';
          }
        }
        this.bindTable(this.tableData);
      }
    } else if (callDesc == 'GetAllServiceGrp') {
      if (result.result) {
        this._servicesetting.serviceGroups = result.result
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  private async FillUserOutletsAccess(users: any) {
    var userOutlets = await this._userOutletsService.GetOutletsAccessByPropertyId();
    users.map(u => {
      const userAccessOutlets = userOutlets && userOutlets.length > 0 ? userOutlets.filter(r => r.userID == u.userId) : [];
      u.userPropertyAccesses.map(p => {
        if (p.productId == Product.RETAIL) {
          p.userSubPropertyAccess = userAccessOutlets;
        } else {
          p.userSubPropertyAccess = [];
        }
      });
    });
    return users;
  }

  ResetServiceAttributes() {
    this._servicesetting.userSettingsFormGrp.reset();
    this._servicesetting.retailSettingsFormGrp.reset();
    this._servicesetting.selectedAccess = [];
    this._servicesetting.selectedServiceGrp = [];
    this._servicesetting.selectedOutlets = [];
  }
}
