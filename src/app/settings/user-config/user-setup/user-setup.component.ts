import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';
import { SubscriptionLike as ISubscription } from 'rxjs';
import { SettingsService } from '../../settings.service';
import { UserOutletAccessDataService } from '../useroutletaccess.data.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { Utilities } from 'src/app/core/utilities';
import { BaseResponse, HttpMethod } from 'src/app/common/Models/http.model';
import { Product } from 'src/app/common/Models/common.models';
import { GridType, Host, SPAScheduleBreakPoint } from 'src/app/common/shared/shared/globalsContant';
import { NewUserComponent } from '../new-user/new-user.component';
import { AsideFilterConfig,FilterGroup } from 'src/app/common/Models/ag-models';
@Component({
  standalone: false,
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
  tableData: any = [];
  products: any = [];
  roles: any = [];
  rolelst: any = [];
  usersInfo: any = [];
  configuration: AsideFilterConfig;

  IsReadOnly: boolean;
  hasAccess = true;
  dialogSubscription: ISubscription;

  FormGrp: UntypedFormGroup;
  searchValue = true;
  isADB2CConfigEnabled:boolean=false;
  filterGroups: FilterGroup[];
  tableDataCopy: any = [];
  constructor(private Form: UntypedFormBuilder, public localization: RetailStandaloneLocalization, private dialog: MatDialog,
              private servicesetting: SettingsService,
              private http: HttpServiceCall,
              private utils: Utilities, private BPoint: BreakPointAccess,
              private userOutletsService: UserOutletAccessDataService) {

  }

  ngOnInit() {
    this.servicesetting.tabLoaderEnable.next(false);
    this.captions = this.localization.captions.userConfig;
    this.FormGrp = this.Form.group({
      searchtext: '',
    });
    this.configuration = {
      filterText: this.localization.captions['lbl_filter'],
      resetText: this.localization.captions['lbl_reset'],
      displayCount: 3,
      isMultiSelect: true,
      viewMoreConfig: {
        apply: 'apply',
        cancel: 'cancel',
        alphabets: ['All',
          'A', 'B', 'C', 'D',
          'E', 'F', 'G', 'H',
          'I', 'J', 'K', 'L',
          'M', 'N', 'O', 'P',
          'Q', 'R', 'S', 'T',
          'U', 'V', 'W', 'X',
          'Y', 'Z'],
          searchByPlaceHolder: 'Search By'
      }
    };

    if (!this.BPoint.CheckForAccess([SPAScheduleBreakPoint.UserSetup])) {
      this.hasAccess = false;
      return;
    }

    this.IsReadOnly = this.BPoint.IsViewOnly(SPAScheduleBreakPoint.UserSetup);

    this.GetServiceCall('GetProductsByPropertyId', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetActiveUserRolesByPropertyId',
      { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')), includeInActive: false });
    // this.GetServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetRetailServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
    this.GetServiceCall('GetADB2CEnableConfig',{ tenantId: Number(this.utils.GetPropertyInfo('TenantId')) })
    this.filterGroups = [
      {
        id: 1,
        name: 'application',
        title: this.captions.Application,
        filters: []
      },
      {
        id: 2,
        name: 'userRole',
        title: this.captions.UserRole,
        filters: []
      },
      {
        id: 3,
        name: 'outlet',
        title: this.captions.Outlet,
        filters: []
      },
      {
        id: 4,
        name: 'blockStatus',
        title: this.captions.BlockStatus,
        filters: [
          { id: 1, name: this.captions.Blocked },
          { id: 2, name: this.captions.Unblocked }
        ]
      },
      {
        id: 5,
        name: 'activeStatus',
        title: this.captions.ActiveStatus,
        filters: [
          { id: 1, name: this.captions.Active },
          { id: 2, name: this.captions.Inactive }
        ]
      },
    ];
    
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
    { title: this.captions.Name, jsonkey: 'name', alignType: 'left', showStatus: true },
    { title: this.captions.Email, jsonkey: 'email', alignType: 'left' },
    { title: this.captions.ApplicationAllowed, jsonkey: 'applicationAllowed', alignType: 'left' },
    { title: this.captions.Roles, jsonkey: 'roles', alignType: 'left' },
    { title: this.captions.CreatedOn, jsonkey: 'createdOn', alignType: 'left', 'sortcolumn':'createdOn_Min' },
    { title: this.captions.LastAccessedOn, jsonkey: 'lastAccessedOn', alignType: 'left','sortcolumn':'lastAccessedOn_Min' }];
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
    }];
  }

  createUser(type) {
    let Dialogtitle;
    if (type == 'New') {
      this.ResetServiceAttributes();
      Dialogtitle = this.captions.NewUser;
    } else {
      Dialogtitle = this.captions.EditUser;
    }
    const DialogTemplate = 'NU';
    const dialogRef = this.dialog.open(NewUserComponent, {
      height: '80%',
      width: '1000px',
      data: { headername: Dialogtitle, closebool: true, templatename: DialogTemplate, datarecord: '', mode: type, isADB2CConfigEnabled: this.isADB2CConfigEnabled },
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
    this.onChange();
  }
  resetFilter() {
    this.filterChange();
  }

  filterChange(filterGroup?: FilterGroup) {
    let tableData = _.clone(this.tableDataCopy);

    // application filter
    var applicationFilter = this.filterGroups[0].filtered ? this.filterGroups[0].filtered : [];
    let names: string[] = applicationFilter.map(x => x.name);
    tableData = tableData.filter(x => {
      return names.length == 0 || names.some(a => x.applicationAllowed.indexOf(a) >= 0)
    });

    // userRole filter
    var userRoleFilter = this.filterGroups[1].filtered ? this.filterGroups[1].filtered : []
    let filteredRoles: string[] = userRoleFilter.map(x => x.name);
    tableData = tableData.filter(x => {
      return filteredRoles.length == 0 || filteredRoles.some(a => x.roles.indexOf(a) >= 0)
    });

    // outlet filter
    var outletFilter = this.filterGroups[2].filtered ? this.filterGroups[2].filtered : [];
    if (outletFilter.length > 0) {
      tableData = tableData.filter(x => {
        return _.some(x.allowedOutId, item => {
          return _.some(outletFilter, dataFilter => dataFilter.id === item);
        });
      });
    }
    // blockStatus filter
    var blockStatusFilter = this.filterGroups[3].filtered ? this.filterGroups[3].filtered : [];
    let blockStatus: boolean[] = blockStatusFilter.map(x => x.id == 1 ? true : false);
    tableData = tableData.filter(data => {
      return blockStatus.length == 0 || blockStatus.includes(data.isAccountBlocked);
    });

    //activeStatus filter
    var activeStatusFilter = this.filterGroups[4].filtered ? this.filterGroups[4].filtered : []
    let activeStatus: boolean[] = activeStatusFilter.map(x => x.id == 1 ? true : false);
    tableData = tableData.filter(x => activeStatus.length == 0 || activeStatus.includes(x.isActive));
    this.tableData = tableData ;
    this.bindTable(tableData);
  }
  async EditRecords(event) {
    const clientObj = this.usersInfo.filter(x => x.userId == event[0].id)[0];
    const userRetailConfig: any = await this.GetUserConfigAsync('GetUserRetailConfiguration', Host.retailManagement, event[0].id);

    const userData: any = {
      activeuser: clientObj.isActive,
      fname: clientObj.firstName,
      lname: clientObj.lastName,
      userid: clientObj.userName,
      quickid: clientObj.quickId,
      email: clientObj.email,
      language: clientObj.languageId,
      newpassword: clientObj.isNewUser,
      pwdexpirationdate: clientObj.passwordExpireDate ? this.utils.getDate(clientObj.passwordExpireDate) : '',
      autoUnlockAfterInMinutes:clientObj.autoUnlockAfterInMinutes?clientObj?.autoUnlockAfterInMinutes:0,
      loginType:clientObj.loginType?clientObj?.loginType:0
    };

    let spaData: any;
    let retailData: any;
    let retailOutletMap: any;
    clientObj.userPropertyAccesses = clientObj.userPropertyAccesses.filter(x =>
      x.propertyID === Number(this.utils.GetPropertyInfo('PropertyId'))
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
        };
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
        };
        retailOutletMap = clientObj.userPropertyAccesses[i].userSubPropertyAccess;
      }
    }
    this.servicesetting.userSettingsFormGrp.patchValue(userData);
    if (retailData) { this.servicesetting.retailSettingsFormGrp.patchValue(retailData); }
    this.servicesetting.editUserInfo = {
      clientInfo: clientObj,
      retainInfo: userRetailConfig,
      retailOutletMap,
      retailData:retailData
    };
    this.createUser('Edit');
  }

  async GetUserConfigAsync(callDesc, host, id) {
    const info = await this.http.CallApiAsync({
      host,
      uriParams: { id },
      callDesc,
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

  async successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): Promise<void> {
    if (callDesc == 'GetProductsByPropertyId') {
      if (result.result) {
        this.products = result.result;
        this.filterGroups[0].filters = this.products.map(x => ({ id: x.id, name: x.productName, value: false }));
      }
    } else if (callDesc == 'GetOutlets') {
      if (result.result) {
        this.servicesetting.propOutlets = result.result;
        this.filterGroups[2].filters = this.servicesetting.propOutlets.map(x =>
           ({ id: x.subPropertyID, name: x.subPropertyName}));
      }
    } else if (callDesc == 'GetActiveUserRolesByPropertyId') {
      if (result.result) {
        this.roles = this.rolelst = result.result;
        this.servicesetting.userRoles = this.roles;
        this.roles = this.roles.filter(x => x.productId.includes(Number(this.utils.GetPropertyInfo('ProductId'))));
        this.filterGroups[1].filters = this.servicesetting.userRoles.map(x =>
          ({ id: x.id, name: x.description}));
      }
    } else if (callDesc == 'GetAllUsers') {
      if (result.result) {
        this.usersInfo = result.result;
        let data = _.cloneDeep(result.result as any);
        if (data.length > 0) {
          data = await this.FillUserOutletsAccess(this.usersInfo);
          data = data.filter(u => u.userPropertyAccesses && u.userPropertyAccesses.some(a =>
             a.propertyID === Number(this.utils.GetPropertyInfo('PropertyId')) &&
             a.productId === Number(this.utils.GetPropertyInfo('ProductId'))));
          this.tableData = [];
          this.servicesetting.existingUserIds = [];
          this.servicesetting.existingQuickIds = [];
          for (let x = 0; x < data.length; x++) {
            const propertyAccess = data[x].userPropertyAccesses;
            let appAllowedNames;
            let appAllowedIds;
            let roleNames;
            let roleIds;
            let userblocked = false;
            const outletAllowedIds = [];
            if (propertyAccess && propertyAccess.length > 0) {
              appAllowedIds = propertyAccess.filter(prop => prop.propertyID == Number(this.utils.GetPropertyInfo('PropertyId')) && prop.hasAccess).map(y => y.productId);
              roleIds = propertyAccess.filter(z => z.propertyID == Number(this.utils.GetPropertyInfo('PropertyId'))).map(y => y.roleId);
              appAllowedNames = this.products.filter(y => appAllowedIds.includes(y.id)).map(z => z.productName).toString();
              roleNames = this.rolelst.filter(y => roleIds.includes(y.id)).map(z => z.description).toString();

              for (let y = 0; y < propertyAccess.length; y++) {
                const subPropAccess = propertyAccess[y].userSubPropertyAccess;
                let outIds;
                if (subPropAccess && subPropAccess.length > 0) {
                  outIds = subPropAccess.filter((x: { hasAccess: boolean; }) => x.hasAccess == true).map(z => z.subPropertyID);
                  outletAllowedIds.push(...outIds);
                }
              }
            }
            var retailProd = propertyAccess.find(x => x.propertyID === Number(this.utils.GetPropertyInfo('PropertyId')) && x.productId === Number(this.utils.GetPropertyInfo("ProductId")));
            userblocked = data[x].isLocked ? data[x].isLocked : (retailProd ? retailProd.accountBlocked : userblocked);
            const userInfo = {
              userId: (data[x].userName ? data[x].userName : '').toUpperCase(),
              name: data[x].firstName + ' ' + data[x].lastName,
              email: data[x].email,
              isActive: data[x].isActive,
              isAccountBlocked: propertyAccess && propertyAccess.length > 0 ? propertyAccess[0].accountBlocked : false,
              createdOn: data[x].createdOnLocalTimeZone ? `${this.localization.LocalizeDate(this.utils.getDate(data[x].createdOnLocalTimeZone))} | ${this.localization.LocalizeTime(this.utils.getDate(data[x].createdOnLocalTimeZone))}` : '',
              lastAccessedOn: data[x].lastAccessDateLocalTimeZone ? `${this.localization.LocalizeDate(this.utils.getDate(data[x].lastAccessDateLocalTimeZone))} | ${this.localization.LocalizeTime(this.utils.getDate(data[x].lastAccessDateLocalTimeZone))}` : '',
              createdOn_Min:data[x].createdOnLocalTimeZone ?new Date(this.localization.LocalizeDateTimeFormatDDMMMYYYY(this.utils.getDate(data[x].createdOnLocalTimeZone))).getTime():0,
              lastAccessedOn_Min :data[x].lastAccessDateLocalTimeZone ?new Date(this.localization.LocalizeDateTimeFormatDDMMMYYYY(this.utils.getDate(data[x].lastAccessDateLocalTimeZone))).getTime():0,
              applicationAllowed: appAllowedNames,
              roles: roleNames,
              allowedAppId: appAllowedIds,
              allowedOutId: outletAllowedIds,
              id: data[x].userId,
              blockedUser: userblocked,
              isRestrictuserBlock:this.IsReadOnly
            };

            this.tableData.push(userInfo);
            this.tableDataCopy = [...this.tableData];
            this.servicesetting.existingUserIds.push((data[x].userName ? data[x].userName : '').toUpperCase());
            if (data[x].quickId) {this.servicesetting.existingQuickIds.push(data[x].quickId); }
          }
        }
        this.bindTable(this.tableData);
        this.filterChange();
      }
    } else if (callDesc == 'GetAllServiceGrp') {
      if (result.result) {
        this.servicesetting.serviceGroups = result.result as any;
      }
    }
    else if (callDesc == 'BlockUserProfile') {
      if (result.result) {
        this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
      }
    }
    else if (callDesc == 'GetADB2CEnableConfig') {
      if (result.result) {
        this.isADB2CConfigEnabled =(Boolean)(result.result);
      }
    }
  }

  errorCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  }

  private async FillUserOutletsAccess(users: any) {
    const userOutlets = await this.userOutletsService.GetOutletsAccessByPropertyId();
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
    this.servicesetting.userSettingsFormGrp.reset();
    this.servicesetting.retailSettingsFormGrp.reset();
    this.servicesetting.editUserInfo={};
    this.servicesetting.selectedAccess = [];
    this.servicesetting.selectedOutlets = [];
  }

  BlockUserEdit(event)
  {
    let clientObj = this.usersInfo.filter(x => x.userId == event[0].id)[0];
    clientObj.userPropertyAccesses = clientObj.userPropertyAccesses.filter(x => x.propertyID === Number(this.utils.GetPropertyInfo('PropertyId'))
      && this.products.map(v => v.id).includes(x.productId));
      if (clientObj.userPropertyAccesses) {
        this.GetServiceCall('BlockUserProfile', { userId: event[0].id, accountBlocked: !event[0].blockedUser });
      }
  }
}
