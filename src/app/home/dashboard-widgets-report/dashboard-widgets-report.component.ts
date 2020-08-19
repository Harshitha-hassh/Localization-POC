import { Component, OnInit, ViewEncapsulation, ViewChild, ChangeDetectorRef, Output, Input, EventEmitter, ComponentRef, ElementRef } from '@angular/core';
import { DashboardWidgetsReportService } from './dashboard-widgets-report.service';
import { DashBoardBusiness } from './dashboard-business';
// import { Utilities } from 'src/app/shared/utilities/utilities';
import { Localization } from 'src/app/core/localization/Localization';
// import { DashBoardService } from 'src/app/shared/data-services/golfschedule/dashboard.data.service';
// import { CourseDataService } from 'src/app/shared/data-services/golfmanagement/course.data.service';
import { OutletOption } from './dashboard.modal';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import * as moment from 'moment';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
// import { DateInput, TimeInput, ComponentDetails, AlertType, ButtonType } from 'src/app/shared/shared-models';
// import { ButtonValue } from 'src/app/shared/models/button-type.model';
// import { TeeSheetTableID, TeeSheetCustomData, TeeSheetSkeletonData } from 'src/app/shared/models/teesheet.form.models';
import { Observable, Subscription } from 'rxjs';
// import { TeeSheetDashboard } from 'src/app/tee-time/shared/tee-sheet/tee-sheet.dashboard';
// import { AllocationBlockDataService } from 'src/app/shared/data-services/golfschedule/allocationblock.data.service';
// import { DefaultUserConfigDataService } from 'src/app/settings/utilities/manager-utilities/default-user-config/default-user-config.data.service';
// import { FromTypeenum } from 'src/app/shared/tablevirtualscroll/tablevirtualscroll.model';
// import { TeeTimeConfigDataService } from 'src/app/shared/data-services/golfmanagement/teetime-config.data.service';
// import { TeeTimeComponent } from 'src/app/tee-time-actions/teetime/tee-time.component';
import { MatDialog } from '@angular/material';
// import { ChartBarComponent } from '../chart-bar/chart-bar.component';
// import { GolfUserConfigDataService } from 'src/app/shared/data-services/golfmanagement/golfuser.config.data';
// import { UserConfiguration } from 'src/app/shared/models/tenant.models';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
// import { Weather } from '../dashboard-weather/dashboard-weather.modal';
// import { PropertyDataService } from 'src/app/settings/system-setup/property-info/property.data.service';
// import { UserAccessBusiness } from 'src/app/shared/data-services/authentication/useraccess.business';
// import { UserAccessBreakPoints } from 'src/app/shared/constants/useraccess.constants';
// import { RateTypeDataService } from 'src/app/shared/data-services/golfschedule/ratetype.data.service';
import { SortOrderPipe } from 'src/app/common/shared/shared/pipes/sort-order.pipe';

