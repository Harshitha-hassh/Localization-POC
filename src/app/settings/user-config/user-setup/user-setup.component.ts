import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
import { FormGroup, FormBuilder } from '@angular/forms';
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
import { GridType, Host } from 'src/app/common/shared/shared/globalsContant';
import { NewUserComponent } from '../new-user/new-user.component';
import { AsideFilterConfig } from 'src/app/common/Models/ag-models';

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
  configuration: AsideFilterConfig;

  IsReadOnly: boolean;
  hasAccess = true;
  dialogSubscription: ISubscription;

  FormGrp: FormGroup;
  searchValue = true;

  constructor(private Form: FormBuilder, public localization: RetailStandaloneLocalization, private dialog: MatDialog,
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
        searchByPlaceHolder: this.localization.captions['lbl_searchByOutlet']
      }
    };

    // if (!this.BPoint.CheckForAccess([GlobalConst.SPAScheduleBreakPoint.UserSetup])) {
    //   this.hasAccess = false;
    //   return;
    // }
    // this.IsReadOnly = this._servicesetting.breakpoints.find(bp => bp.breakPointNumber == GlobalConst.SPAScheduleBreakPoint.UserSetup).view;

    this.GetServiceCall('GetProductsByPropertyId', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetActiveUserRolesByPropertyId',
      { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')), includeInActive: false });
    // this.GetServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetRetailServiceCall('GetOutlets', { propertyId: Number(this.utils.GetPropertyInfo('PropertyId')) });
    this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
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
      data: { headername: Dialogtitle, closebool: true, templatename: DialogTemplate, datarecord: '', mode: type },
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
      pwdexpirationdate: clientObj.passwordExpireDate ? this.utils.getDate(clientObj.passwordExpireDate) : ''
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
      retailOutletMap
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
        this.Categories[1].filters = this.products.map(x => ({ id: x.id, name: x.productName, value: false }));
      }
    } else if (callDesc == 'GetOutlets') {
      if (result.result) {
        this.servicesetting.propOutlets = result.result;
        this.Categories[0].filters = this.servicesetting.propOutlets.map(x =>
           ({ id: x.subPropertyID, name: x.subPropertyName, value: false }));
      }
    } else if (callDesc == 'GetActiveUserRolesByPropertyId') {
      if (result.result) {
        this.roles = this.rolelst = result.result;
        this.servicesetting.userRoles = this.roles;
        this.roles = this.roles.filter(x => x.productId.includes(Number(this.utils.GetPropertyInfo('ProductId'))));
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
              applicationAllowed: appAllowedNames,
              roles: roleNames,
              allowedAppId: appAllowedIds,
              allowedOutId: outletAllowedIds,
              id: data[x].userId,
              blockedUser: userblocked,
              isRestrictuserBlock:this.hasAccess
            };

            this.tableData.push(userInfo);
            this.servicesetting.existingUserIds.push((data[x].userName ? data[x].userName : '').toUpperCase());
            if (data[x].quickId) {this.servicesetting.existingQuickIds.push(data[x].quickId); }
          }
        }
        this.bindTable(this.tableData);
      }
    } else if (callDesc == 'GetAllServiceGrp') {
      if (result.result) {
        this.servicesetting.serviceGroups = result.result as any;
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
        this.GetServiceCall('GetAllUsers', { tenantId: Number(this.utils.GetPropertyInfo('TenantId')) });
      }
  }
}
