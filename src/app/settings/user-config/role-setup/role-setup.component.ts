import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import * as myGlobals from '../../../shared/globalsContant'; //CONSTANT FILE ADD ANY CONSTANT VALUE
// import { HttpServiceCall, HttpMethod } from '../../../shared/service/http-call.service';
import { RetailStandaloneLocalization } from '../../../core/localization/retailStandalone-localization';
// import { Host, GridType, ButtonType } from '../../../shared/globalsContant';
// import { BreakPointAccess } from '../../../shared/service/breakpoint.service';
// import * as GlobalConst from '../../../shared/globalsContant';
// import { Utilities } from '../../../shared/utilities/utilities';
// import { BaseResponse, Role, RoleSetup } from '../../../shared/business/shared.modals';
import { SettingsService } from '../../settings.service';
import { Role } from 'src/app/retail/shared/business/shared.modals';
import { RoleSetup } from './role.model';
import { HttpServiceCall } from 'src/app/common/shared/shared/service/http-call.service';
import { BreakPointAccess } from 'src/app/common/shared/shared/service/breakpoint.service';
import { Utilities } from 'src/app/core/utilities';
import { Product } from 'src/app/retail/shared/globalsContant';
import { BaseResponse } from 'src/app/common/shared/shared.modal';
import { HttpMethod } from 'src/app/common/Models/http.model';
import { Host, GridType } from 'src/app/common/shared/shared/globalsContant';