@Component({
  selector: 'app-dashboard-widgets-report',
  templateUrl: './dashboard-widgets-report.component.html',
  styleUrls: ['./dashboard-widgets-report.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [DashboardWidgetsReportService, DashBoardBusiness,SubPropertyDataService]
    //  DashBoardService, CourseDataService, , 
    //  AllocationBlockDataService, TeeSheetDashboard, DefaultUserConfigDataService,
    //   TeeTimeConfigDataService, ChartBarComponent, GolfUserConfigDataService, PropertyDataService, RateTypeDataService]

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
  bookingPopupSubscription: Subscription;
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
  isoCountries: any;
  defaultSelectedWeather: number = 0;
  lineDrew: boolean = false;

  @ViewChild('Sales_Revenue', { static: false }) Sales_Revenue;
  @ViewChild('Out_of_StockItems', { static: false }) Out_of_StockItems;
  @ViewChild('Revenue_By_Outlet', { static: false }) Revenue_By_Outlet;
  @ViewChild('Sales_Top5Items', { static: false }) Sales_Top5Items;
  @ViewChild('Sales_Top5Categories', { static: false }) Sales_Top5Categories;
  @ViewChild('Purchase_Order', { static: false }) Purchase_Order;
  @ViewChild('Open_Tickets', { static: false }) Open_Tickets;
  @ViewChild('Returned_Items', { static: false }) Returned_Items;

  







  @ViewChild('CourseDetails_Utilization', { static: false }) CourseDetails_Utilization;
  @ViewChild('CourseDetails_TeeTimes', { static: false }) CourseDetails_TeeTimes;
  @ViewChild('CourseDetails_Upcoming_Tournaments', { static: false }) CourseDetails_Upcoming_Tournaments;
  @ViewChild('CourseDetails_Waitllist', { static: false }) CourseDetails_Waitllist;
  @ViewChild('CourseDetails_Lessons', { static: false }) CourseDetails_Lessons;
  @ViewChild('Sales_SalesRevenue', { static: false }) Sales_SalesRevenue;
  
 
  @ViewChild('DB_CourseStatus', { static: false }) DB_CourseStatus;
  @ViewChild('DB_Available_TeeTimes', { static: false }) DB_Available_TeeTimes;
  @ViewChild('DB_Cancelled_TeeTimes', { static: false }) DB_Cancelled_TeeTimes;
  @ViewChild('DB_New_Players', { static: false }) DB_New_Players;
  @ViewChild('DB_Repeat_Players', { static: false }) DB_Repeat_Players;
  @ViewChild('DB_Weather', { static: false }) DB_Weather;


  CourseDetails_Utilization_data: any;

  CourseDetails_Upcoming_Tournaments_data: any;
  CourseDetails_Waitllist_data: any;
  CourseDetails_Lessons_data: any;
  Sales_SalesRevenue_data: any;
  Sales_Revenue_data: any;
  Sales_Top5Items_data: any;
  Sales_Top5Categories_data: any;
  DB_CourseStatus_data: any;
  DB_Available_TeeTimes_data: any;
  DB_Cancelled_TeeTimes_data: any;
  DB_New_Players_data: any;
  DB_Repeat_Players_data: any;
  // DB_Weather_data: any;

  // buttonValueprimary: ButtonValue;
  // lineForm: FormGroup;
  // lineDateInputs: DateInput;
  // line_startTimeInputs: TimeInput;
  // line_endTimeInputs: TimeInput;
  // lineCaptions: any;
  // lineChartOptions: any;
  // updateLineChartData: any;
  // lineChart_Categories: any[];
  // lineChart_content: any[];
  // lineChart_customStyles: any;
  // isSafari: any;
  // userAccessBreakPoints: userAccessModel.BreakPointResult[];
  // weatherErrorResult: any;
  sortOrderPipe: SortOrderPipe;
  constructor(private cdr: ChangeDetectorRef,
     public _DashboardWidgetsReportService: DashboardWidgetsReportService, 
    //  private _userAccessBusiness: UserAccessBusiness,
      private _dashBoardBusiness: DashBoardBusiness,
    // private _utilities: Utilities, 
    private _localization: Localization, private _router: Router, private _fb: FormBuilder, 
    private dialog: MatDialog,
    //  private _ChartBarComponent: ChartBarComponent,
    private _propertyInformation: PropertyInformation) {
    // this.isSafari = _utilities.findUserAgent();
    this.sortOrderPipe = new SortOrderPipe();
  }

  ngOnInit() {
    // this.userId = Number(this._utilities.GetsessionStorageValue('_userInfo', 'userId'));
    this.propertyDateTime = this._propertyInformation.CurrentDate;
    //this.propertyDateTime = new Date("November 05, 2019 01:15:00");
    // this.propertyDate = this._utilities.resetTime(this.propertyDateTime);
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

    this.BindData();

    this.rowDescription = this.captions.DAY;
    this.dashBoardform = this._fb.group({
      dashBoardHeadOutlet: '',
      SalesHeadOutlet: ''
    });

    this.DB_Available_TeeTimes_data = {
      // icon: 'icon-dashboard-tick',
      count: '$2.03M',
      description: this.captions.total_Sales_Revenue
    };

    this.DB_Cancelled_TeeTimes_data = {
      // icon: 'icon-dashboard-cross',
      count: '4.3M',
      description: this.captions.number_of_Transaction
    };

    this.DB_New_Players_data = {
      // icon: 'icon-new-user',
      count: '$62.36',
      description: this.captions.average_Transaction
    };

    this.DB_Repeat_Players_data = {
      // icon: 'icon-swap1',
      count: '5.08',
      description: this.captions.test
    };

  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.bookingPopupSubscription !== undefined) {
      this.bookingPopupSubscription.unsubscribe();
    }
    this.cdr.detach();
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

  dashBoardCheckboxChange(widgetsData_Index, loopManage_Index, event, from) {
    console.log(' widgetsData_Index ', widgetsData_Index, ' loopManage_Index ', loopManage_Index, 'dashBoardCheckboxChange event ', event);
    this.widgetsData[widgetsData_Index].widget[loopManage_Index].show = (from == 'event') ? event.target.checked : event;
    let arr = [];
    this.widgetsData[widgetsData_Index].widget.forEach((element, index) => {
      if (element.show) {
        arr.push({ 'classname': element.template.name, 'index': index, 'initialWidth': element.config.width, 'parentClass': element.parentClass });
      }
    });
    arr.forEach((element, index, array) => {
      // as per PMS dashboard changed the code
      //single data and last data with odd index
      
      let tag = (document.getElementsByClassName(element.classname)[0]) as HTMLElement;
      if ((array.length == 1) || (index == array.length - 1 && array.length % 2 != 0)) {
        console.log('----index ', index );
        tag.style.width = '100%';
      } else{
        console.log('---', index,'---------' );
       let checkPreviousWidgetWidth =  (index-1 < 0 ) ? 0 : array[index-1].initialWidth;
       let checkNextWidgetWidth = (index+1  >= array.length ) ? 0 : array[index+1].initialWidth;

       let currentElementWidth = element.initialWidth;

      //  console.log('checkPreviousWidgetWidth ',checkPreviousWidgetWidth);
      //  console.log('checkNextWidgetWidth ',checkNextWidgetWidth);
      //  console.log('currentElementWidth ',currentElementWidth);
       
       const addWithPreviousLine = Number(checkPreviousWidgetWidth) + Number(currentElementWidth);
       const addWithNextLine = Number(checkNextWidgetWidth) + Number(currentElementWidth);

       const checkPreviousSpace = addWithPreviousLine <= 100 ;
       const checkNextSpace = addWithNextLine <= 100 ;

       console.log('checkPreviousSpace ',checkPreviousSpace,' : ',addWithPreviousLine);
       console.log('checkNextSpace ',checkNextSpace,' :',addWithNextLine);

    

       
      if(checkPreviousSpace && checkNextSpace){
        console.log(checkPreviousSpace ,' 1 && ',checkNextSpace, element.initialWidth+ '%');
        tag.style.width = element.initialWidth+ '%';
      }else if(checkPreviousSpace && !checkNextSpace){
        console.log(checkPreviousSpace ,' 2 && ',!checkNextSpace);

        tag.style.width = element.initialWidth+ '%';
      }else if(!checkPreviousSpace && checkNextSpace){
        console.log(!checkPreviousSpace ,' 3 && ',checkNextSpace);
        // tag.style.width ='100%';
      }else if(!checkPreviousSpace && !checkNextSpace){
        console.log(!checkPreviousSpace ,' 4 && ',!checkNextSpace ,'100%');
        tag.style.width ='100%';
      }

          



     

      
      

      //  if(
      //    (100 - checkPreviousWidgetWidth) == element.initialWidth &&
      //     (100 - element.initialWidth) == checkNextWidgetWidth 
      //   ){
          // console.log(
          //   (100 - checkPreviousWidgetWidth),' == ',element.initialWidth,
          //   (100 - element.initialWidth),' == ',checkNextWidgetWidth,
          //   (100 - checkPreviousWidgetWidth) == element.initialWidth &&
          //   (100 - element.initialWidth) == checkNextWidgetWidth 
          // );
      //     tag.style.width = element.initialWidth+ '%'; // : '60%';
      //  }else if(
      //   (100 - checkPreviousWidgetWidth) < element.initialWidth && 
      //   (100 - element.initialWidth) > checkNextWidgetWidth 
      //  ){
      //   console.log(
      //     (100 - checkPreviousWidgetWidth),' < ',element.initialWidth,
      //     (100 - element.initialWidth),' > ',checkNextWidgetWidth,
      //     (100 - checkPreviousWidgetWidth) < element.initialWidth &&
      //     (100 - element.initialWidth) > checkNextWidgetWidth 
      //   );
      //   tag.style.width = element.initialWidth+'%'; 
      // }else if(
      //   (100 - checkPreviousWidgetWidth) > element.initialWidth && 
      //   (100 - element.initialWidth) < checkNextWidgetWidth 
      //  ){
      //   console.log(
      //     (100 - checkPreviousWidgetWidth),' > ',element.initialWidth,
      //     (100 - element.initialWidth),' < ',checkNextWidgetWidth,
      //     (100 - checkPreviousWidgetWidth) > element.initialWidth && 
      //   (100 - element.initialWidth) < checkNextWidgetWidth 
      //   );
      //   tag.style.width = '100%'; 
      // }
     }
    });
  }

  manage(widgetsData_Index) {
    console.log("manage ",widgetsData_Index);
    this.manageArr[widgetsData_Index].show = !this.manageArr[widgetsData_Index].show;
    console.log('widgetsData_Index ', widgetsData_Index);
  }

  widgetHeaderDropDownChange(widgetsData_Index, loopWidget_Index, e) {
    this.teeTimeCourseId = e.value;
    // this.getData(this.teeTimeCourseId, this.propertyDate);
    console.log('widgetHeaderDropDownChange ', e, ' widgetsData_Index ', widgetsData_Index, ' widgetsData_Index ', loopWidget_Index);
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
    // this.dashboardCourseIds = e.map(x => x.id);
    console.log('dashBoardIsAnySelected ', e);
  }

  dashboardData() {
    this.dashBoardWidget = this._DashboardWidgetsReportService.getDashBoardWidget();

    let sortedWidgets = this._DashboardWidgetsReportService.getWidget();
    sortedWidgets.forEach(x=>{
      if(x.widget.length > 0){
        let arr = x.widget.slice(0, x.widget.length);
        this.sortOrderPipe.transform(arr, 'order', 'aesc');
        x.widget = arr;
      }
    });
    this.widgetsData = sortedWidgets; 
    this.widgetsData.forEach(widgetsDataLoop => {
      const dummyArr = [];
      widgetsDataLoop.widget.forEach(widgetLoop => {
        // if (widgetLoop.allow) {
          dummyArr.push({ templateName: widgetLoop.title.title, checked: widgetLoop.show });
        // } else {
        //   return;
        // }
        
      });
      this.manageArr.push({ data: dummyArr, show: false });
    });

    

    // let setAlignment = setTimeout(() => {
    //   let alignCourse = (this.widgetsData[0].widget.length > 0) ? this.dashBoardCheckboxChange(0, 0, this.widgetsData[0].widget[0].show, 'ts') : '';
    //   let alignSales = (this.widgetsData[0].widget.length > 0) ? this.dashBoardCheckboxChange(1, 0, this.widgetsData[1].widget[0].show, 'ts') : '';
    //   clearTimeout(setAlignment);
    // }, 1);
  }

  async BindData() {
    this.dashboardData();
  }



 loopWidgetDropDownFrmControl($event,loopWidget,loopWidget_Index){
    console.log($event,' loopWidget - ',loopWidget,' loopWidget_Index -',loopWidget_Index);
 } 
  loopWidgetIsAnySelected($event,loopWidget,loopWidget_Index){
    console.log($event,' loopWidget - ',loopWidget,' loopWidget_Index -',loopWidget_Index);
  }
 // DashboardheaderDropDownChange(widgetsData_Index, e, options) {
  //   console.log('DashboardheaderDropDownChange', e, ' widgetsData_Index ', widgetsData_Index, ' options ', options);

  // }
  // DashboardheaderAllClick(widgetsData_Index, e, options) {
  //   console.log('DashboardheaderAllClick', e, ' widgetsData_Index ', widgetsData_Index, ' options ', options);
  // }

  // CourseDetails_Upcoming_Tournaments_rowEmitter(e) {
  //   console.log("CourseDetails_Upcoming_Tournaments_rowEmitter ", e);
  //   this._router.navigate([`tee-time/tournaments`], { queryParams: { id: e[0].id } });
  // }


  // CourseDetails_Lessons_rowEmitter(e) {
  //   console.log("CourseDetails_Lessons_rowEmitter ", e);
  //   let index = e[1];
  //   this.CourseDetails_Upcoming_Tournaments_data[index];
  //   this._router.navigate([`tee-time/tournaments`], { queryParams: { id: this.CourseDetails_Upcoming_Tournaments_data[index] } });
  // }

  // async getCourseCount() {
  //   let courseData: CourseCount = await this._dashBoardBusiness.getCourseCount();
  //   this.DB_CourseStatus_data = {
  //     data: {
  //       series: [courseData.inActiveCourses, courseData.activeCourses],
  //       captions: {
  //         courses: this.captions.courses,
  //         courseStatus: this.captions.courseStatus,
  //         activeCourses: this.captions.activeCourses,
  //         inactiveCourses: this.captions.inactiveCourses
  //       },
  //       customStyles: {
  //         colors: ['#7d7b77', '#f5b507'],
  //         labelColor: '#c0c0c0',
  //       },
  //       Chartheight: this.dashBoardWidget[0].widget[0].config.height - 90, //60 - title height
  //     }
  //   };
  // }

  // async getTeeTimesCount() {

  //   let teeTimesCount = await this._dashBoardBusiness.getTeeTimesCount(this.propertyDate, this.dashboardCourseIds);
  //   this.DB_Available_TeeTimes_data.count = teeTimesCount.availableTeeTimesCount;
  //   this.DB_Cancelled_TeeTimes_data.count = teeTimesCount.cancelledTeeTimesCount;
  // }

  // async getPlayersCount() {

  //   let playersCount = await this._dashBoardBusiness.getPlayersCount(this.propertyDate, this.dashboardCourseIds);
  //   this.DB_New_Players_data.count = playersCount.newPlayersCount;
  //   this.DB_Repeat_Players_data.count = playersCount.repeatPlayersCount;
  // }

  // async getUpComingTournaments() {
  //   let result: userAccessModel.BreakPointResult = this.userAccessBreakPoints.find(x => x.breakPointNumber == UserAccessBreakPoints.TOURNAMENTS);
  //   if (!result.isAllow && !result.isViewOnly) {
  //     return;
  //   }
  //   this.CourseDetails_Upcoming_Tournaments_data = {
  //     data: await this._dashBoardBusiness.getUpComingTournaments(this.propertyDateTime, this.courseIds),
  //     headerData: [
  //       { key: 'eventName', description: this.captions.eventName, alignment: 'textLeft font-bold w-25' },
  //       { key: 'date', description: this.captions.date, alignment: 'textLeft font-bold w-25' },
  //       { key: 'course', description: this.captions.course, alignment: 'textLeft font-bold w-25' },
  //       { key: 'players', description: this.captions.players, alignment: 'textRight font-bold w-25', customClass: 'greenText', showArrow: true }
  //     ],
  //     headerEnable: true
  //   };
  // }

  // async getWaitlists() {
  //   let result: userAccessModel.BreakPointResult = this.userAccessBreakPoints.find(x => x.breakPointNumber == UserAccessBreakPoints.VIEWWAITLIST);
  //   if (!result.isAllow && !result.isViewOnly) {
  //     return;
  //   }

  //   this.CourseDetails_Waitllist_data = {
  //     data: await this._dashBoardBusiness.getWaitlists(this.propertyDateTime, this.courseIds),
  //     headerData: [
  //       { key: 'player', description: this.captions.player, alignment: 'textLeft font-bold w-25' },
  //       { key: 'date', description: this.captions.date, alignment: 'textLeft font-bold w-25' },
  //       { key: 'course', description: this.captions.course, alignment: 'textLeft font-bold w-25' },
  //       { key: 'phoneNumber', description: this.captions.phoneNumber, alignment: 'textRight font-bold w-25' }
  //     ],
  //     headerEnable: true
  //   };
  // }

  // async getCourseUtilization() {
  //   this.courseUtilizationData = await this._dashBoardBusiness.getCourseUtilization(this.courseDate, this.courseId, this.startTime, this.endTime);
  //   this.lineChart_Categories = this.courseUtilizationData.map(d => d.date);
  //   let lineData = this.courseUtilizationData.map(c => { return { value: this._localization.localizePercentage(c.percentage), Booked: c.Booked, Available: c.Available } })
  //   if (this.lineDrew) {
  //     this.updateLineChartData = [lineData, this.lineCaptions];
  //   } else {
  //     this.lineChart_content = lineData;
  //     this.lineCaptions = {
  //       booking: this.captions.booking,
  //       date: this.captions.date,
  //       booked: this.captions.booked,
  //       avail: this.captions.avail
  //     };
  //     this.lineChart_customStyles = {
  //       type: this.isSafari == 'Safari' ? 'line' : 'area',
  //       strokeColors: ["#26ebc0"],
  //       fillColor: "#26ebc0",
  //       borderColor: "#c4c2be",
  //       chartHeight: this.widgetsData[0].widget[0].config.height - 200    //100-form height, 60-title height ,32-padding
  //     };
  //     this.lineDrew = true;
  //   }
  // }

  // async getItemSaleDetail(mountaintype) {
  //   console.log('mountaintype ', mountaintype);
  //   this.Sales_Top5Items_data = {
  //     // data: [{ id: 1, value: "getSales_Top5Items" }],
  //     // data: await this._dashBoardBusiness.getItemSaleDetail(this.itemStartDate, this.itemEndDate, this.outletIds),
  //     headerData: [
  //       { key: 'name', description: 'Number', alignment: 'textLeft', },
  //       { key: 'amount', description: 'Status', alignment: 'textRight font-bold' }
  //     ],
  //     headerEnable: false,
  //     footerClassName: mountaintype + ' footer-green'
  //   };

  // }

  // async getOutletSaleDetail() {

  //   this.Sales_Revenue_data = await this._dashBoardBusiness.getOutletSaleDetail(this.outletStartDate, this.outletEndDate, this.outletIds);
  // }

  // async getCategorySaleDetail(mountaintype_1) {
  //   console.log('mountaintype ', mountaintype_1);
  //   this.Sales_Top5Categories_data = {
  //     // data: [
  //     //   { id: 1, value: "Sales_SalesRevenue" }
  //     // ],
  //     data: await this._dashBoardBusiness.getCategorySaleDetail(this.categoryStartDate, this.categoryEndDate, this.outletIds),
  //     headerData: [
  //       { key: 'name', description: 'Number', alignment: 'textLeft', },
  //       { key: 'amount', description: 'Status', alignment: 'textRight font-bold' }
  //     ],
  //     headerEnable: false,
  //     footerClassName: mountaintype_1 + ' footer-yellow'
  //   }
  // }


  // async getTransactionSaleDetail() {
  //   this.Sales_SalesRevenue_data = await this._dashBoardBusiness.getTransactionSaleDetail(this.startDate, this.dataFormat, this.outletIds);
  //   if (this.Sales_SalesRevenue_data.length > 0) {
  //     let templateHeight = (this.widgetsData[0].widget[0].config.height - 90); //(60 - template title, 30 - chart needs)
  //     let barData, x_categories, columnWidth;
  //     barData = this.Sales_SalesRevenue_data;
  //     x_categories = this.Sales_SalesRevenue_data.map(x => x.name);
  //     columnWidth = x_categories.length < 5 ? '20%' : '30%';
  //     let barChart_customStyles = {
  //       fillColor: '#1a634c',
  //       backgroundBarColors: ['#a8ada8'],
  //       backgroundBarOpacity: 0.3,
  //       columnWidth: columnWidth,
  //       hoverColor: '#F46BCA'
  //     };

  //     let barChartCaptions = {
  //       x_label: this.rowDescription,
  //       y_label: this.captions.revenue_dollar,
  //       NoOfTransactions: this.captions.NoOfTransactions,
  //       currencySymbol: this.captions.currencySymbol,
  //     }
  //     this._ChartBarComponent.callBarChart(barData, x_categories, templateHeight, barChartCaptions, barChart_customStyles);
  //   }
  // }

 

  // async getDataSelectionChange(widget: number, loop: number, dataFormat: number, description, templateName) {
  //   if (dataFormat == this.numericZero && loop == this.numericOne) {
  //     this.outletStartDate = this.propertyDate;
  //     this.outletEndDate = this.propertyDate;
  //   }
  //   else if (dataFormat == this.numericOne && loop == this.numericOne) {
  //     this.outletStartDate = moment(this.propertyDate).startOf('week').toDate();
  //     this.outletEndDate = moment(this.propertyDate).endOf('week').toDate();
  //   }
  //   else if (dataFormat == this.numericTwo && loop == this.numericOne) {
  //     this.outletStartDate = moment(this.propertyDate).startOf('month').toDate();
  //     this.outletEndDate = moment(this.propertyDate).endOf('month').toDate();
  //   }
  //   else if (dataFormat == this.numericZero && loop == this.numericTwo) {
  //     this.itemStartDate = this.propertyDate;
  //     this.itemEndDate = this.propertyDate;
  //   }
  //   else if (dataFormat == this.numericOne && loop == this.numericTwo) {
  //     this.itemStartDate = moment(this.propertyDate).startOf('week').toDate();
  //     this.itemEndDate = moment(this.propertyDate).endOf('week').toDate();
  //   }
  //   else if (dataFormat == this.numericTwo && loop == this.numericTwo) {
  //     this.itemStartDate = moment(this.propertyDate).startOf('month').toDate();
  //     this.itemEndDate = moment(this.propertyDate).endOf('month').toDate();
  //   }
  //   else if (dataFormat == this.numericZero && loop == this.numericThree) {
  //     this.categoryStartDate = this.propertyDate;
  //     this.categoryEndDate = this.propertyDate;
  //   }
  //   else if (dataFormat == this.numericOne && loop == this.numericThree) {
  //     this.categoryStartDate = moment(this.propertyDate).startOf('week').toDate();
  //     this.categoryEndDate = moment(this.propertyDate).endOf('week').toDate();
  //   }
  //   else if (dataFormat == this.numericTwo && loop == this.numericThree) {
  //     this.categoryStartDate = moment(this.propertyDate).startOf('month').toDate();
  //     this.categoryEndDate = moment(this.propertyDate).endOf('month').toDate();
  //   }

  //   switch (templateName) {
  //     case 'Sales_SalesRevenue':
  //       this.dataFormat = dataFormat + 1;
  //       if (this.dataFormat == 1) {
  //         this.rowDescription = this.captions.DAY;
  //       } else if (this.dataFormat == 2) {
  //         this.rowDescription = this.captions.WEEK;
  //       } else if (this.dataFormat == 3) {
  //         this.rowDescription = this.captions.MONTH;
  //       }
  //       await this.getTransactionSaleDetail();
  //       break;
  //     case 'Sales_Revenue':
  //       await this.getOutletSaleDetail();
  //       break;
  //     case 'Sales_Top5Items':
  //       let mountaintype_0: String = '';
  //       if (dataFormat == this.numericZero) {
  //         mountaintype_0 = 'day_0';
  //       } else if (dataFormat == this.numericOne) {
  //         mountaintype_0 = 'week_0';
  //       } else if (dataFormat == this.numericTwo) {
  //         mountaintype_0 = 'month_0';
  //       }
  //       await this.getItemSaleDetail(mountaintype_0);
  //       break;
  //     case 'Sales_Top5Categories':
  //       let mountaintype_1: String = '';
  //       if (dataFormat == this.numericZero) {
  //         mountaintype_1 = 'day_1';
  //       } else if (dataFormat == this.numericOne) {
  //         mountaintype_1 = 'week_1';
  //       } else if (dataFormat == this.numericTwo) {
  //         mountaintype_1 = 'month_1';
  //       }
  //       await this.getCategorySaleDetail(mountaintype_1);
  //       break;

  //     default:
  //       break;
  //   }
  // }


  widgetIsAnySelected(controlName, e) {
      console.log('controlName ',controlName, ' e',e);
  };

  
  // lineChartUpdate() {
  //   console.log("lineChartUpdate ", this.lineForm.value);
  //   this.getCourseUtilization();
  // }

  // dateChanged(e) {
  //   this.courseDate = e[0].value.lineDate;
  //   console.log("dateChanged ", e);
  // }

  // timeChange(event, type) {
  //   if (type == 'startTime') {
  //     this.startTime = this._dashBoardBusiness.getAPItimeFromTimePicker(event[0].value.line_startTime);
  //     this.line_endTimeInputs.minTime = event[0].controls[event[1]].value;
  //     this.line_endTimeInputs = { ...this.line_endTimeInputs };
  //     this.lineForm.controls.line_endTime.markAsTouched();
  //   }
  //   else if (type == 'endtime') {
  //     this.endTime = this._dashBoardBusiness.getAPItimeFromTimePicker(event[0].value.line_endTime);
  //   }
  // }

  // lineCourseChange(e) {
  //   this.courseId = e.value;
  //   console.log("lineCourseChange ", e);
  // }

  // async onmoreEvent(e) {
  //   console.log("More Event", e);
  //   let result: userAccessModel.BreakPointResult = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.BOOKTEETIME, true);
  //   if (!result.isAllow && !result.isViewOnly) {
  //     return;
  //   }
  //   const userConfiguration = await this.userConfiguration;
  //   const courseConfiguration = userConfiguration.userCourseConfiguration;
  //   const courseId = e.data.course.id;
  //   if (courseConfiguration.some(x => x.courseId == courseId)) {
  //     let inputToBookTeeTime = ["BOOK TEE TIME", e.data];
  //     this.componentDetails = {
  //       componentName: TeeTimeComponent,
  //       popUpDetails: {
  //         isStepper: false,
  //         bindData: inputToBookTeeTime,
  //         eventName: 'notifyParent'
  //       }
  //     };
  //     const dialogRef = this.dialog.open(TeeTimeComponent, {
  //       width: '80%',
  //       height: '80%',
  //       disableClose: true,
  //       data: { title: `${inputToBookTeeTime[0]} - ${inputToBookTeeTime[1].course.course}`, update: 'SAVE', cancel: 'CANCEL', componentDetails: this.componentDetails }
  //     });

  //     this.bookingPopupSubscription = dialogRef.afterClosed().subscribe(result => {
  //       if (result == 'save') {
  //         this.getData(this.teeTimeCourseId, this._utilities.getDate(this.propertyDate));
  //         this.cdr.detectChanges();
  //       }
  //     }
  //     );
  //   } else {
  //     this._utilities.showAlert(this.captions.CourseUserAccess, AlertType.Warning, ButtonType.Ok);
  //   }
  // }

  // getData(course, date) {
  //   let result: userAccessModel.BreakPointResult = this.userAccessBreakPoints.find(x => x.breakPointNumber == UserAccessBreakPoints.TeeSheet);
  //   // this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.TeeSheet, true).then((result) => {
  //   this.isGridDisable = result.isViewOnly;
  //   if (result.isAllow || result.isViewOnly) {
  //     this.skeletonData = this._dashBoardBusiness.getTeeSheetSkeleton(course, date);
  //   }
  //   // });

  // }

  // async getDefaultUserConfiguration() {
  //   let data = await this._dashBoardBusiness.GetDefaultUserConfiguration(this.userId);
  //   let defaultCourse = (data != null) ? ((this.dashboardCourseIds.find(x => x == data.defaultCourseId) != undefined)
  //     ? data.defaultCourseId : this.dashboardCourseIds[0]) : this.courseId;
  //   this.courseId = defaultCourse > 0 ? defaultCourse : this.courseId;
  //   this.teeTimeCourseId = this.courseId;
  //   let timeData = await this.GetTeeTimeConfigByCourseID();
  //   this.DefaultCourseId = this.courseId;
  //   this.startTime = this._dashBoardBusiness.getAPItimeFromTimePicker(this._localization.getTime(timeData.startTime, 12));
  //   this.endTime = this._dashBoardBusiness.getAPItimeFromTimePicker(this._localization.getTime(timeData.endTime, 12));
  //   this.lineForm.controls["course"].setValue(this.courseId);
  //   this.lineForm.controls["line_startTime"].setValue(this._localization.getTime(timeData.startTime, 12));
  //   this.lineForm.controls["line_endTime"].setValue(this._localization.getTime(timeData.endTime, 12));
  //   console.log(data);
  // }

  // async GetTeeTimeConfigByCourseID() {
  //   return await this._dashBoardBusiness.GetTeeTimeConfigByCourseID(this.courseId, this.propertyDate, this.propertyDate);
  // }

  // changeMetric(event: boolean) {
  //   console.log("event",event);
  //   this.getWeather(event);
  // }

  // async getWeather(weatherinUnits) {
  //   // code is suitable for https://openweathermap.org/api (please alter code if other api call is used)

  //   let weekDays = this._utilities.getShortDaysOfWeek();
  //   let today = new Date();
  //   // let propertyDate = this.propertyDateTime;
  //   let dataArr = [], daysArr = [];
  //   for (let nextLoop = 0; nextLoop <= 4; nextLoop++) {
  //     let loopedDate;
  //     if (nextLoop == 0) {
  //       let setHHMMwithInterval = new Date(today.getFullYear(), today.getMonth(), today.getDate(), (today.getHours() - today.getHours() % 3), 0, 0);
  //       loopedDate = this._localization.AddDays(setHHMMwithInterval, nextLoop);
  //     } else {
  //       let setHHMM = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  //       loopedDate = this._localization.AddDays(setHHMM, nextLoop);
  //     }
  //     let findDay = moment(loopedDate).day();
  //     dataArr.push({ date: loopedDate, day: weekDays[findDay] });
  //     daysArr.push(weekDays[findDay]);
  //   }
  //   let propertyData = await this._dashBoardBusiness.getPropertyInformation(this._propertyInformation.PropertyId);
  //   await this.generateWeekTemp(dataArr, propertyData, daysArr,weatherinUnits);
  // }



//   async generateWeekTemp(weekDays, propertyData, daysArr,weatherinUnits) {
// let weekDaysliterals = this._utilities.getShortDaysOfWeek();

//     let countryCode = await this._DashboardWidgetsReportService.getCountryName(propertyData.country), units = weatherinUnits;  // Standard :Kelvin		Metric :Celsius		Imperial: Fahrenheit
//     if (countryCode.status == 'e') {
//       this.weatherErrorResult = countryCode.message;
//     } else if (countryCode.status == 's') {
//       let loc = { city: propertyData.city, country: countryCode.message };
//       this._dashBoardBusiness.searchWeather(loc, units).then((result) => {

//         if(result!='e'){
//         // let dataObj = weekDays.map((x, index) => { 
//         //   let weatherData = result.daily.find(data => { 
//         //     return x.date.getDate() == new Date(data.dt*1000).getDate();
//         //    }); 
//         //   return {
//         //     temp: weatherData ? Math.round(weatherData.temp.day) : 0, //Implemented on request from NANCY
//         //     component: weatherData ? 'i'+weatherData.weather[0].icon : '',
//         //     day: x.day,
//         //     weatherText:weatherData ? weatherData.weather[0].description:'',
//         //     date:this._utilities.LocalizeDate(x.date)
//         //   }; 
//         // });

//         let dataObj = result.daily.map((x, index) => { 
//             var moment = require('moment-timezone');
//             console.log("Asdsadsad", moment.utc(result.daily[index].dt).toDate(), "index", index, moment(1489199400000).tz('America/New_York'));
//             if (index == 0) {
//               let weatherData = result.current;
//               let day = moment(weatherData.dt * 1000).tz(result.timezone).format('d');
//               let date = moment(weatherData.dt * 1000).tz(result.timezone).format('DD MMM YYYY');
//               return {
//                 temp: weatherData ? Math.round(weatherData.temp) : 0, //Implemented on request from NANCY
//                 component: weatherData ? 'i' + weatherData.weather[0].icon : '',
//                 day: weekDaysliterals[day],
//                 weatherText: weatherData ? weatherData.weather[0].description : '',
//                 date: date
//               };
//             } else {
//               let weatherData = result.daily[index ];
//               let day = moment(weatherData.dt * 1000).tz(result.timezone).format('d');
//               let date = moment(weatherData.dt * 1000).tz(result.timezone).format('DD MMM YYYY');
//               return {
//                 temp: weatherData ? Math.round(weatherData.temp.day) : 0, //Implemented on request from NANCY
//                 component: weatherData ? 'i' + weatherData.weather[0].icon : '',
//                 day: weekDaysliterals[day],
//                 weatherText: weatherData ? weatherData.weather[0].description : '',
//                 date: date
//               };
//             }
//         });
//         // this.defaultSelectedWeather = this.finddataSelec(dataObj);
//         this.DB_Weather_data = {
//           currentLocation: propertyData.city,
//           currentWeather: dataObj[this.defaultSelectedWeather].weatherText,
//           currentTemp: dataObj[this.defaultSelectedWeather].temp,
//           currentDate:dataObj[this.defaultSelectedWeather].date,
//           daysShort: daysArr,
//           selected: this.defaultSelectedWeather,
//           tempObj: dataObj
//         };
//         console.log("this.DB_Weather_data",this.DB_Weather_data)
//       }else{
//         this.weatherErrorResult = this.captions.cityNotFound;
//       }
        
//         }).catch((res)=>{
//           if(res.error.cod == '404' || res.error.cod == 404) {
//           this.weatherErrorResult = this.captions.cityNotFound;
//           }else  if(res.error.cod == '401' || res.error.cod == 401) {
//             this.weatherErrorResult = this.captions.invalidApiKey;
//           }
//         });
//       }
//   }
  // finddataSelec(arr){
  //   let val=0;
  //   let valuenotselected = true;
  //   arr.forEach((x,index)=>{
  //     if(x.component!='' && valuenotselected){
  //       val = index;
  //       valuenotselected = false;
  //     } 
  //   })
  //   return val;
  // }
  // prevWeek() {
  //   console.log("prev week");
  // }
  // nextWeek() {
  //   console.log("next week");
  // }

  // async getLessons() {
  //   let result: userAccessModel.BreakPointResult = this.userAccessBreakPoints.find(x => x.breakPointNumber == UserAccessBreakPoints.BOOKLESSON);
  //   if (!result.isAllow && !result.isViewOnly) {
  //     return;
  //   }

  //   this.CourseDetails_Lessons_data = {
  //     data: await this._dashBoardBusiness.getLessons(this.propertyDate),
  //     headerData: [
  //       { key: 'instructor', description: this.captions.instructor, alignment: 'textLeft font-bold' },
  //       { key: 'date', description: this.captions.date, alignment: 'textLeft font-bold' },
  //       { key: 'time', description: this.captions.time, alignment: 'textLeft font-bold' },
  //       { key: 'players', description: this.captions.players, alignment: 'textRight font-bold', customClass: 'greenText', showArrow: false }
  //     ],
  //     headerEnable: true
  //   }
  // }

  // checkAccess(bpNumber) {
  //   let result: userAccessModel.BreakPointResult = this.userAccessBreakPoints.find(x =>
  //     x.breakPointNumber == bpNumber);
  //   let checkReturn = (result && !result.isAllow && !result.isViewOnly) ? false : true;
  //   return checkReturn;
  // }
}


