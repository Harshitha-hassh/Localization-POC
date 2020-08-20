import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef, Output, Input, EventEmitter, ComponentRef, ElementRef } from '@angular/core';
import { DashboardWidgetsReportService } from './dashboard-widgets-report.service';
import { DashBoardBusiness } from './dashboard-business';
import { Localization } from 'src/app/core/localization/Localization';
import { OutletOption, DonutCount } from './dashboard.modal';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import * as moment from 'moment';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { SortOrderPipe } from 'src/app/common/shared/shared/pipes/sort-order.pipe';
import { Utilities } from 'src/app/core/utilities';
import { ChartBarComponent } from '../chart-bar/chart-bar.component';

@Component({
  selector: 'app-dashboard-widgets-report',
  templateUrl: './dashboard-widgets-report.component.html',
  styleUrls: ['./dashboard-widgets-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DashboardWidgetsReportService, DashBoardBusiness, SubPropertyDataService,ChartBarComponent]
})
export class DashboardWidgetsReportComponent implements OnInit {
  captions: any;
  dashBoardform: FormGroup;
  dashBoardWidget: any;  //dynamic template data
  widgetsData: any;  //dynamic template data
  manageArr: any = []; //dynamic template data
  propertyDateTime: Date;
  propertyDate: Date;
  startDate: Date;
  endDate: Date;
  courseIds: number[];
  dashboardCourseIds: number[];
  courseId: number;
  startTime: number = 0;
  endTime: number = 1440;
  teeTimeCourseId: number;
  outletIds: number[];

  //skeletonData: TeeSheetSkeletonData[];
  courseUtilizationData: any[];
  courseDate: Date;
  // componentDetails: ComponentDetails;
  userId: any;
  DefaultCourseId: any;
  itemStartDate: Date;
  itemEndDate: Date;
  outletStartDate: Date;
  outletEndDate: Date;
  categoryStartDate: Date;
  categoryEndDate: Date;
  numericZero: number = 0;
  numericOne: number = 1;
  numericTwo: number = 2;
  numericThree: number = 3;
  dataFormat: number = 1;
  rowDescription: string;
  // userConfiguration: Promise<UserConfiguration>;
  isGridDisable: boolean = false;
  
  
  lineDrew: boolean = false;

  @ViewChild('Sales_Revenue', { static: false }) Sales_Revenue;
  @ViewChild('Out_of_StockItems', { static: false }) Out_of_StockItems;
  @ViewChild('Revenue_By_Outlet', { static: false }) Revenue_By_Outlet;
  @ViewChild('Sales_Top5Items', { static: false }) Sales_Top5Items;
  @ViewChild('Sales_Top5Categories', { static: false }) Sales_Top5Categories;
  @ViewChild('Purchase_Order', { static: false }) Purchase_Order;
  @ViewChild('Open_Tickets', { static: false }) Open_Tickets;
  @ViewChild('Returned_Items', { static: false }) Returned_Items;

  // @ViewChild('CourseDetails_Utilization', { static: false }) CourseDetails_Utilization;
  // @ViewChild('CourseDetails_TeeTimes', { static: false }) CourseDetails_TeeTimes;
  // @ViewChild('CourseDetails_Upcoming_Tournaments', { static: false }) CourseDetails_Upcoming_Tournaments;
  // @ViewChild('CourseDetails_Waitllist', { static: false }) CourseDetails_Waitllist;
  // @ViewChild('CourseDetails_Lessons', { static: false }) CourseDetails_Lessons;
  // @ViewChild('Sales_SalesRevenue', { static: false }) Sales_SalesRevenue;


  @ViewChild('DB_OultetsChart', { static: false }) DB_OultetsChart;
  @ViewChild('DB_TotalSalesRevenue', { static: false }) DB_TotalSalesRevenue;
  @ViewChild('DB_NumberOfTransaction', { static: false }) DB_NumberOfTransaction;
  @ViewChild('DB_AverageTransaction', { static: false }) DB_AverageTransaction;
  @ViewChild('DB_AvgUnitPerCustomer', { static: false }) DB_AvgUnitPerCustomer;
  @ViewChild('DB_VendorsChart', { static: false }) DB_VendorsChart;

  DB_OultetsChart_data:any;
  DB_TotalSalesRevenue_data: any;
  DB_NumberOfTransaction_data: any;
  DB_AverageTransaction_data: any;
  DB_AvgUnitPerCustomer_data: any;
  DB_VendorsChart_data :any; 

  Sales_SalesRevenue_data: any;
  Revenue_By_Outlet_data: any;
  Returned_Items_data:any;
  Sales_Top5Items_data:any;
  Sales_Top5Categories_data:any;

  sortOrderPipe: SortOrderPipe;
  constructor(private cdr: ChangeDetectorRef,
    public _DashboardWidgetsReportService: DashboardWidgetsReportService,
    private _dashBoardBusiness: DashBoardBusiness,
    private _localization: Localization,
    private _router: Router,
    private _fb: FormBuilder,
    private dialog: MatDialog,
    private _utilities :Utilities,
    private _ChartBarComponent: ChartBarComponent,
    private _propertyInformation: PropertyInformation) {
    // this.isSafari = _utilities.findUserAgent();
    this.sortOrderPipe = new SortOrderPipe();
  }

  ngOnInit() {
    // this.userId = Number(this._utilities.GetsessionStorageValue('_userInfo', 'userId'));
    this.propertyDateTime = this._propertyInformation.CurrentDate;
   
    this.propertyDate = this._utilities.resetTime(this.propertyDateTime);
    this.courseDate = this.propertyDate;
    this.startDate = this.propertyDate;
    this.endDate = this.propertyDate;
    this.itemStartDate = this.startDate;
    this.itemEndDate = this.endDate;
    this.categoryStartDate = this.startDate;
    this.categoryEndDate = this.endDate;
    this.outletStartDate = this.startDate;
    this.outletEndDate = this.endDate;
    this.captions = this._DashboardWidgetsReportService.captions;
    this.rowDescription = this.captions.DAY;

    this.getDatasFromService(); // get all data on init
    this.BindData(); // bind dashboard
  }
 
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    
  }

  async BindData() {
    this.dashboardData();
  }

  getDatasFromService(){
       
    this.dashBoardform = this._fb.group({  //change form names
      dashBoardHeadOutlet: '',
      SalesHeadOutlet: ''
    });

    this.getOutletsCount();
    this.getTotalSalesRevenue();
    this.getNumberOfTransaction();
    this.getAverageTransaction();
    this.getAvgUnitPerCustomer();
    this.getVendorsCount();

    this.getTransactionSaleDetail();
    this.getRevenueByOultetDetail();
    this.getReturned_ItemsDetail();

    this.getTop5ItemSaleDetail('day_0');
    this.getCategorySaleDetail('day_1');
  }


  buttonSelectionChange(widgetsData_Index, loopWidget_Index, loopWidget_multiSelectData_Index, buttonData, templateName) {
    console.log('widgetsData_Index ', widgetsData_Index, ' loopWidget_Index ', loopWidget_Index, '  loopWidget_multiSelectData_Index ', loopWidget_multiSelectData_Index, ' buttonData ', buttonData);
    this.widgetsData[widgetsData_Index].widget[loopWidget_Index].title.multiSelect.multiSelectData.forEach((data, index) => {
      data.selected = false;
      if (loopWidget_multiSelectData_Index == index) {
        data.selected = true;
      }
    });
    // this.getDataSelectionChange(widgetsData_Index, loopWidget_Index, loopWidget_multiSelectData_Index, buttonData.description, templateName);
  }

  async widgetView(widgetsData_Index, templateName, path) {
    console.log('widgetsData_Index ', widgetsData_Index, '  widgetView ', templateName);
    // let result = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.TeeSheet, true);
    // if (templateName == "CourseDetails_TeeTimes") {
    //   // if(result.isAllow || result.isViewOnly)
    //   this._router.navigateByUrl(`/tee-time/teesheet/teeSheet?course=${this.teeTimeCourseId}`);
    // } else {
    //   this._router.navigate([path]);
    // }
  }

  manage(widgetsData_Index) {
    this.manageArr[widgetsData_Index].show = !this.manageArr[widgetsData_Index].show;
  }

  widgetHeaderDropDownChange(widgetsData_Index, loopWidget_Index, e) {
    this.teeTimeCourseId = e.value;
  }

  headerDropDownChange(controlName, e) {
    if (controlName == 'CourseDetailsHeadCourse') {
      console.log(controlName, ' ', e);
    } else if (controlName == 'SalesHeadOutlet') {
      console.log(controlName, ' ', e);
    }
  }

  dashBoardDropDownFrmControl(e) {
    console.log('dashBoardDropDownFrmControl ', e);
  }
  dashBoardIsAnySelected(e) {

    console.log('dashBoardIsAnySelected ', e);
  }

  dashboardData() {
    this.dashBoardWidget = this._DashboardWidgetsReportService.getDashBoardWidget();
    let sortedWidgets = this._DashboardWidgetsReportService.getWidget();
    sortedWidgets.forEach(x => {
      if (x.widget.length > 0) {
        let arr = x.widget.slice(0, x.widget.length);
        this.sortOrderPipe.transform(arr, 'order', 'aesc');
        x.widget = arr;
      }
    });
    this.widgetsData = sortedWidgets;
    this.widgetsData.forEach(widgetsDataLoop => {
      const dummyArr = [];
      widgetsDataLoop.widget.forEach(widgetLoop => {
        if (widgetLoop.allow) {
          dummyArr.push({ templateName: widgetLoop.title.title, checked: widgetLoop.show });
        } else {
          return;
        }
      });
      this.manageArr.push({ data: dummyArr, show: false });
    });
  }

  
  loopWidgetDropDownFrmControl($event, loopWidget, loopWidget_Index) {
    console.log($event, ' loopWidget - ', loopWidget, ' loopWidget_Index -', loopWidget_Index);
  }
  loopWidgetIsAnySelected($event, loopWidget, loopWidget_Index) {
    console.log($event, ' loopWidget - ', loopWidget, ' loopWidget_Index -', loopWidget_Index);
  }

  widgetIsAnySelected(controlName, e) {
    console.log('controlName ', controlName, ' e', e);
  };


  async getOutletsCount() {
    let outletsCount: DonutCount = await this._dashBoardBusiness.getOutletsCount();
    this.DB_OultetsChart_data = {
      data: {
        series: [outletsCount.inActive, outletsCount.active],
        captions: {
          courses: this.captions.Outlets,
          courseStatus: this.captions.Outlets,
          activeCourses: this.captions.activeOutlets,
          inactiveCourses: this.captions.inactiveOutlets
        },
        customStyles: {
          colors: ['#7d7b77', '#f5b507'],
          labelColor: '#c0c0c0',
        },
        Chartheight: this.dashBoardWidget[0].widget[0].config.height - 90, //60 - title height
      }
    };
  }

  async getVendorsCount(){
    let vendorsCount: DonutCount = await this._dashBoardBusiness.getVendorsCount();
    this.DB_VendorsChart_data = {
      data: {
        series: [vendorsCount.inActive, vendorsCount.active],
        captions: {
          courses: this.captions.vendors,
          courseStatus: this.captions.vendors,
          activeCourses: this.captions.activeVendors,
          inactiveCourses: this.captions.inactiveVendors
        },
        customStyles: {
          colors: ['#7d7b77', '#f5b507'],
          labelColor: '#c0c0c0',
        },
        Chartheight: this.dashBoardWidget[0].widget[0].config.height - 90, //60 - title height
      }
    };
  }



  getTotalSalesRevenue(){
    this.DB_TotalSalesRevenue_data = {
      // icon: 'icon-dashboard-tick',
      count: '$2.03M',
      description: this.captions.total_Sales_Revenue
    };
  }
 
  getNumberOfTransaction(){
    this.DB_NumberOfTransaction_data = {
      // icon: 'icon-dashboard-cross',
      count: '4.3M',
      description: this.captions.number_of_Transaction
    };
  }

  getAverageTransaction(){
    this.DB_AverageTransaction_data = {
      // icon: 'icon-new-user',
      count: '$62.36',
      description: this.captions.average_Transaction
    };
  }
  getAvgUnitPerCustomer(){
    this.DB_AvgUnitPerCustomer_data = {
      // icon: 'icon-swap1',
      count: '5.08',
      description: this.captions.unitPerCustomer
    };
  }


  async getTransactionSaleDetail() {
    this.Sales_SalesRevenue_data = await this._dashBoardBusiness.getTransactionSaleDetail(this.startDate, this.dataFormat, this.outletIds);
    if (this.Sales_SalesRevenue_data.length > 0) {
      let templateHeight = (this.widgetsData[0].widget[0].config.height - 90); //(60 - template title, 30 - chart needs)
      let barData, x_categories, columnWidth;
      barData = this.Sales_SalesRevenue_data;
      x_categories = this.Sales_SalesRevenue_data.map(x => x.name);
      columnWidth = x_categories.length < 5 ? '20%' : '30%';
      let barChart_customStyles = {
        fillColor: '#1a634c',
        backgroundBarColors: ['#a8ada8'],
        backgroundBarOpacity: 0.3,
        columnWidth: columnWidth,
        hoverColor: '#F46BCA'
      };

      let barChartCaptions = {
        x_label: this.rowDescription,
        y_label: this.captions.revenue_dollar,
        NoOfTransactions: this.captions.NoOfTransactions,
        currencySymbol: this.captions.currencySymbol,
      }
      this._ChartBarComponent.callBarChart(barData, x_categories, templateHeight, barChartCaptions, barChart_customStyles);
    }
  }


  async getRevenueByOultetDetail() {
    this.Revenue_By_Outlet_data = await this._dashBoardBusiness.getTransactionSaleDetail(this.startDate, this.dataFormat, this.outletIds);
    if (this.Revenue_By_Outlet_data.length > 0) {
      let templateHeight = (this.widgetsData[0].widget[0].config.height - 90); //(60 - template title, 30 - chart needs)
      let barData, x_categories, columnWidth;
      barData = this.Revenue_By_Outlet_data;
      x_categories = this.Revenue_By_Outlet_data.map(x => x.name);
      columnWidth = x_categories.length < 5 ? '20%' : '30%';
      let barChart_customStyles = {
        fillColor: '#1a634c',
        backgroundBarColors: ['#a8ada8'],
        backgroundBarOpacity: 0.3,
        columnWidth: columnWidth,
        hoverColor: '#F46BCA'
      };

      let barChartCaptions = {
        x_label: this.rowDescription,
        y_label: this.captions.revenue_dollar,
        NoOfTransactions: this.captions.NoOfTransactions,
        currencySymbol: this.captions.currencySymbol,
      }
      this._ChartBarComponent.callBarChart(barData, x_categories, templateHeight, barChartCaptions, barChart_customStyles);
    }
  }
  

  async getReturned_ItemsDetail() {
    this.Returned_Items_data = await this._dashBoardBusiness.getTransactionSaleDetail(this.startDate, this.dataFormat, this.outletIds);
    if (this.Returned_Items_data.length > 0) {
      let templateHeight = (this.widgetsData[0].widget[0].config.height - 90); //(60 - template title, 30 - chart needs)
      let barData, x_categories, columnWidth;
      barData = this.Returned_Items_data;
      x_categories = this.Returned_Items_data.map(x => x.name);
      columnWidth = x_categories.length < 5 ? '20%' : '30%';
      let barChart_customStyles = {
        fillColor: '#1a634c',
        backgroundBarColors: ['#a8ada8'],
        backgroundBarOpacity: 0.3,
        columnWidth: columnWidth,
        hoverColor: '#F46BCA'
      };

      let barChartCaptions = {
        x_label: this.rowDescription,
        y_label: this.captions.revenue_dollar,
        NoOfTransactions: this.captions.NoOfTransactions,
        currencySymbol: this.captions.currencySymbol,
      }
      this._ChartBarComponent.callBarChart(barData, x_categories, templateHeight, barChartCaptions, barChart_customStyles);
    }
  }


  async getTop5ItemSaleDetail(mountaintype) {
    console.log('mountaintype ', mountaintype);
    this.Sales_Top5Items_data = {
      // data: [{ id: 1, value: "getSales_Top5Items" }],
      data: await this._dashBoardBusiness.getItemSaleDetail(this.itemStartDate, this.itemEndDate, this.outletIds),
      headerData: [
        { key: 'name', description: 'Number', alignment: 'textLeft', },
        { key: 'amount', description: 'Status', alignment: 'textRight font-bold' }
      ],
      headerEnable: false,
      footerClassName: mountaintype + ' footer-green'
    };

  }


  async getCategorySaleDetail(mountaintype_1) {
    console.log('mountaintype ', mountaintype_1);
    this.Sales_Top5Categories_data = {
      // data: [
      //   { id: 1, value: "Sales_SalesRevenue" }
      // ],
      data: await this._dashBoardBusiness.getCategorySaleDetail(this.categoryStartDate, this.categoryEndDate, this.outletIds),
      headerData: [
        { key: 'name', description: 'Number', alignment: 'textLeft', },
        { key: 'amount', description: 'Status', alignment: 'textRight font-bold' }
      ],
      headerEnable: false,
      footerClassName: mountaintype_1 + ' footer-yellow'
    }
  }






  dashBoardCheckboxChange(widgetsData_Index, loopManage_Index, event, from) {
    // console.log(' widgetsData_Index ', widgetsData_Index, ' loopManage_Index ', loopManage_Index, 'dashBoardCheckboxChange event ', event);
    this.widgetsData[widgetsData_Index].widget[loopManage_Index].show = (from == 'event') ? event.target.checked : event;
    let arr = [];
    this.widgetsData[widgetsData_Index].widget.forEach((element, index) => {
      if (element.show) {
        arr.push({ 'classname': element.template.name, 'index': index, 'initialWidth': element.config.width, 'parentClass': element.parentClass });
      }
    });

    let isPreviousFullWidth = true;
    let position = 1;

    arr.forEach((element, index, array) => {
      // as per PMS dashboard, changed the code
      let tag = (document.getElementsByClassName(element.classname)[0]) as HTMLElement;
      if ((array.length == 1) || (index == array.length - 1 && array.length % 2 != 0)) {
        if (array.length > 1 && index == array.length - 1) {
          if (isPreviousFullWidth && position == 1) {
            tag.style.width = '100%';
            element.initialWidth = 100;
            isPreviousFullWidth = true;
            position = 1;
          } else {
            tag.style.width = (100 - array[index - 1].initialWidth) + '%';
            element.initialWidth = (100 - array[index - 1].initialWidth);
            isPreviousFullWidth = true;
            position = 1;
          }
        } else {
          tag.style.width = '100%';
          element.initialWidth = 100;
          isPreviousFullWidth = true;
          position = 1;
        }
      } else {
        let checkPreviousWidgetWidth = (index - 1 < 0) ? 100 : array[index - 1].initialWidth;
        let checkNextWidgetWidth = (index + 1 >= array.length) ? 0 : array[index + 1].initialWidth;
        if ((array.length == 1) || (index == array.length - 1 && array.length % 2 != 0)) {
          if (position == 1) {
            tag.style.width = '100%';
            element.initialWidth = element.initialWidth;
          } else if (position == 2 && checkPreviousWidgetWidth < 60) {
            tag.style.width = (100 - checkPreviousWidgetWidth) + '%';
            element.initialWidth = (100 - checkPreviousWidgetWidth);
          }
          isPreviousFullWidth = true;
          position = 1;
        } else {
          // set initial Width of first widget From Service
          if (index == 0) {
            element.initialWidth = this.widgetsData[widgetsData_Index].widget[element.index].config.width;
          }
          let currentElementWidth = element.initialWidth;
          if (checkPreviousWidgetWidth === 100) {
            if ((currentElementWidth == 60 && checkNextWidgetWidth == 40) ||
              (currentElementWidth == 40 && checkNextWidgetWidth == 60) ||
              (currentElementWidth == 50 && checkNextWidgetWidth == 50) ||
              (currentElementWidth == 40)
            ) {
              tag.style.width = element.initialWidth + '%';
              element.initialWidth = element.initialWidth;
              isPreviousFullWidth = false;
              position++;
            } else {
              tag.style.width = '100%';
              element.initialWidth = 100;
              isPreviousFullWidth = true;
              position == 1;
            }
          } else {
            if (isPreviousFullWidth && position == 1 && checkNextWidgetWidth > 60) {
              tag.style.width = '100%';
              element.initialWidth = 100;
              isPreviousFullWidth = true;
              position == 1;
            } else if (isPreviousFullWidth && position == 1 && checkNextWidgetWidth <= 60) {

              if (checkNextWidgetWidth == 0) {
                tag.style.width = '100%';
                element.initialWidth = 100;
                isPreviousFullWidth = true;
                position == 1;
              } else if (currentElementWidth < 60) {
                tag.style.width = element.initialWidth + '%';
                element.initialWidth = element.initialWidth;
                isPreviousFullWidth = false;
                position++;
              } else {
                tag.style.width = '100%';
                element.initialWidth = 100;
                isPreviousFullWidth = true;
                position == 1;
              }
            } else if (!isPreviousFullWidth && position == 1 && checkNextWidgetWidth > 60) {
              tag.style.width = '100%';
              element.initialWidth = 100;
              isPreviousFullWidth = true;
              position == 1;
            } else if (!isPreviousFullWidth && position == 1 && checkNextWidgetWidth <= 60) {

              if (currentElementWidth < 60) {
                tag.style.width = element.initialWidth + '%';
                element.initialWidth = element.initialWidth;
                isPreviousFullWidth = false;
                position++;

              } else {
                tag.style.width = '100%';
                element.initialWidth = 100;
                isPreviousFullWidth = true;
                position == 1;
              }
            } else if (position == 2 && checkPreviousWidgetWidth < 60) {
              tag.style.width = (100 - checkPreviousWidgetWidth) + '%';
              element.initialWidth = (100 - checkPreviousWidgetWidth);
              isPreviousFullWidth = true;
              position = 1;
            } else {
              tag.style.width = element.initialWidth + '%';
              element.initialWidth = element.initialWidth;
              isPreviousFullWidth = true;
              position = 1;
            }
          }
        }
      }
    });
  }



}


