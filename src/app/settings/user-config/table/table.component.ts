import { Component, OnInit, Input, ElementRef, ViewEncapsulation, Output, EventEmitter, ViewChild, AfterViewInit, ChangeDetectorRef, OnDestroy, HostListener } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
// import * as myGlobals from '../globalsContant'; //CONSTANT FILE ADD ANY CONSTANT VALUE
import { MatDialog } from '@angular/material';
import { fromEvent, merge, ReplaySubject } from 'rxjs';
import { MatMenuTrigger } from '@angular/material';
import * as _ from 'lodash';
// import { Localization } from '../../core/localization/Localization';
// import { UserAlerts } from '../../core/config/alerts-config';
// import { Utilities } from '../utilities/utilities';
// import { AlertMessagePopupComponent } from '../../shared/alert-message-popup/alert-message-popup.component';
// import { CustomCurrencyPipe } from '../../core/localization/currency.pipe';
// import { LocalizeDatePipe } from '../../core/localization/localize-date.pipe';
// import { LoadDecimalValuePipe } from '../pipes/load-decimal-value.pipe';
import { element } from 'protractor';
import { takeUntil } from 'rxjs/operators';
import { UserAlerts } from 'src/app/common/shared/config/alerts-config';
import { CustomCurrencyPipe } from 'src/app/common/shared/localization/currency.pipe';
import { GridType } from 'src/app/retail/shared/globalsContant';
import { RetailTransactions, PromptType } from 'src/app/common/shared/shared/globalsContant';
import { Localization } from 'src/app/core/localization/Localization';
import { Utilities } from 'src/app/core/utilities';
import { LoadDecimalValuePipe } from 'src/app/common/shared/shared/pipes/load-decimal-value.pipe';
import { CommonAlertMessagePopupComponent } from 'src/app/common/shared/shared/alert-message-popup/alert-message-popup.component';
import { LocalizeDatePipe } from 'src/app/common/shared/localization/localize-date.pipe';
// declare var require: any
// require('rxjs').fromEvent = fromEvent
// require('rxjs').merge = merge
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  //changeDetection:ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, AfterViewInit, OnDestroy {
  RadiobuttonOption = false;
  sortableHeader: any;
  maxCol: number;
  HighlightRow = false;
  SelectRow = false;
  commissionTableOptions = false;
  SelectedData: any = [];
  sortingColoumn: any;
  setinterscroll: any;
  checkAll = false;
  editEvent: any;
  enableToggleButton = false;
  IfBooleanCheck = false;
  SetColumnGridValue = false;
  CheckInnerBoolValue = false;
  enableRowCheck = false;
  inActiveTherapist: FormControl;
  inActiveService: FormControl;
  public indeterminate: any;
  isDataLoading = false;
  @Input() options;
  @Input() isRoleSetUpReadOnly;
  @Output() afterEditClose: EventEmitter<any> = new EventEmitter();
  @Output() dragDropEvt: EventEmitter<any> = new EventEmitter();
  @Output() deleteEvt: EventEmitter<any> = new EventEmitter();
  @Output() editEvt: EventEmitter<any> = new EventEmitter();
  @Output() InActiveTherapistEvt: EventEmitter<any> = new EventEmitter();
  @Output() RowSelectEmitter: EventEmitter<any> = new EventEmitter();
  @Output() userActionEvt: EventEmitter<any> = new EventEmitter();
  @Output() CurrentRowSelectedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() toggleEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() addClick: EventEmitter<any> = new EventEmitter();
  @Output() printEvt: EventEmitter<any> = new EventEmitter();
  @Output() inactiveToggleEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() doneEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() LBLClickEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() radioClickEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() openWaitlist: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;
  @ViewChild('tableInput', { static: false }) tableInput: ElementRef;
  IsViewOnly = false;
  IsAccessAllowed = false;
  IsCheckAll: Boolean = false;
  InActiveTherapistChkBoxEvt: any;
  orderTypearr: any = [];
  orderType: any = 'asc';
  currentIndex: any;
  hdrArray: any = [];
  bodyArray: any = [];
  selectedDefaultHeader: any;
  searchText: any;
  hdrkeyArray: any = [];
  originalHdrKeyArray: any = [];
  PlaceHoldertext: string;
  EnableActions: boolean;
  currentPage: any = 1;
  EnablePagination = true;
  InactiveTherapists = false;
  ChkInactiveService = false;
  InactiveRoles = false;
  SelectedSettingId = 1;
  blnDraggable = true;
  remailLength: any = [];
  Sortable: any;
  highlight: any;
  NewerData: any;
  previousSelectedColumn: any;
  givenOrderType: any;
  EditMoreOption: any;
  SelectOnlyRow = false;
  defaulSortColumn: any;
  overriddenSortColumn: string;
  sortColumnDataType: string;
  tableId: any;
  editable = true;
  waitlistIcon = false;
  deletable = true;
  deleteIcon = true;
  customHeader = false;
  pageTitle: string;
  customeHeaderOptions: any = [];
  quicksale: FormGroup;
  customHeaderButton: string;
  dropdownOptions: any = [];
  captions: any = {};
  sticky = false;
  table: FormGroup;
  ArrayList = [];
  disableDelete: any;
  showToggle: any;
  toggleDisplayText: any;
  roleSetup: FormGroup;
  SearchKeyArr: any;
  DoneCancel = false;
  viewCheckedFlag = false;
  userAction = false;
  IsRetailCodeSetup: boolean;
  disableEditButton: boolean; //this boolean will prevent certain screens to show Edit button during view only break point applied.
  isValidRoleName = false;
  isEdit: boolean;
  editableRow: any;
  selectedrowId: number;
  tempTableData: any;
  editRecordsArray: any = [];
  activeIndex: any;
  isEditOptionRemove = false;
  isReadOnly = false;
  IsMoreOptionReadOnly = false;
  $destroyed: ReplaySubject<boolean> = new ReplaySubject(1);
  GridType = GridType;
  RetailTransactions = RetailTransactions;

  @HostListener('mousedown', ['$event', '$event.target'])
  onMousedown(e: MouseEvent, ele: any) {
    const isDraggable = ele.classList.contains('draggable');
    if (!isDraggable && ele.closest('td')) {
      e.preventDefault();
    }
  }

  constructor(public dialog: MatDialog, private userAlerts: UserAlerts,
    public el: ElementRef,
    public fb: FormBuilder,
    public localization: Localization,
    private utils: Utilities,
    private _cdRef: ChangeDetectorRef,
    private loaddecimalvalue: LoadDecimalValuePipe, private currency: CustomCurrencyPipe, private localizedate: LocalizeDatePipe) {
    this.captions = this.localization.captions;
    this.customHeaderButton = this.localization.captions.setting.Add;
    for (let i = 1; i <= this.ArrayList.length; i++) {
      this.ArrayList.push(`item ${i}`);
    }
    this.table = this.fb.group({
      IsCheckAll: false,
      tablebody: this.fb.array([this.fb.group({ id: '', activetoggle: false, donecancel: false, category: '' })])
    });
    this.roleSetup = this.fb.group({
      roleName: ['', Validators.required],
      activetoggle: [false]
    });
    this.inActiveTherapist = new FormControl(false);
    this.inActiveService = new FormControl(false);
  }

  UpdateValidation() {
    this.roleSetup.markAsDirty();
    this.validateRoleSetup();
  }

  IsRoleSetupValid = false;

  private validateRoleSetup(): boolean {
    if (this.roleSetup.dirty && this.roleSetup.valid) {
      //case when role-setup form is in create mode or in edit mode after controls are dirty
      this.IsRoleSetupValid = true;
      return;
    }
    this.IsRoleSetupValid = false;
  }

  CreateTablerowFormGroup(optionsData) {
    const bodyArr: any = this.table.get('tablebody') as FormArray;
    bodyArr.controls = [];
    bodyArr.value = [];
    if (optionsData) {
      for (let i = 0; i < optionsData[0].TablebodyData.length; i++) {
        const bodyData = optionsData[0].TablebodyData[i];
        bodyArr.push(this.fb.group({
          id: bodyData.id,
          activetoggle: bodyData.isActive ? bodyData.isActive : (bodyData.active ? bodyData.active : false),
          donecancel: this.fb.control(false),
          category: this.fb.control(bodyData.category),
          rowDisabled: this.editEvent && this.editEvent.id == bodyData.id ? this.editEvent.rowDisabled : false
        })
        );
      }
    }
    return bodyArr;
  }

  UpdateTableFormGroup(optionsData) {
    const bodyArr: any = this.table.get('tablebody') as FormArray;
    if (optionsData) {
      optionsData[0].TablebodyData.forEach(res => {
        const index = bodyArr.value.findIndex(x => x.id == res.id);
        if (index != -1) {
          bodyArr.value[index].activetoggle = res.active;
        }
      });
    }
    return bodyArr;
  }

  onDragOver(event, ele, newarr) {
    event.preventDefault();
    const newdata = [];
    const overdata = ele;
    const newdatindex = newarr.indexOf(newdata);
    const overindex = newarr.indexOf(overdata);

  }

  onItemDrop(event, ele, newarr) {
    const timer = setTimeout(() => {
      const dragElements = document.getElementsByClassName('drag-border');
      Array.from(dragElements).forEach((el) => {
        el.classList.remove('drag-border');
      });
      clearTimeout(timer);
    }, 100);
    let reorderedarr;
    const draggeddata = event.dragData;
    const droppeddata = ele;
    const dragindex = newarr.indexOf(draggeddata);
    const dropindex = newarr.indexOf(droppeddata);
    const dragLstOrder: listOrder = draggeddata;
    const dropLstOrder: listOrder = droppeddata;
    this.dragDropEvt.emit([dragLstOrder.listOrder, dropLstOrder.listOrder, this.SelectedSettingId, this.InActiveTherapistChkBoxEvt]);
    newarr.splice(dragindex, 1);
    newarr.splice(dropindex, 0, draggeddata);
  }

  ngOnInit() {
    if (typeof this.options == 'undefined') { return; }
    this.defaulSortColumn = this.options[0].Sortable;
    this.showToggle = this.options[0].showToggle;
    this.toggleDisplayText = this.options[0].toggleDisplayText;
    this.Sortable = this.selectedDefaultHeader ? this.selectedDefaultHeader : (this.options[0].Sortable ? this.options[0].Sortable : 'id');
    this.sortingColoumn = this.hdrkeyArray.indexOf(this.Sortable);
    this.selectedDefaultHeader = this.Sortable;
    const overriddenSortColumn = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumn : null;
    const SortColumnDataType = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumndatatype : null;
    this.orderTypearr = [];
    this.userAction = this.options[0].userAction;
    this.sortingFunc(this.selectedDefaultHeader, this.sortingColoumn, 'onInit', overriddenSortColumn, SortColumnDataType);
  }

  ngOnDestroy() {
    this.$destroyed.next(true);
    this.$destroyed.complete();
  }

  setMatformWidth(myElement) {
    if (this.tableInput) {
      let minWidth = myElement.parentElement.parentElement.getElementsByClassName('actionitems')[0] ? myElement.parentElement.parentElement.getElementsByClassName('actionitems')[0]['offsetWidth'] : 300; //min-300 max-470
      minWidth += myElement.getElementsByClassName('search-container')[0] ? myElement.getElementsByClassName('search-container')[0]['offsetWidth'] : 0;
      minWidth += myElement.getElementsByClassName('table-toggle-switches')[0] ? myElement.getElementsByClassName('table-toggle-switches')[0]['offsetWidth'] : 0;
      minWidth += myElement.getElementsByClassName('custom-retail-inputs')[0] ? myElement.getElementsByClassName('custom-retail-inputs')[0]['offsetWidth'] : 0;
      return minWidth;
    }
  }

  calculateWidth() {
    Array.from(document.querySelectorAll('#SPACustomTable>ng-scrollbar>.ng-scrollbar-container>.ng-scrollbar-view>table')).forEach((table, index) => {
      if (table) {
        const tableHeight = table['offsetHeight'];
        const parentHeight = table.closest('#fixed-table-container')['offsetHeight'];
        if (parentHeight > tableHeight) {
          table.closest('#SPACustomTable')['style']['height'] = tableHeight + 2 + 'px';
        } else if (parentHeight < tableHeight) {
          // table.closest("#SPACustomTable")['style']['height'] = parentHeight + 20  + 'px';
          table.closest('#SPACustomTable')['style']['height'] = (parentHeight - 60) + 'px';
        }
        // document.getElementById('SPACustomTable').style.height = parentHeight + 'px';
      }
    });
    const searchClass = document.getElementsByClassName('CustomDataTable');
    for (let i = 0; i < searchClass.length; i++) {
      let pageHeader = searchClass[i].getElementsByClassName('page-header')[0] ? searchClass[i].getElementsByClassName('page-header')[0]['offsetWidth'] : 0;
      const searchInput = searchClass[i].getElementsByClassName('searchpt')[0];
      // console.log(searchInput);
      if (pageHeader > 0) {
        pageHeader = pageHeader - this.setMatformWidth(searchClass[i]) - 60;
      }
      const inputLength = this.tableInput ? this.tableInput.nativeElement.placeholder.length : 1;
      const inputWidth = inputLength <= 30 ? inputLength * 10 : inputLength * 7.5 + 20;
      if (searchInput && pageHeader > 0) {
        searchInput['style'].width = (pageHeader > inputWidth) ? inputWidth + 'px' : pageHeader + 'px';
      }
    }
  }

  ngAfterViewChecked() {
    if (this.tableInput && !this.viewCheckedFlag) {
      this.viewCheckedFlag = true;
      this.calwidthwithtimeout();
      this.customtablealignment();
    }
    this._cdRef.detectChanges();
  }

  ngAfterViewInit() {
    this.calwidthwithtimeout();
    this._cdRef.detectChanges();
  }

  ngOnChanges() {
    this.editRecordsArray = [];
    this.viewCheckedFlag = false;
    this.table.value.tablebody = this.CreateTablerowFormGroup(this.options);
    this.tempTableData = _.cloneDeep(this.options);
    this.IsCheckAll = false;
    if (typeof this.options == 'undefined') { this.isDataLoading = true; return; }
    this.isDataLoading = false;
    this.orderTypearr = [];
    this.defaulSortColumn = this.options[0].Sortable;
    this.Sortable = (this.selectedDefaultHeader && !this.options[0].isInitial) ? this.selectedDefaultHeader : (this.options[0].Sortable ? this.options[0].Sortable : 'id');
    this.isReadOnly = this.options[0].IsReadOnly ? true : false;
    this.IsMoreOptionReadOnly = this.options[0].IsMoreOptionReadOnly ? true : false;
    this.selectedDefaultHeader = this.Sortable;
    this.SelectRow = this.options[0].SelectRows;
    this.DoneCancel = this.options[0].DoneCancel;
    this.toggleDisplayText = this.options[0].toggleDisplayText;
    this.showToggle = this.options[0].showToggle;
    this.blnDraggable = this.options[0].TableDraggable != undefined ? this.options[0].TableDraggable : true;
    this.editable = this.options[0].Editable != undefined ? this.options[0].Editable : true;
    this.waitlistIcon = this.options[0].waitlistIcon != undefined ? this.options[0].waitlistIcon : false;
    this.deletable = this.options[0].deletable != undefined ? this.options[0].deletable : true;
    this.deleteIcon = this.options[0].DeleteIcon != undefined ? this.options[0].DeleteIcon : true;
    this.maxCol = 4;
    this.SelectedSettingId = this.options[0].SelectedSettingId;
    const minarrlength = this.options[0].TableHdrData.length <= this.maxCol ? this.maxCol - this.options[0].TableHdrData.length : 0;
    this.sticky = this.options[0].sticky ? this.options[0].sticky : false;
    this.remailLength = [];
    for (let m = 0; m < minarrlength; m++) {
      this.remailLength.push(m);
    }
    this.hdrArray = this.options[0].TableHdrData;
    this.originalHdrKeyArray = this.options[0].TableHdrData;
    this.SearchKeyArr = this.options[0].TableHdrData.filter(res => {
      return res.searchable != undefined ? res.searchable : true;
    });
    this.bodyArray = [];
    this.bodyArray = this.options[0].TablebodyData;
    this.SelectedData = [];
    //Set Checked items on load - based on the checked field in body data
    this.bodyArray.forEach(element => {
      if (element.checked != null && element.checked == true) {
        this.SelectedData.push(element);
      }
    });
    this.NewerData = this.options[0].NewData;
    this.NewerData = this.bodyArray.filter(o => {
      if (this.NewerData) {
        return ((o.code && o.code == this.NewerData.code) || (o.name && o.name == this.NewerData.name) || (o.addOnName && o.addOnName == this.NewerData.addOnName));
      }
    });
    if (this.NewerData[0]) {
      this.setinterscroll = setInterval(() => {
        const curiddata = this.NewerData ? (this.NewerData[0] ? this.NewerData[0].id : '') : '';
        this.autoscrolltocurrtime(curiddata);
      }, 500);
    }

    this.searchText = (this.options[0].TableSearchText || this.options[0].TableSearchText == '') ? this.options[0].TableSearchText : this.searchText;
    this.hdrkeyArray = [];
    if (this.hdrArray) {
      for (let l = 0; l < this.hdrArray.length; l++) {
        if (this.hdrArray[l].searchable != undefined ? this.hdrArray[l].searchable : true) {
          this.hdrkeyArray.push(this.hdrArray[l].jsonkey);
        }
      }
    }

    this.PlaceHoldertext = this.options[0].PlaceHoldertext;
    this.EnableActions = this.options[0].EnableActions;
    this.disableDelete = this.options[0].disableDelete;
    this.EnablePagination = this.options[0].pagination;
    this.InactiveTherapists = this.options[0].InactiveTherapists;
    this.ChkInactiveService = this.options[0].InactiveService;
    this.InactiveRoles = this.options[0].InactiveRoles;
    this.EditMoreOption = this.options[0].EditMoreOption;
    this.SelectOnlyRow = this.options[0].SelectOnlyRow;
    this.customHeader = this.options[0].customHeader;
    this.pageTitle = this.options[0].pageTitle;
    this.customeHeaderOptions = this.options[0].headerOptions;
    this.dropdownOptions = this.options[0].dropdownOptions;
    this.RadiobuttonOption = this.options[0].RadiobuttonOption;
    // Load Only active services
    if (this.ChkInactiveService) {
      this.InactiveService({ checked: false });

    } this.sortingColoumn = this.hdrkeyArray.indexOf(this.Sortable);
    const overriddenSortColumn = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumn : null;
    const SortColumnDataType = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumndatatype : null;
    this.sortingFunc(this.selectedDefaultHeader, this.sortingColoumn, 'change', overriddenSortColumn, SortColumnDataType);
    // this.table.value.IsCheckAll = this.bodyArray && this.bodyArray.length > 0 && (_.difference(this.bodyArray, this.SelectedData).length === 0);
    this.table.controls['IsCheckAll'].setValue(this.bodyArray && this.bodyArray.length > 0 && (_.difference(this.bodyArray, this.SelectedData).length === 0));
    // if (this.GridType.quickSale == this.SelectedSettingId){
    //   let checkboxRow = this.bodyArray.filter(item => !item.checkbox);
    //   // this.table.value.IsCheckAll = checkboxRow && checkboxRow.length > 0 && (_.difference(checkboxRow, this.SelectedData).length === 0);
    //   this.table.controls['IsCheckAll'].setValue(checkboxRow && checkboxRow.length > 0 && (_.difference(checkboxRow, this.SelectedData).length === 0));
    // }
    setTimeout(this.customtablealignment.bind(this), 1);
    this.IsViewOnly = this.options[0].IsViewOnly;
    this.disableEditButton = this.options[0].disableEditButton;
    this.IsRetailCodeSetup = (this.options[0].ServiceId == 'quicksale' || this.options[0].ServiceId == 'measures' || this.options[0].ServiceId == 'outlets');
    this.IsAccessAllowed = this.options[0].IsAccessAllowed;
    this.isEditOptionRemove = this.options[0].isEditOptionRemove;
    if (this.SelectedSettingId == GridType.waitlist) {
      this.orderType = '';
    }
    this.calwidthwithtimeout();
  }

  waitlist(cnt): void {
    this.openWaitlist.emit(cnt);
  }

  customtablealignment() {
    let dropdown: any = [];
    const groupArray: any = {
      roleSetup: {
        roleName: '35',
        active: '25'
      },
      userSetup: {
        userId: '10',
        name: '15',
        email: '15',
        applicationAllowed: '15',
        roles: '15',
        createdOn: '15',
        lastAccessedOn: '10',
      }
    };

    switch (this.SelectedSettingId) {
      case GridType.roleSetup:
        dropdown = (Object.values(groupArray.roleSetup));
        break;
      case GridType.userSetup:
        dropdown = (Object.values(groupArray.userSetup));
        break;
    }

    const coloumncount = document.getElementsByTagName('th').length;
    let overallgivenwidth = 0;
    let ga;
    if (dropdown) {
      const parentWidth = document.getElementById('SPACustomTable') && document.getElementById('SPACustomTable').offsetWidth;
      for (ga = 0; ga < dropdown.length; ga++) {
        if (document.getElementsByTagName('th')[ga]) {
          document.getElementsByTagName('th')[ga].style.width = Object.values(dropdown)[ga] + '%';
        }
        overallgivenwidth += Number(dropdown[ga]);
      }
      if (dropdown && this.bodyArray.length > 0) {
        const tablerow = document.getElementsByTagName('tr');
        for (let i = 1; i <= this.bodyArray.length; i++) {
          if (tablerow[i]) {
            for (let j = 0; j < dropdown.length; j++) {
              if (document.getElementsByTagName('tr')[i].cells) {
                // document.getElementsByTagName('tr')[i].cells[j].style.maxWidth = parentWidth * (Number(Object.values(dropdown)[j])/100) + 'px';
                document.getElementsByTagName('tr')[i].cells[j].querySelectorAll('#content').length > 0 ? document.getElementsByTagName('tr')[i].cells[j].querySelectorAll('#content')[0]['style'].maxWidth = parentWidth * (Number(Object.values(dropdown)[j]) / 100) + 'px' : '';
              }
            }
          }
        }
      }
      for (let remCol = ga; remCol < coloumncount; remCol++) {
        if (document.getElementsByTagName('th')[coloumncount - 2] && document.getElementsByTagName('td')[ga]) {
          document.getElementsByTagName('th')[coloumncount - 2].style.width = (92 - overallgivenwidth) + '%';
          document.getElementsByTagName('td')[coloumncount - 2].style.maxWidth = parentWidth * (Number((92 - overallgivenwidth)) / 100) + 'px';
          if (this.EditMoreOption == true) {
            document.getElementsByTagName('th')[coloumncount - 1].style.width = '2%';
            document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '100px';
          } else {
            if (this.SelectedSettingId == GridType.customfield) {
              document.getElementsByTagName('th')[coloumncount - 1].style.width = '3%';
              document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '150px';
            } else {
              document.getElementsByTagName('th')[coloumncount - 1].style.width = '3%';
              document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '150px';
            }
          }
        }
      }
    }

  }

  sliderChange(event: any, rowData?: any) {
    const data = { value: event, data: rowData };
    this.toggleEvtEmitter.emit(data);
  }

  showInactiveRoles(event, rowData, index) {
    const tablebody = this.table.controls['tablebody'] as FormArray;
    const tableFormGroup = tablebody.controls[index] as FormGroup;
    tableFormGroup.controls.activetoggle.setValue(rowData.active);
    this.editRecordsArray.push({ index, data: rowData });
    this.activeIndex = index;
    const doneCancelCount = _.reduce(this.table.value.tablebody, (acc, val) => {
      acc = val.donecancel ? (acc + 1) : acc;
      return acc;
    }, 0);
    const doneCancelRecords: any = _.filter(this.table.value.tablebody, (data) => {
      return data.donecancel;
    });

    const editRecordList = document.getElementsByClassName('rowDisabled');
    if ((editRecordList.length > 0 || doneCancelCount > 0) && this.isValidRoleName) {

      const editableRecord = editRecordList.length > 0 ? _.filter(this.bodyArray, data => data.id == editRecordList[0].id) : _.filter(this.bodyArray, data => data.id == doneCancelRecords[0].id);
      const currentRecord = rowData;
      this.openAlertDialog(editableRecord, currentRecord, 'toggle', index, event, doneCancelCount);
    } else if (editRecordList.length > 0) {
      document.getElementsByClassName('rowDisabled')[0].classList.remove('highlight');
      document.getElementsByClassName('rowDisabled')[0].classList.remove('rowDisabled');
      this.resetForm();
      this.enableDoneCancel(index, rowData);
    } else {
      this.enableDoneCancel(index, rowData);
    }
  }

  resetForm() {
    this.roleSetup.reset();
    this.validateRoleSetup();
    this.customHeaderButton = this.localization.captions.setting.Add;
    this.enableToggleButton = false;
  }

  enableDoneCancel(index, rowData) {
    this.table.value.tablebody[index].donecancel = true;
    const data = { value: event, data: rowData };
    this.inactiveToggleEvtEmitter.emit(data);
    this.isValidRoleName = true;
  }

  Done(rowData, index) {
    this.editRecordsArray = [];
    this.editEvent = {};
    const currentData = this.options[0].TablebodyData[index];
    currentData.hasOwnProperty('isActive') ? currentData.isActive : currentData.active;
    this.table.value.tablebody[index].donecancel = false;
    this.doneEvtEmitter.emit(rowData);
    this.resetForm();
  }

  lblclick(rowData, index, clickable) {
    if (clickable == 'clickable') {
      this.LBLClickEvtEmitter.emit(rowData);
      return;
    } else {
      return false;
    }
  }

  radioClick(rowData, index) {
    this.radioClickEvtEmitter.emit(rowData);
  }

  Cancel(rowData, index) {
    let enableToggle;
    _.forEach(this.tempTableData[0].TablebodyData, (data) => {
      if (data.id == rowData.id) {
        enableToggle = data.hasOwnProperty('isActive') ? data.isActive : data.active;
      }
    });
    if (this.options[0].TablebodyData[index].hasOwnProperty('isActive')) {
      this.options[0].TablebodyData[index].isActive = enableToggle;
    } else {
      this.options[0].TablebodyData[index].active = enableToggle;
    }
    this.table.value.tablebody[index].activetoggle = enableToggle;
    this.table.value.tablebody[index].donecancel = false;
  }

  onButtonClick(event, type, belonTo) {   // this.validateRoleSetup();
    this.editEvent = {};
    this.editRecordsArray = [];
    let data = {};
    switch (belonTo) {
      case 'roleSetup': data = { value: this.roleSetup, type };
        break;
      default: data = { value: '', type };
    }
    this.addClick.emit(data);
    /*Reset Form values to Default*/
    this.resetForm();
    this.validateRoleSetup();
  }

  onButtonCancelClick(event) {
    if (document.getElementsByClassName('rowDisabled').length > 0) {
      document.getElementsByClassName('rowDisabled')[0].classList.remove('highlight');
      document.getElementsByClassName('rowDisabled')[0].classList.remove('rowDisabled');
    }
    this.resetForm();
  }

  RowSelect(event, SelectedRow, Frm) {
    if (Frm == 'All') {
      if (event.checked == true) {
        this.SelectedData = [];
        for (let l = 0; l < SelectedRow.length; l++) {
          this.SelectedData.push(SelectedRow[l]);
        }
      } else {
        this.SelectedData = _.difference(this.SelectedData, this.bodyArray);
      }
    } else {
      if (this.SelectedData.indexOf(SelectedRow) == -1) {
        this.SelectedData.push(SelectedRow);
      } else {
        this.SelectedData.splice(this.SelectedData.indexOf(SelectedRow), 1);
        const checkedRow = this.bodyArray.findIndex(item => item.id == SelectedRow.id);
        this.bodyArray[checkedRow].checked = false;
      }
      this.table.controls['IsCheckAll'].setValue(this.bodyArray && this.bodyArray.length > 0 && (_.difference(this.bodyArray, this.SelectedData).length === 0));
    }
    this.RowSelectEmitter.emit(this.SelectedData);
    this.CurrentRowSelectedEmitter.emit({ event, SelectedRow, From: Frm });
  }

  InactiveService(e) {
    if (e[0]) {
      this.bodyArray = [];
      this.bodyArray = this.options[0].TablebodyData;
    } else {
      const tempArr = [];
      this.bodyArray.forEach(row => {
        if (row.isActive) {
          tempArr.push(row);

        }
      });
      this.bodyArray = tempArr;
    }
  }

  InactiveTherapist(e) {
    this.InActiveTherapistChkBoxEvt = e[0];
    this.InActiveTherapistEvt.emit(e[0]);
    const Checkbool = e[0];
    const tempArray = [];
    this.givenOrderType = this.orderType;
    if (Checkbool) {
      // this.bodyArray.forEach(elementValue => {
      //   elementValue.therapist.forEach(element => {
      //     if (element.onlineStatus == false) {
      //       tempArray.push(elementValue);
      //     }
      //   });
      // });
      // this.bodyArray = [];
      // this.bodyArray = tempArray;
    } else {
      this.bodyArray = [];
      this.bodyArray = this.options[0].TablebodyData;
    }
  }

  openAlertPopup() {
    const dialogRef = this.dialog.open(CommonAlertMessagePopupComponent, {
      width: '305px',
      height: '300px',
      hasBackdrop: true,
      panelClass: 'small-popup',
      data: {
        headername: this.captions.common.Warning,
        headerIcon: 'icon-warning-icon',
        headerMessage: this.captions.common.saveChangesMessage, buttonName: this.captions.common.Yes, noButton: true,
        noButtonName: this.captions.common.No, type: 'message'
      },
      disableClose: true,
    });
    return dialogRef;
  }
  sortingFunc(dh, i, from, overriddenSortColumn, sortColumnDataType) {
    if (this.editRecordsArray.length > 0) {
      const dialogRef = this.openAlertPopup();
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'Yes') {
          this.Cancel(this.editRecordsArray[0].data, this.editRecordsArray[0].index);
          this.editRecordsArray = [];
          this.sortHeader(dh, overriddenSortColumn, sortColumnDataType, i, from);
        }
      });
    } else {
      this.sortHeader(dh, overriddenSortColumn, sortColumnDataType, i, from);
    }
  }

  sortHeader(dh, overriddenSortColumn, sortColumnDataType, i, from) {
    this.selectedDefaultHeader = dh;
    this.overriddenSortColumn = overriddenSortColumn;
    this.sortColumnDataType = sortColumnDataType;
    if (!this.options[0].isInitial && this.defaulSortColumn == this.selectedDefaultHeader && from == 'change') {
      if (this.orderTypearr.length > 0) {
        this.orderTypearr.splice(this.orderTypearr.indexOf(dh), 1);
      } else {
        this.orderTypearr.push(dh);
      }
    } else {
      if (this.givenOrderType == 'desc') {
        this.orderTypearr = [];
        this.orderTypearr.push(dh);
        this.givenOrderType = '';
      } else {
        this.givenOrderType = '';
      }
      if (this.orderTypearr.indexOf(dh) == -1) {
        this.orderTypearr = [];
        this.orderTypearr.push(dh);
        this.orderType = 'asc';
      } else {
        this.orderTypearr.splice(this.orderTypearr.indexOf(dh), 1);
        this.orderType = 'desc';
      }
    }

    // if (document.getElementById("sortArrow" + i)) {
    //   for (let i = 0; i < this.options[0].TableHdrData.length; i++) {
    //     this.sortArrowFunction(i, 'remove');
    //   }
    //   this.sortArrowFunction(i, 'add');
    // }
  }

  sortArrowFunction(i, eventType) {
    const element = document.getElementById('sortArrow' + i);
    if (element) {
      eventType == 'remove' ? element.classList.remove('IC6') : element.classList.add('IC6');

    } const headerElement = document.getElementById('header' + i);
    if (headerElement) {
      eventType == 'remove' ? headerElement.classList.remove('IC6') : headerElement.classList.add('IC6');

    }
  }

  DeleteRecords(e) {
    this.userAlerts.showPrompt(PromptType.Delete, this.PopupCallback.bind(this), e);
  }

  PopupCallback(result: string, extraParams?: any) {
    if (result.toLowerCase() == 'ok') {
      this.deleteEvt.emit([extraParams, this.options[0].ServiceId, this.InActiveTherapistChkBoxEvt]);
      this.givenOrderType = this.orderType;
    }
  }

  autoscrolltocurrtime(curid) {
    if (document.getElementsByClassName('highlight').length > 0) {
      const curRow = curid.toString();
      const elms = document.getElementById(curRow);
      if (elms) {

        const scrolltoPos = (document.getElementById(curRow).offsetTop);
        const thPos = (document.getElementById('SPAHeaderRow').offsetHeight);
        document.getElementById('SPACustomTable').scrollTop = scrolltoPos - thPos;
        clearInterval(this.setinterscroll);
      }
    }
  }

  changeUserAction(event, e, belonTo, index?) {
    this.userActionEvt.emit([e]);
  }

  openAlertDialog = (editableRecord, currentRecord, eventType, index, event, cancelCount) => {
    const dialogRef = this.openAlertPopup();
    dialogRef.afterClosed().pipe(takeUntil(this.$destroyed)).subscribe(result => {
      if (result == 'Yes') {
        if (document.getElementsByClassName('rowDisabled').length > 0) {
          document.getElementsByClassName('rowDisabled')[0].classList.remove('highlight');
          document.getElementsByClassName('rowDisabled')[0].classList.remove('rowDisabled');
        }
        if (cancelCount > 0) {
          const recordArray = this.editRecordsArray;
          recordArray.length == 1 ? this.Cancel(recordArray[0].data, recordArray[0].index) : this.Cancel(recordArray[recordArray.length - 2].data, recordArray[recordArray.length - 2].index);
        }
        if (eventType == 'toggle') {
          this.table.value.tablebody[index].donecancel = true;
          _.forEach(this.table.value.tablebody, (data, i) => {
            if (data.donecancel && data.id != this.table.value.tablebody[index].id) {
              this.table.value.tablebody[i].donecancel = !this.table.value.tablebody[i].donecancel;
            }
          });
          const data = { value: event, data: currentRecord };
          this.inactiveToggleEvtEmitter.emit(data);
          this.resetForm();
        } else {
          //currentRecord.active = !currentRecord.active;
          this.editEvent = { id: currentRecord.id, rowDisabled: true };
          _.forEach(this.table.value.tablebody, (data, i) => {
            if (data.donecancel) {
              data.donecancel = !data.donecancel;
            }
          });
          this.editRow(event, currentRecord, 'edit', this.options[0].ServiceId);
        }
      } else {
        this.editRecordsArray.length > 0 ? this.editRecordsArray.pop() : this.editRecordsArray;
        if (eventType == 'toggle') {
          this.Cancel(currentRecord, index);
        }
      }
    });
  }

  editRow(event, e, type, belonTo, index?) {
    /*Updated Edit for Retail*/
    const doneCancelCount = _.reduce(this.table.value.tablebody, (acc, val) => {
      acc = val.donecancel ? (acc + 1) : acc;
      return acc;
    }, 0);
    const doneCancelRecords: any = _.filter(this.table.value.tablebody, (data) => {
      return data.donecancel;
    });
    if (doneCancelCount > 0 && this.editRecordsArray.length > 0) {
      const lastRecord = this.editRecordsArray.pop();
      this.editRecordsArray = [];
      this.editRecordsArray.push(lastRecord);
    } else {
      this.editRecordsArray = [];
    }
    const editRecordList = document.getElementsByClassName('rowDisabled');
    if ((editRecordList.length > 0 || doneCancelCount > 0) && this.isValidRoleName) {
      const editableRecord = editRecordList.length > 0 ? _.filter(this.options[0].TablebodyData, data => data.id == editRecordList[0].id) : _.filter(this.options[0].TablebodyData, data => data.id == doneCancelRecords[0].id);

      const currentRecord = e;
      this.openAlertDialog(editableRecord, currentRecord, 'edit', index, event, doneCancelCount);
    } else {
      if (this.customHeader) {
        this.customHeaderButton = this.localization.captions.setting.UPDATE;
        this.validateRoleSetup();
        this.enableToggleButton = true;
        if (belonTo == 'roleSetup') {
          this.roleSetup.controls['roleName'].setValue(e.description);
          this.roleSetup.controls['activetoggle'].setValue(e.active);
          this.isValidRoleName = false;
          if (typeof event == 'object' && event.target.parentElement.parentElement.classList.contains('rowDisabled')) {
            this.roleSetup.controls['roleName'].setValue('');
            this.roleSetup.controls['activetoggle'].setValue(false);
            this.customHeaderButton = this.localization.captions.setting.Add;
          }
        }
        if (typeof event == 'object') {
          event.target.parentElement.parentElement.classList.toggle('rowDisabled');
          if (document.getElementsByClassName('rowDisabled').length > 1) {
            const classList = document.getElementsByClassName('rowDisabled');
            for (let i = 0; i < classList.length; i++) {
              if (classList[i].id != e.id) {
                document.getElementsByClassName('rowDisabled')[i].classList.remove('highlight');
                document.getElementsByClassName('rowDisabled')[i].classList.remove('rowDisabled');
              }
            }
          }
        }
        this.EditRecords(e, type, index);
      } else {
        if (document.getElementsByClassName('highlight').length > 0) {
          document.getElementsByClassName('highlight')[0].classList.remove('highlight');
        }
        event.target.parentElement.parentElement.classList.add('highlight');
        this.EditRecords(e, type, index);
      }
    }
  }

  EditRecords(e, type, index?) {
    if (this.editEvt) {
      if (this.SelectedSettingId == GridType.commission) {
        this.editEvt.emit([e, type, index]);
      } else {
        this.editEvt.emit([e, this.options[0].ServiceId, type]);
        this.givenOrderType = this.orderType;
      }

    }
  }

  PrintRecord(e) {
    if (this.printEvt) {
      this.printEvt.emit([e]);
    }
  }

  SetColumnValue(bodyCnt: any, jsonkey: string): string {
    jsonkey = jsonkey ? jsonkey : '';
    if (jsonkey.includes('+')) {
      let result = '';
      const arrKey = jsonkey.split('+');
      for (let i = 0; i < arrKey.length; i++) {
        let val = bodyCnt[arrKey[i]];
        val = val ? val : '';
        result = result + (i == 0 ? '' : ' ') + val;
      }
      return result;
    }
    return bodyCnt[jsonkey];
  }

  printQtyColor(event) {
    if (event.target.value > 0) {
      event.target.style.fontFamily = 'LatoWeb';
    }
  }

  calwidthwithtimeout() {
    setTimeout(() => {
      this.calculateWidth();
    }, 1);
  }

  public clearSearchText(): void {
    this.searchText = '';
  }

  trackByFn(index) {
    return index;
  }

  checkBool(IfBoolean: any): boolean {
    let ReturnBool: boolean;
    if (typeof IfBoolean === 'boolean') {
      ReturnBool = true;
    } else {
      ReturnBool = false;
    }
    return ReturnBool;
  }

  checkInnerBool(paramsinner: any): boolean {
    let ReturnBool: boolean;
    if (typeof paramsinner === 'object') {
      ReturnBool = true;
    } else {
      ReturnBool = false;
    }
    return ReturnBool;
  }
}

export interface listOrder {
  listOrder: number;
}