@Component({
  standalone: false,
  selector: 'app-role-setup',
  templateUrl: './role-setup.component.html',
  styleUrls: ['./role-setup.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RoleSetupComponent implements OnInit {
  tableoptions: any[];
  captions: any;
  private result: any = [];
  type: any;
  currIndex: any;
  tableData: any = [];

  IsReadOnly = false;
  hasAccess = true;
  checked = false;

  private PropertyId: number;
  private TeantId: number;
  private indexToBeDeleted: number;
  private ProductId: number;
  private ProductIdlst: number[] = [];

  Roles: Role[] = [];
  private roleToBeCreated: RoleSetup;
  initialLoads = true;
  callCounter = 0;

  constructor(private http: HttpServiceCall, public localization: RetailStandaloneLocalization,
              private BPoint: BreakPointAccess, private utils: Utilities, private ss: SettingsService) {
  }

  ngOnInit() {
    this.captions = this.localization.captions.retailsetup;
    // if (!this.BPoint.CheckForAccess([GlobalConst.SPAScheduleBreakPoint.UserRoleSetUp])) {
    //   this.hasAccess = false;
    //   return;
    // }
    this.PropertyId = +this.utils.GetPropertyInfo('PropertyId');
    this.TeantId = +this.utils.GetPropertyInfo('TenantId');
    this.ProductId = +this.utils.GetPropertyInfo('ProductId');
    this.ProductIdlst.push(this.ProductId ? this.ProductId : 1);
    this.ProductIdlst.push(Product.RETAIL);
    // this.IsReadOnly = this.BPoint.GetBreakPoint([GlobalConst.SPAScheduleBreakPoint.UserRoleSetUp]).result[0].view;
    this.LoadUserRoles();
    [this.initialLoads, this.callCounter] = this.ss.updateInitalLoads(false, this.initialLoads, this.callCounter);
    this.BindToGrid();
  }

  editEvt(event) {
  }

  dragDrop(event: any) {
  }

  afterEditPopupClose(event: any) {
  }

  Done(event: any) {
    this.UpdateUserRole(event);
  }

  CheckUserRoleExist(name) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'CheckUserRoleExist',
      method: HttpMethod.Get,
      uriParams: { tenantId: this.utils.GetPropertyInfo('PropertyId'), roleName: encodeURIComponent(name) },
      showError: true,
      extraParams: [false]
    });
  }

  addOutlet(data?: any, event?: any) {
    if (data.value.controls.roleName.value.trim() === '') {
      this.utils.showError(this.localization.captions.setting.RoleNameErr);
      return;
    }
    if (data.type.toLowerCase() === this.localization.captions.setting.Add.toLowerCase()) {

      this.roleToBeCreated = {
        active: true,
        description: data.value.controls.roleName.value.trim(),
        propertyId: this.PropertyId,
        TenantId: this.TeantId,
        productId: this.ProductIdlst
      };
      this.CheckUserRoleExist(data.value.controls.roleName.value.trim());

    } else if (data.type.toLowerCase() === this.localization.captions.setting.update.toLowerCase()) {
      const roleSetup: RoleSetup = {
        id: this.tableoptions[0].TablebodyData[this.currIndex].id,
        description: data.value.controls.roleName.value,
        active: this.tableoptions[0].TablebodyData[this.currIndex].isActive,
        TenantId: this.TeantId,
        productId: this.tableoptions[0].TablebodyData[this.currIndex].productId
      };
      console.log(this.tableoptions[0].TablebodyData[this.currIndex]);
      // this.InvokeServiceCall("RoleWithId", Host.retailManagement, HttpMethod.Put, { id: Role.id }, Role);

      const UpdatedDataIndex = this.result.findIndex(result => result.id == roleSetup.id);
      roleSetup.active = data.value.controls.activetoggle.value;
      this.result[UpdatedDataIndex] = roleSetup;
      roleSetup.propertyId = this.PropertyId;
      this.UpdateUserRole(roleSetup);
    }
    return true;
  }

  EditRecords(data: any) {
    this.currIndex = this.tableoptions[0].TablebodyData.findIndex(item => item.id == data[0].id);
  }

  DeleteRecords(event: any) {
    const currIndex = this.tableoptions[0].TablebodyData.findIndex(item => item.id == event[0].id);
    const uriParam = { id: event[0].id };
    // call
    this.AnyAsscociatedUser(event[0].id);
    this.indexToBeDeleted = currIndex;
    // this.DeleteUserRole(this.tableData[currIndex]);
  }
  AnyAsscociatedUser(id: number) {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetUserCountsByRoleId',
      method: HttpMethod.Get,
      uriParams: { RoleId: id },
      showError: true,
      extraParams: [false]
    });
  }

  sliderChange(event: any) {
    if (event.data) {
      const body: Role = event.data;
      body.active = !event.value;
      const uriParam = { id: body.id };
      // this.InvokeServiceCall("RoleWithId", Host.retailManagement, HttpMethod.Put, uriParam, body);
    }
    this.checked = event.value;
    this.PopulateData();
  }

  inactiveSliderChange(event: any) {
  }


  PopulateData() {
    if (this.result && this.result.length > 0) {
      this.result = this.result.filter(role => role.productId.find(x => x === this.ProductId));
    }
    if (this.checked) {
      this.tableData = this.result;
    } else if (!this.checked) {
      this.tableData = this.result.filter(res => res.active);
    }
    this.BindToGrid();
  }

  InvokeServiceCall(route: string, domain: Host, callType: HttpMethod, uriParams?: any, body?: any, extraParams?: any) {
    this.http.CallApiWithCallback<any>({
      host: domain,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: route,
      method: callType,
      body,
      showError: true,
      extraParams,
      uriParams
    });
  }

  LoadUserRoles() {
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'GetUserRoleByPropertyId',
      method: HttpMethod.Get,
      uriParams: { propertyId: this.PropertyId },
      showError: true,
      extraParams: [false]
    });
  }

  CreateUserRole(roleSetup: RoleSetup) {
    let header: any;
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'CreateUserRole',
      method: HttpMethod.Post,
      header,
      body: roleSetup,
      showError: true,
      extraParams: []
    });
  }

  UpdateUserRole(roleSetup: RoleSetup) {
    let header: any;
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'UpdateUserRole',
      method: HttpMethod.Put,
      header,
      body: [roleSetup],
      showError: true,
      extraParams: []
    });
  }

  DeleteUserRole(roleSetup: RoleSetup) {
    let header: any;
    this.http.CallApiWithCallback<any>({
      host: Host.authentication,
      success: this.successCallback.bind(this),
      error: this.errorCallback.bind(this),
      callDesc: 'DeleteUserRole',
      method: HttpMethod.Delete,
      header,
      body: roleSetup,
      showError: true,
      extraParams: []
    });
  }


  successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'Role' || callDesc == 'RoleWithId') {
      this.Roles = result.result as any;
      this.PopulateData();
    } else if (['GetUserRoleByPropertyId'].includes(callDesc)) {
      [this.initialLoads, this.callCounter] = this.ss.updateInitalLoads(true, this.initialLoads, this.callCounter);
      this.tableData = result.result ? result.result : [];
      this.result = this.tableData;
      this.PopulateData();
    } else if (['UpdateUserRole'].includes(callDesc)) {

      if (result.result) {
        this.LoadUserRoles();
        this.PopulateData();
      } else {
        this.utils.showError(`${this.localization.captions.common.RoleNameInUseDeActivateNotAllowed}`);
        this.LoadUserRoles();
        this.PopulateData();
      }

    } else if (['CreateUserRole'].includes(callDesc)) {
      this.LoadUserRoles();
      this.PopulateData();
    } else if (['DeleteUserRole'].includes(callDesc)) {
      this.LoadUserRoles();
      this.PopulateData();
    } else if (['GetUserCountsByRoleId'].includes(callDesc)) {
      if (result && !result.result) {
        this.DeleteUserRole(this.tableData[this.indexToBeDeleted]);
      } else {
        this.utils.showError(`${this.localization.captions.common.RoleNameInUseDeleteNotAllowed}`);
      }
    } else if (['CheckUserRoleExist'].includes(callDesc)) {
      if (result && !result.result) {
        this.CreateUserRole(this.roleToBeCreated);
      } else {
        this.utils.showError(`${this.localization.captions.common.RoleNameAlreadyExists}`);
      }
    }
  }
  errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
    if (callDesc == 'UpdateUserRole') {
    } else if (['CreateUserRole'].includes(callDesc)) {
    } else if (['DeleteUserRole'].includes(callDesc)) {
    } else if (callDesc == 'GetAllUserRole') {
      [this.initialLoads, this.callCounter] = this.ss.updateInitalLoads(true, this.initialLoads, this.callCounter);
    }
  }

  private BindToGrid() {
    this.tableoptions = [
      {
        TableHdrData: [{ title: this.captions.RoleName, jsonkey: 'description', sortable: true },
        { title: this.captions.Active, jsonkey: 'active', type: 'toggle', sortable: false }],
        TablebodyData: this.tableData,
        pagination: false,
        CustomColumn: true,
        PlaceHoldertext: this.captions.Search,
        EnableActions: true,
        SelectRows: false,
        IsCommission: true,
        Searchable: false,
        EditMoreOption: false,
        SelectedSettingId: GridType.roleSetup,
        TableId: GridType.roleSetup,
        disableDelete: false,
        customHeader: true,
        pageTitle: 'roleSetup',
        ServiceId: 'roleSetup',
        InactiveRoles: true,
        DoneCancel: true,
        Sortable: 'description',
        TableDraggable: false
      }
    ];
  }
}
