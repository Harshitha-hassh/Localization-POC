import { Component, OnInit, Input, ElementRef, ViewEncapsulation, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import * as myGlobals from 'src/app/common/shared/shared/globalsContant'; //CONSTANT FILE ADD ANY CONSTANT VALUE
import { MatDialog } from '@angular/material';
import { MatMenuTrigger } from '@angular/material';
import * as _ from 'lodash';
import { Localization } from '../../core/localization/Localization';
import { ScrollbarComponent } from 'ngx-scrollbar';
import { ClientService } from '../../shared/service/client-service.service';
import { ClientCommonService } from '../client.service';
import { SPAConfig } from 'src/app/common/shared/config/SPA-config';
import { Utilities } from 'src/app/common/shared/shared/utilities/utilities';

@Component({
  selector: 'app-client-table',
  templateUrl: './client-table.component.html',
  styleUrls: ['./client-table.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClientTableComponent implements OnInit {
  /*  sortableHeader: any; */
  maxCol: number;
  /* HighlightRow: boolean = false; */
  SelectRow: boolean = false;
  // commissionTableOptions: boolean = false;
  SelectedData: any = [];
  sortingColoumn: any;
  setinterscroll: any;
  // checkAll: boolean = false;
  @Input() options;
  @Output() afterEditClose: EventEmitter<any> = new EventEmitter();
  @Output() dragDropEvt: EventEmitter<any> = new EventEmitter();
  @Output() deleteEvt: EventEmitter<any> = new EventEmitter();
  @Output() editEvt: EventEmitter<any> = new EventEmitter();
  // @Output() InActiveTherapistEvt: EventEmitter<any> = new EventEmitter();
  @Output() RowSelectEmitter: EventEmitter<any> = new EventEmitter();
  @Output() CurrentRowSelectedEmitter: EventEmitter<any> = new EventEmitter();
  @Output() toggleEvtEmitter: EventEmitter<any> = new EventEmitter();
  @Output() clientSelected: EventEmitter<any> = new EventEmitter();
  // @Output() addClick: EventEmitter<any> = new EventEmitter();
  // @Output() dropDownChange: EventEmitter<any> = new EventEmitter();
  // @Output() printEvt: EventEmitter<any> = new EventEmitter();
  // @Output() LBLClickEvtEmitter: EventEmitter<any> = new EventEmitter();
  @ViewChild(MatMenuTrigger, { static: false }) trigger: MatMenuTrigger;
  @ViewChild(ScrollbarComponent, { static: false }) scrollRef: ScrollbarComponent;
  IsCheckAll: Boolean = false;
  InActiveTherapistChkBoxEvt: any;
  orderTypearr: any = [];
  orderType: any = 'asc';
  // currentIndex: any;
  hdrArray: any = [];
  bodyArray: any = [];
  selectedDefaultHeader: any;
  searchText: any;
  hdrkeyArray: any = [];
  PlaceHoldertext: string;
  EnableActions: boolean;
  currentPage: any = 1;
  EnablePagination: boolean = true;
  /* InactiveTherapists: boolean = false;
  ChkInactiveService: boolean = false;*/
  SetColumnGridValue: boolean = false;
  SelectedSettingId: number = 1;
  blnDraggable: boolean = true;
  remailLength: any = [];
  Sortable: any;
  // highlight: any;
  NewerData: any;
  // previousSelectedColumn: any;
  givenOrderType: any;
  EditMoreOption: any;
  defaulSortColumn: any;
  // tableId: any;
  editable: boolean = true;
  deletable: boolean = true;
  deleteIcon: boolean = true;
  overriddenSortColumn: string;
  sortColumnDataType: string;
  // customHeader: boolean = false;
  // pageTitle:string;
  /*  customeHeaderOptions:any =[];
   outlets: FormGroup;
   measures: FormGroup;
   customHeaderButton: string = "Add"; */
  // dropdownOptions : any=[]
  captions: any = {};

  openTransactions: any = [this.localization.captions.shop.Settle, this.localization.captions.shop.Reopen];
  correctVoid: any = [this.localization.captions.shop.Void,this.localization.captions.shop.Correct];
  returnWithTicket: any = [this.localization.captions.shop.Return];
  ArrayList = [];
  disableDelete: any;
  // showToggle: any;
  toggleDisplayText: any;
  // toggleDisplay:any;
  // indeterminate:any;
  GridType = myGlobals.GridType;
  RetailTransactions = myGlobals.RetailTransactions;
  viewCheckedFlag = false;
  @Input() enableStickyColumn;
  selectedIndex : any = this.clientService.selectedIndex;
  isPlayerFound = false;
  constructor(public dialog: MatDialog, private spaconfig: SPAConfig, public el: ElementRef, public fb: FormBuilder, public localization: Localization, private clientService : ClientService, public utils: Utilities, private clientCommonService: ClientCommonService) {

  }



  /* tableOptions() {
    this.trigger.openMenu();
  } */

  LoadDecimalValue(val: any): string {
    let StrVal: string = val ? val.toString() : "";
    if (!StrVal.includes(this.localization.decimalSeparator)) {
      StrVal = StrVal + this.localization.decimalSeparator + "00"
    }
    return StrVal;
  }



  onDragOver(event, ele, newarr) {
    event.preventDefault();
    let newdata = [];
    let overdata = ele;
    let newdatindex = newarr.indexOf(newdata);
    let overindex = newarr.indexOf(overdata);

  }
  onItemDrop(event, ele, newarr) {
    let reorderedarr;
    let draggeddata = event.dragData;
    let droppeddata = ele;
    let dragindex = newarr.indexOf(draggeddata);
    let dropindex = newarr.indexOf(droppeddata);
    let dragLstOrder: listOrder = draggeddata;
    let dropLstOrder: listOrder = droppeddata;
    this.dragDropEvt.emit([dragLstOrder.listOrder, dropLstOrder.listOrder, this.SelectedSettingId, this.InActiveTherapistChkBoxEvt]);
    newarr.splice(dragindex, 1);
    newarr.splice(dropindex, 0, draggeddata);
  }


  /* allowDrop(event, ele, newarr) {
    let draggeddata = event.dragData;
    let dragindex = newarr.indexOf(draggeddata);
    newarr.splice(dragindex, 1);
  } */


  /* lblclick(rowData, index, clickable){
    if(clickable=='clickable') {
      this.LBLClickEvtEmitter.emit(rowData);
      return;
    }else{
      return false;
    }
  } */
  /***
    * getArrayValue check the array from the loop delete the ID value
    * @input Params - Array
    * @output Object Json
 */

  // getArrayValue(paramsValue: any) {
  //   if (paramsValue) {
  //     delete paramsValue.id;
  //     return Object.values(paramsValue);
  //   } else {
  //     return paramsValue;
  //   }
  // }
  /***
   *  CheckInnerBool Check any Object from the Array value
   * @input Params -Json
   * @output Return the Boolean Value
   * If Any object from array return the true value
  */

  CheckInnerBool(paramsinner: any) {
    let ReturnBool;
    if (typeof paramsinner === "object") {
      ReturnBool = true;
    } else {
      ReturnBool = false;
    }
    return ReturnBool;
  }
  /***
   * Change Check Boolean of the Function
   * @input Params -Boolean
   * @output Return the Boolean Value
   * If Check the any Boolean value form the Array
  */

  IfBoolean(IfBoolean: any) {
    let ReturnBool;
    if (typeof IfBoolean === "boolean") {
      ReturnBool = true;
    } else {
      ReturnBool = false;
    }
    return ReturnBool;
  }
  /* IsRowChecked(row: any): boolean {
    return row.checked;
  } */
  /* startDrop(bi) {

  } */


  ngOnInit() {
    this.captions = this.localization.captions;
    for (let i = 1; i <= this.ArrayList.length; i++) {
      this.ArrayList.push(`item ${i}`);
    }

    /* this.outlets = this.fb.group({
      outletName:['', Validators.required],
      terminalId:['', Validators.required],
      toggleDisplay:false
    });

    this.measures = this.fb.group({
      measuringUnit:['', Validators.required]
    }); */
    if (typeof this.options == "undefined") { return; }
    this.defaulSortColumn = this.options[0].Sortable;
    /* this.showToggle = this.options[0].showToggle; */
    this.toggleDisplayText = this.options[0].toggleDisplayText;
    this.Sortable = this.selectedDefaultHeader ? this.selectedDefaultHeader : (this.options[0].Sortable ? this.options[0].Sortable : 'id');
    this.sortingColoumn = this.hdrkeyArray.indexOf(this.Sortable);
    this.selectedDefaultHeader = this.Sortable;
    let overriddenSortColumn = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumn : null;
    let SortColumnDataType = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumndatatype : null;
    this.sortingFunc(this.selectedDefaultHeader, this.sortingColoumn, 'onInit', overriddenSortColumn, SortColumnDataType);

  }
  ngOnChanges() {
    this.IsCheckAll = false;
    if (typeof this.options == "undefined") { return; }
    this.orderTypearr = [];
    this.defaulSortColumn = this.options[0].Sortable;
    this.Sortable = (this.selectedDefaultHeader && !this.options[0].isInitial) ? this.selectedDefaultHeader : (this.options[0].Sortable ? this.options[0].Sortable : 'id');

    this.selectedDefaultHeader = this.Sortable;
    this.SelectRow = this.options[0].SelectRows;

    this.toggleDisplayText = this.options[0].toggleDisplayText;
    /* this.showToggle = this.options[0].showToggle; */
    this.blnDraggable = this.options[0].TableDraggable;
    this.editable = this.options[0].Editable != undefined ? this.options[0].Editable : true;
    this.deletable = this.options[0].deletable != undefined ? this.options[0].deletable : true;
    this.deleteIcon = this.options[0].DeleteIcon != undefined ? this.options[0].DeleteIcon : true;
    this.maxCol = 4;
    this.SelectedSettingId = this.options[0].SelectedSettingId;
    let minarrlength = this.options[0].TableHdrData.length <= this.maxCol ? this.maxCol - this.options[0].TableHdrData.length : 0;
    this.remailLength = [];
    for (let m = 0; m < minarrlength; m++) {
      this.remailLength.push(m);
    }
    this.hdrArray = this.options[0].TableHdrData;
    this.bodyArray = this.options[0].TablebodyData;
    this.SelectedData = [];
    //Set Checked items on load - based on the checked field in body data
    this.bodyArray.forEach(element => {
      if (element.checked != null && element.checked == true)
        this.SelectedData.push(element);
    });


    this.NewerData = this.options[0].NewData;

    this.NewerData = this.bodyArray.filter(o => {
      if (this.NewerData) {
        return ((o.code && o.code == this.NewerData.code) || (o.name && o.name == this.NewerData.name) || (o.addOnName && o.addOnName == this.NewerData.addOnName))
      }
    })

    if (this.NewerData[0]) {
      this.setinterscroll = setInterval(() => {
        let curiddata = this.NewerData ? (this.NewerData[0] ? this.NewerData[0].id : '') : '';
        this.autoscrolltocurrtime(curiddata);
      }, 500);
    }



    this.searchText = this.options[0].TableSearchText;
    this.hdrkeyArray = [];
    for (let l = 0; l < this.hdrArray.length; l++) {
      if (this.hdrArray[l].searchable != undefined ? this.hdrArray[l].searchable : true)
        this.hdrkeyArray.push(this.hdrArray[l].jsonkey);
    }
    this.PlaceHoldertext = this.options[0].PlaceHoldertext;
    this.EnableActions = this.options[0].EnableActions;
    this.disableDelete = this.options[0].disableDelete;
    this.EnablePagination = this.options[0].pagination;
    /* this.InactiveTherapists = this.options[0].InactiveTherapists;
    this.ChkInactiveService = this.options[0].InactiveService;*/
    this.EditMoreOption = this.options[0].EditMoreOption;
    // this.customHeader = this.options[0].customHeader;
    // this.pageTitle = this.options[0].pageTitle;
    // this.customeHeaderOptions =  this.options[0].headerOptions;
    // this.dropdownOptions = this.options[0].dropdownOptions;
    // Load Only active services
    /* if (this.ChkInactiveService)
      this.InactiveService({ checked: false }); */


    this.sortingColoumn = this.hdrkeyArray.indexOf(this.Sortable);
    let overriddenSortColumn = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumn : null;
    let SortColumnDataType = this.hdrArray.filter(o => o.jsonkey == this.Sortable).length > 0 ? this.hdrArray.filter(o => o.jsonkey == this.Sortable)[0].sortcolumndatatype : null;
    this.sortingFunc(this.selectedDefaultHeader, this.sortingColoumn, 'onInit', overriddenSortColumn, SortColumnDataType);
    if(this.bodyArray.length > 0)
    {
      this.IsCheckAll = (_.difference(this.bodyArray, this.SelectedData).length === 0);
    }else{
      this.IsCheckAll = false;
    }
    setTimeout(this.customtablealignment.bind(this), 1);
    this.viewCheckedFlag = false;
  }


  customtablealignment() {
    let dropdown: any = [];
    let groupArray: any = {

      "allclients": {
        "checkbox": "0",
        "info": "15",
        "gender": "5",
        "dob": "10",
        "address": "20",
        "phno": "10",
        "visiteddate": "10",
        "appointmentservice": "15"
      }
    };

    switch (this.SelectedSettingId) {
      case 99:
        dropdown = (Object.values(groupArray.allclients));
        break;
    }

    let coloumncount = document.getElementsByTagName('th').length;
    let overallgivenwidth = 0;
    let ga;
    if (dropdown) {
      let parentWidth = document.getElementById('SPACustomTable') && document.getElementById('SPACustomTable').offsetWidth;
      // for (ga = 0; ga < dropdown.length; ga++) {
      //   if (document.getElementsByTagName('th')[ga]){
      //     document.getElementsByTagName('th')[ga].style.maxWidth = parentWidth * (Number(Object.values(dropdown)[ga]) / 100) + 'px';
      //   }
      //   overallgivenwidth += Number(dropdown[ga]);
      // }
      if (dropdown && this.bodyArray.length > 0) {
        let tablerow = document.getElementsByTagName('tr');
        for (let i = 1; i <= this.bodyArray.length; i++) {
          if (tablerow[i]) {
            for (let j = 0; j < dropdown.length; j++) {
              if (tablerow[i].cells) {
                // tablerow[i].cells[j].style.maxWidth = parentWidth * (Number(Object.values(dropdown)[j])/100) + 'px';
                tablerow[i].cells[j].querySelectorAll("#content").length > 0 ? tablerow[i].cells[j].querySelectorAll("#content")[0]['style'].maxWidth = parentWidth * (Number(Object.values(dropdown)[j]) / 100) + 'px' : '';
              }
            }
          }
        }
      }
      for (let remCol = ga; remCol < coloumncount; remCol++) {
        if (document.getElementsByTagName('th')[coloumncount - 2] && document.getElementsByTagName('td')[ga]) {
          document.getElementsByTagName('th')[coloumncount - 2].style.width = (92 - overallgivenwidth) + '%';
          document.getElementsByTagName('td')[coloumncount - 2].style.maxWidth = parentWidth * (Number((92 - overallgivenwidth))/100) + 'px';
          if (this.EditMoreOption == true) {
            document.getElementsByTagName('th')[coloumncount - 1].style.width = '2%';
            document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '100px';
          }
          else {
            if (this.SelectedSettingId == myGlobals.GridType.customfield){
              document.getElementsByTagName('th')[coloumncount - 1].style.width = '3%';
              document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '150px';
            }
            else{
              document.getElementsByTagName('th')[coloumncount - 1].style.width = '3%';
              document.getElementsByTagName('td')[coloumncount - 1].style.maxWidth = '150px';
            }
          }
        }
      }
    }

  }

  sliderChange(event: any, rowData?: any) {
    let data = { 'value': event, 'data': rowData }
    this.toggleEvtEmitter.emit(data);
  }

  /*  onButtonClick(event,type,belonTo){
     let data ={}
     switch(belonTo){
       case 'outlets': data = {'value':this.outlets,'type':type}
                       break;
       case 'measures':data = {'value':this.measures,'type':type}
                       break;

     }

     // this.addClick.emit(data);
     //Reset Form values to Default
     this.outlets.reset();
     this.measures.reset();
     this.customHeaderButton = 'Add';

   } */

  RowSelect(event, SelectedRow, Frm) {

    /*Updated the following for QuickSale Setup Table*/
    /* if(this.GridType.quickSale == this.SelectedSettingId && Frm == 'All'){
      if(event.checked == true){
        this.SelectedData = [];
        for (let l = 0; l < SelectedRow.length; l++) {
            if(SelectedRow[l].checkbox != true && SelectedRow[l].selectedCategory != ""){ //One More Contion Added check the SelectCategory if not equal to null
              this.SelectedData.push(SelectedRow[l]);
            }

        }
      }else{
        this.SelectedData = SelectedRow.map(x=> x.checkbox = false); //Uncheck the check box properity is false
      }
      if(this.SelectedData.length == 0){
        event.checked = false;
      }
    }
    else */

    if (Frm == 'All') {
      if (event.checked == true) {
        this.SelectedData = [];
        for (let l = 0; l < SelectedRow.length; l++) {
          this.SelectedData.push(SelectedRow[l]);
        }
      }
      else {
        this.SelectedData = _.difference(this.SelectedData, this.bodyArray);
      }
    }
    else {
      if (this.SelectedData.indexOf(SelectedRow) == -1) {
        this.SelectedData.push(SelectedRow);
      } else {
        this.SelectedData.splice(this.SelectedData.indexOf(SelectedRow), 1);
      }
      if(this.bodyArray.length > 0)
      {
        this.IsCheckAll = (_.difference(this.bodyArray, this.SelectedData).length === 0);
      }else{
        this.IsCheckAll = false;
      }
    }

    this.RowSelectEmitter.emit(this.SelectedData);
    this.CurrentRowSelectedEmitter.emit({ "event": event, "SelectedRow": SelectedRow, "From": Frm });
  }

  /* InactiveService(e) {
    if (e.checked) {
      this.bodyArray = this.options[0].TablebodyData;
    } else {
      var tempArr = [];
      this.bodyArray.forEach(row => {
        if (row.isActive)
          tempArr.push(row);
      });
      this.bodyArray = tempArr;
    }
  } */

  /* InactiveTherapist(e) {
    this.InActiveTherapistChkBoxEvt = e;
    this.InActiveTherapistEvt.emit(e);
    let Checkbool = e.checked;
    let tempArray = [];
    this.givenOrderType = this.orderType;
    if (Checkbool) {
      this.bodyArray.forEach(elementValue => {
        elementValue.therapist.forEach(element => {
          if (element.onlineStatus == false) {
            tempArray.push(elementValue);
          }
        });
      });
      this.bodyArray = [];
      this.bodyArray = tempArray;
    } else {
      this.bodyArray = this.options[0].TablebodyData;

    }

  } */
  sortingFunc(dh, i, from, overriddenSortColumn, sortColumnDataType) {

    this.selectedDefaultHeader = dh;
    this.overriddenSortColumn = overriddenSortColumn;
    this.sortColumnDataType = sortColumnDataType;
    if (!this.options[0].isInitial && this.defaulSortColumn == this.selectedDefaultHeader
      && from == "change"
    ) {
      if (this.orderTypearr.length > 0) {
        this.orderTypearr.splice(this.orderTypearr.indexOf(dh), 1);
      }
      else {
        this.orderTypearr.push(dh);
      }
    }
    else {

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

    if (document.getElementById("sortArrow" + i)) {
      for (let i = 0; i < this.options[0].TableHdrData.length; i++) {
        let element = document.getElementById("sortArrow" + i);
        if (element)
          element.classList.remove("IC6");
        let headerElement = document.getElementById("header" + i);
        if (headerElement)
          headerElement.classList.remove("IC6");
      }
      let element = document.getElementById("sortArrow" + i);
      if (element)
        element.classList.add("IC6");
      let headerElement = document.getElementById("header" + i);
      if (headerElement)
        headerElement.classList.add("IC6");
    }
    // }
  }

  DeleteRecords(e) {
    this.deleteEvt.emit([e, this.options[0].ServiceId, this.InActiveTherapistChkBoxEvt]);
    this.givenOrderType = this.orderType;
  }


  /* getpopData(tit) {
    let diaTit = [];
    switch (tit) {
      case 1:
        diaTit[0] = "Service Group";
        diaTit[1] = "SG";
        break;
      case 2:
        diaTit[0] = "Service Location";
        diaTit[1] = "SL";
        break;
      case 3:
        diaTit[0] = "Therapist Setup";
        diaTit[1] = "TS";
        break;
      case 4:
        diaTit[0] = "Medical Condition";
        diaTit[1] = "MC";
        break;
      case 5:
        diaTit[0] = "Service Add On";
        diaTit[1] = "SA";
        break;
      case 6:
        diaTit[0] = "Service Equipment";
        diaTit[1] = "SE";
        break;
      case 7:
        diaTit[0] = "SPA Service";
        diaTit[1] = "SS";
        break;
      case 8:
        diaTit[0] = "Commission values";
        diaTit[1] = "CO";
        break;
      case 9:
        diaTit[0] = "Spa Package";
        diaTit[1] = "SP";
        break;
      case 13:
        diaTit[0] = "Package Class";
        diaTit[1] = "PC";
        break;
      case 14:
        diaTit[0] = "Color Link";
        diaTit[1] = "CL";
        break;
      case 17:
        diaTit[0] = "Price Type";
        diaTit[1] = "PT";
        break;
      case 21:
        diaTit[0] = "Therapist Unavailability";
        diaTit[1] = "TU";
        break;
      default:
        break;
    }
    return diaTit;
  } */


  autoscrolltocurrtime(curid) {
    if (document.getElementsByClassName('highlight').length > 0) {
      let curRow = curid.toString();
      var elms = document.getElementById(curRow);
      if (elms) {

        let scrolltoPos = (document.getElementById(curRow).offsetTop);
        let thPos = (document.getElementById('SPAHeaderRow').offsetHeight);
        document.getElementById("SPACustomTable").scrollTop = scrolltoPos - thPos;
        clearInterval(this.setinterscroll);
      }
    }
  }
  editRow(event: any, e: any, type?: any, belonTo?: any, frm?: any, d?: any) {
    /*Updated Edit for Retail*/
    /* if(this.customHeader){
      this.customHeaderButton = "Update";

      switch(belonTo){
        case 'outlets': this.outlets.controls['outletName'].setValue(e.outletName);
                        this.outlets.controls['terminalId'].setValue(e.terminalId);
                        if(event.target.parentElement.parentElement.classList.contains("rowDisabled")){
                          this.outlets.controls['outletName'].setValue("");
                          this.outlets.controls['terminalId'].setValue("");
                          this.customHeaderButton = "Add";
                        }
                        break;
        case 'measures':this.measures.controls['measuringUnit'].setValue(e.measuringUnit);
                        if(event.target.parentElement.parentElement.classList.contains("rowDisabled")){
                          this.measures.controls['measuringUnit'].setValue("");
                          this.customHeaderButton = "Add";
                        }
                        break;
      }
      if (document.getElementsByClassName("rowDisabled").length > 0) {
        document.getElementsByClassName("rowDisabled")[0].classList.remove("highlight");
      }
      event.target.parentElement.parentElement.classList.toggle("rowDisabled");

      this.EditRecords(e, type, frm);
    }
    else{ */
    if (document.getElementsByClassName("highlight").length > 0) {
      document.getElementsByClassName("highlight")[0].classList.remove("highlight");
    }
    event.target.parentElement.parentElement.classList.add("highlight");
    this.EditRecords(event, e, type, frm);
    /* } */


  }

  highlightrow(event, rowData) {
    if (document.getElementsByClassName("highlight").length > 0) {
      document.getElementsByClassName("highlight")[0].classList.remove("highlight");
    }
    event.target.closest('tr').classList.add("highlight");
    this.clientSelected.emit(rowData);
  }

  EditRecords(event, e, type, frm) {
    event.stopPropagation();
    if (this.editEvt)
      if (this.SelectedSettingId == myGlobals.GridType.commission) {
        this.editEvt.emit([e, type]);
      } else {
        this.editEvt.emit([e, this.options[0].ServiceId, type, frm]);
        this.givenOrderType = this.orderType;
      }
  }
  /*  PrintRecord(e)
 {

   if(this.printEvt)
   {
     this.printEvt.emit([e]);
   }
 } */
  /* optionChange(e,belonTo,data){

    this.dropDownChange.emit([e,belonTo,data])
  } */
  /* openDialog(e, belonTo, preTit): void {
    let popupConfiguration: popupConfig
    popupConfiguration = {
      operation: "edit"
    }
    let Dialogtitle = this.getpopData(belonTo)[0];
    let DialogTemplate = this.getpopData(belonTo)[1];
    let bigPopupWin = ["Therapist Setup" , "SPA Service", "SPA Package"];
    let dialogRef = this.dialog.open(SettingDialogPopupComponent, {
      height: bigPopupWin.indexOf(Dialogtitle) == -1 ? 'auto' : '85%', //'auto',42rem
      width: bigPopupWin.indexOf(Dialogtitle) == -1 ? '661px' : '90%',
      data: { headername: preTit + '  ' + Dialogtitle, closebool: true, templatename: DialogTemplate, datarecord: e, popupConfig: popupConfiguration },
      panelClass: 'small-popup',
      disableClose: true,
      hasBackdrop: true
    });
    dialogRef.afterClosed().subscribe(
      result => {

        this.highlight = result;
        this.afterEditClose.emit({ response: result, toPopup: belonTo });

      }
    );
  } */
  SetColumnValue(bodyCnt: any, jsonkey: string): string {

    jsonkey = jsonkey ? jsonkey : "";
    if (jsonkey.includes("+")) {
      let result = "";
      let arrKey = jsonkey.split("+");
      for (let i = 0; i < arrKey.length; i++) {
        let val = bodyCnt[arrKey[i]];
        val = val ? val : "";
        result = result + (i == 0 ? "" : " ") + val;
      }
      return result;
    }
    return bodyCnt[jsonkey];
  }

  /* IsChecked(): boolean {
    return true;
  } */

  /* printQtyColor(event){

    if(event.target.value > 0)
  {
    event.target.style.fontFamily ="LatoWeb";
  }


    } */


  calculateWidth() {
    Array.from(document.querySelectorAll('#SPACustomTable>ng-scrollbar>.ng-scrollbar-container>.ng-scrollbar-view>table')).forEach((table, index) => {
      if (table) {
        let tableHeight = table['offsetHeight'];
        let parentHeight = table.closest("#fixed-table-container")['offsetHeight'];
        if (parentHeight > tableHeight)
          table.closest("#SPACustomTable")['style']['height'] = tableHeight + 2 + 'px';
        else if (parentHeight < tableHeight)
          table.closest("#SPACustomTable")['style']['height'] = parentHeight + 'px';
      }
    });
  }

  ngAfterViewChecked() {
    if (!this.viewCheckedFlag) {
      this.viewCheckedFlag = true;
      setTimeout(() => {
        this.calculateWidth();
        this.scrollRef.update();
      }, 1);
    }
  }

  playerWorthDetails(event, patronId : string) {
    this.clientCommonService.openDialogPopup(patronId);
    event.stopPropagation();
  }

}


export interface listOrder {
  listOrder: number;
}


