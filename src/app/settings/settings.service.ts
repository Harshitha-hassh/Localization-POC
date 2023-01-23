import { Injectable } from '@angular/core';
// import { HttpServiceCall, HttpMethod } from '../shared/service/http-call.service';
// import { Host, SPAScheduleBreakPoint, Product } from '../shared/globalsContant';
// import { Utilities, RecurringType } from '../shared/utilities/utilities';
import { UntypedFormBuilder, Validators } from '@angular/forms';
// import { BreakPointAccess } from '../shared/service/breakpoint.service';
import { PropertyInformation } from '../core/services/property-information.service';
import { BehaviorSubject } from 'rxjs';
// import { CommissionableRetailItem, Commission } from '../retail/retail.modals';
import { Utilities } from '../core/utilities';
import { RetailLocalization } from '../retail/common/localization/retail-localization';

@Injectable()
export class SettingsService {
  // lunchList: any = [];
  // type1Array: any = [];
  // type2Array: any = [];
  // type3Array: any = [];
  roleConfiguration: any = [];
  changedBreakPoints: any = [];
  // searchPath = "/assets/user-config.json";
  // packageClassArray: any = [];
  // deepCloneArray: any = [];
  // startDate: string;
  // endDate: any;
  userRoles: any = [];
  propOutlets: any = [];
  editUserInfo: any;
  selectedOutlets: any[] = [];
  selectedAccess: any[] = [];
  serviceGroups: any[] = [];
  isRadioButtonsChange = false;
  products: any[] = [];
  existingUserIds: any[] = [];
  existingQuickIds: any[] = [];
  breakpoints: any = [];
  tabLoaderEnable: BehaviorSubject<boolean> = new BehaviorSubject(false);
  userSettingsFormGrp = this.Form.group({
    activeuser: true,
    fname: ['', Validators.required],
    lname: ['', Validators.required],
    userid: ['', Validators.required],
    quickid: '',
    email: '',
    language: 0,
    newpassword: true,
    pwdexpirationdate: this.utils.getDate(this.PropertyInfo.CurrentDate)
  });

  // spaSettingsFormGrp = this.Form.group({
  //   rolename: [0, Validators.required],
  //   accountblocked: false,
  //   autologoff: false,
  //   logoffafter: 0,
  // });

  retailSettingsFormGrp = this.Form.group({
    rolename: [0, Validators.required],
    accountblocked: false,
    autologoff: false,
    logoffafter: 0,
    allowgratuity: false,
    allowservicecharge: false,
    allowcommission: false,
    commissionclass: 0
  });

  // DateDiff = {
  //   inHours: function (d1, d2) {
  //     const t2 = d2.getTime();
  //     const t1 = d1.getTime();

  //     return Math.round((t2 - t1) / (3600 * 1000));
  //   },
  //   inDays: function (d1, d2) {
  //     const t2 = d2.getTime();
  //     const t1 = d1.getTime();

  //     return Math.round((t2 - t1) / (24 * 3600 * 1000));
  //   },

  //   inWeeks: function (d1, d2) {
  //     const t2 = d2.getTime();
  //     const t1 = d1.getTime();

  //     return Math.round((t2 - t1) / (24 * 3600 * 1000 * 7));
  //   },

  //   inMonths: function (d1, d2) {
  //     const d1Y = d1.getFullYear();
  //     const d2Y = d2.getFullYear();
  //     const d1M = d1.getMonth();
  //     const d2M = d2.getMonth();

  //     return Math.round((d2M + 12 * d2Y) - (d1M + 12 * d1Y));
  //   },

  //   inYears: function (d1, d2) {
  //     return Math.round(d2.getFullYear() - d1.getFullYear());
  //   },

  //   AddYears: function (date: Date, years: number) {
  //     return moment(date)
  //       .add(years, "y")
  //       .toDate();
  //   }
  // };

  constructor(
    // private http: HttpServiceCall
    private utils: Utilities,
    private Form: UntypedFormBuilder,
    // , private breakpoint: BreakPointAccess,
    private localization: RetailLocalization,
    private PropertyInfo: PropertyInformation) {
  }

  // BuildWeekDayArrayForRecurring(): any[] {
  //   const localizedWeekArr: DaysModel[] = this.localization.daysArray;
  //   const returnArr: any[] = [];
  //   returnArr.push({ id: 0, name: this.localization.captions.common.all, setSelected: false });
  //   for (let i = 1; i < localizedWeekArr.length; i++) {
  //     const element = localizedWeekArr[i];
  //     if (element.id === 7) {
  //       returnArr.push({ id: i, name: element.short, setSelected: false, value: 0 });
  //     } else {
  //       returnArr.push({ id: i, name: element.short, setSelected: false, value: element.id });
  //     }
  //   }
  //   return returnArr;
  // }

  // getRecurringDates(type: RecurringType, startDate: Date, endDate: Date, everyRecurringNumber: number,
  //   days?: number[], monthlyDate?: Date, monthlyDay?: number, month?: number): Date[] {
  //   const dates: Date[] = [];
  //   days = days ? days : [];
  //   days = days.filter(x => (x || x == 0));
  //   const dayObject = [];
  //   startDate = this.utils.GetDateWithoutTime(startDate);
  //   endDate = this.utils.GetDateWithoutTime(endDate);
  //   let dateDiff = this.DateDiff.inDays(startDate, endDate) + 1;
  //   if (type == RecurringType.Daily) {
  //     //check zero
  //     everyRecurringNumber = everyRecurringNumber ? everyRecurringNumber : 1;
  //     dateDiff = Math.round(dateDiff / everyRecurringNumber);
  //     for (let i = 0; i <= dateDiff; i++) {
  //       if (startDate.getTime() <= endDate.getTime()) {
  //         dates.push(startDate)
  //         startDate = this.utils.AddDays(startDate, everyRecurringNumber);
  //       }
  //     }
  //   } else if (type == RecurringType.Weekly) {
  //     const daysArrayInGivenPeriod = [];
  //     let dayOccurIndex = 0;
  //     for (let index = 0; index < dateDiff; index++) {
  //       const dateObj = this.utils.AddDays(startDate, index);
  //       const curday: number = dateObj.getDay();
  //       if (curday == 0 && index != 0) {
  //         dayOccurIndex++;
  //       }
  //       dayObject.push({
  //         date: dateObj,
  //         dayIndex: dayOccurIndex,
  //         day: curday,
  //         added: false
  //       })
  //       if (!daysArrayInGivenPeriod.includes(curday) && days.includes(curday)) {
  //         daysArrayInGivenPeriod.push(curday);
  //       }
  //     }

  //     for (let i = 0; i < dateDiff; i++) {
  //       const curDate = this.utils.AddDays(startDate, i);
  //       const flg = dayObject.filter(x => x.day == curDate.getDay() && !x.added && (x.dayIndex % everyRecurringNumber) == 0);
  //       if (flg.length > 0) {
  //         flg[0].added = true;
  //       }
  //       if (daysArrayInGivenPeriod.includes(curDate.getDay()) && (everyRecurringNumber == 1 || flg.length > 0)) {
  //         const dt = flg.length > 0 ? flg[0].date : curDate;
  //         if (dt.getTime() <= endDate.getTime()) {
  //           dates.push(dt)
  //         }
  //       }
  //     }

  //   } else if (type == RecurringType.Monthly) {
  //     // days
  //     if (days && days.length > 0) {
  //       const daysArrayInGivenPeriod = [];
  //       let monthOccurIndex = 0;
  //       for (let index = 0; index < dateDiff; index++) {
  //         const dateObj = this.utils.AddDays(startDate, index);
  //         const curday: number = dateObj.getDay();
  //         const curDate: number = dateObj.getDate();
  //         if (curDate == 1 && index != 0) {
  //           monthOccurIndex++;
  //         }
  //         dayObject.push({
  //           monthIndex: monthOccurIndex,
  //           date: dateObj,
  //           dayIndex: this.getDayIndexOfTheMonth(dateObj),
  //           day: curday,
  //           added: false
  //         });
  //         if (!daysArrayInGivenPeriod.includes(curday) && days.includes(curday)) {
  //           daysArrayInGivenPeriod.push(curday);
  //         }
  //       }

  //       for (let i = 0; i < dateDiff; i++) {
  //         const curDate = this.utils.AddDays(startDate, i);
  //         const flg = dayObject.filter(x => {
  //           return x.day == curDate.getDay() && !x.added && x.dayIndex == monthlyDay && (x.monthIndex % everyRecurringNumber) == 0;
  //         });
  //         if (flg.length > 0) {
  //           flg[0].added = true;
  //         }
  //         if (daysArrayInGivenPeriod.includes(curDate.getDay()) && flg.length > 0) {
  //           const dt = flg.length > 0 ? flg[0].date : curDate;
  //           if (dt.getTime() <= endDate.getTime()) {
  //             dates.push(dt);
  //           }
  //         }
  //       }

  //     } else {
  //       const monthDiff = this.DateDiff.inMonths(startDate, endDate) + 1;
  //       for (let i = 0; i < monthDiff; i++) {
  //         if ((everyRecurringNumber == 1 || (i % everyRecurringNumber) == 0) && startDate.getTime() <= endDate.getTime()) {
  //           const monthlyDate1 = this.utils.GetDateWithoutTime(new Date(startDate.getFullYear(), startDate.getMonth(), 1))

  //           monthlyDate1.setMonth(startDate.getMonth() + i);
  //           let m_startDate = monthlyDate1;

  //           const lastDate = new Date(m_startDate.getFullYear(), m_startDate.getMonth() + 1, 0).getDate();
  //           if (lastDate < monthlyDate.getDate()) {
  //             m_startDate.setDate(lastDate);
  //           } else {
  //             m_startDate.setDate(monthlyDate.getDate());
  //           }
  //           m_startDate = this.utils.GetDateWithoutTime(m_startDate);
  //           if (m_startDate.getTime() >= startDate.getTime() && m_startDate.getTime() <= endDate.getTime()) {
  //             dates.push(m_startDate);
  //           }
  //         }
  //       }
  //     }
  //   } else if (type == RecurringType.Yearly) {
  //     const yearDiff = this.DateDiff.inYears(startDate, endDate) + 1;
  //     // Loop through years
  //     for (let i = 0; i < yearDiff; i++) {
  //       const y_startDate = this.DateDiff.AddYears(startDate, i)
  //       const y_year = y_startDate.getFullYear();
  //       const y_month = everyRecurringNumber;
  //       const weekArr: any[] = this.getWeekFirstArrayOfMonth(new Date(y_year, y_month, 1));
  //       // loop through the days
  //       for (let j = 0; j < days.length; j++) {
  //         const firstIndex = weekArr.map(a => a.day).indexOf(days[j]);
  //         const firstOccuranceOfDay = weekArr[firstIndex];
  //         const finalDate = firstOccuranceOfDay.dateOnly && (firstOccuranceOfDay.dateOnly + (7 * monthlyDay))

  //         const sch_date = this.utils.GetDateWithoutTime(new Date(y_year, y_month, finalDate));
  //         if (sch_date.getTime() >= startDate.getTime() && sch_date.getTime() <= endDate.getTime()) {
  //           dates.push(sch_date)
  //         }
  //       }
  //     }
  //   }
  //   return dates;
  // }

  // getDayIndexOfTheMonth(dt: Date): number {
  //   const startDate = this.utils.getDate(dt);
  //   startDate.setDate(1);
  //   return Math.floor(this.DateDiff.inDays(startDate, dt) / 7);
  // }

  // getWeekFirstArrayOfMonth(dt: Date): any[] {
  //   dt.setDate(1);
  //   const weekArr = [];
  //   for (let index = 0; index < 7; index++) {
  //     const dt1 = this.utils.AddDays(dt, index)
  //     weekArr.push({
  //       day: dt1.getDay(),
  //       dateTime: dt1,
  //       dateOnly: dt1.getDate()
  //     });
  //   }
  //   return weekArr;
  // }

  // GetAllLunchSlots(startDate, endDate) {
  //   if (typeof startDate != "string") {
  //     startDate = this.utils.formatDate(startDate);
  //   }
  //   if (typeof endDate != "string") {
  //     endDate = this.utils.formatDate(endDate);
  //   }
  //   this.http.CallApiWithCallback({
  //     host: Host.spaManagement,
  //     success: this.successCallback.bind(this),
  //     error: this.errorCallback.bind(this),
  //     callDesc: "GetAllLunch",
  //     uriParams: { fromdate: startDate, toDate: endDate },
  //     method: HttpMethod.Get,
  //     showError: true,
  //     extraParams: []
  //   });
  // }

  GetBreakPoints() {
    // this.breakpoints = this.breakpoint.GetBreakPoint([SPAScheduleBreakPoint.UserRoleConfiguration,
    // SPAScheduleBreakPoint.UserRoleSetUp,
    // SPAScheduleBreakPoint.UserSetup]).result;
  }

  // successCallback<T>(result: BaseResponse<T>, callDesc: string, extraParams: any[]): void {
  //   if (callDesc == "GetAllLunch") {
  //     const lunchlist = <any>result.result ? <any>result.result : [];
  //     for (let i = 0; i < lunchlist.length; i++) {
  //       lunchlist[i].plainStartDate = lunchlist[i].startDate;
  //       lunchlist[i].startDate = this.utils.GetFormattedDateDDMMYY(lunchlist[i].startDate);
  //       for (let j = 0; j < lunchlist[i].lunchData.length; j++) {
  //         lunchlist[i].lunchData[j].lunchTime = this.utils.LocalizeTime(lunchlist[i].lunchData[j].lunchTime);
  //       }
  //     }
  //     this.lunchList = lunchlist;
  //   }
  // }

  // errorCallback<T>(error: BaseResponse<T>, callDesc: string, extraParams: any[]): void {

  // }

  /**
   * @function updateLoaderState
   * @param isCallBack
   * @param isInitialLoad
   * @param callCounter
   */
  updateInitalLoads(isCallBack, initialLoads, callCounter) {
    if (initialLoads) {
      if (isCallBack) {
        callCounter--;
      }
      else {
        callCounter++;
      }
      if (callCounter === 0) {
        this.tabLoaderEnable.next(false)
        initialLoads = false;
      }
    }
    return [initialLoads, callCounter];
  }

  // async InvokeServiceCallAsync<T>(route: string, domain: Host, callType: HttpMethod, uriParams?: any, body?: any): Promise<T> {
  //   let result: BaseResponse<any> = await this.http.CallApiAsync({
  //     host: domain,
  //     callDesc: route,
  //     method: callType,
  //     body: body,
  //     uriParams: uriParams,
  //   });
  //   return result ? result.result : null;
  // }

  // async GetActiveOutletsByUserAccess(): Promise<OutletSubProperty[]> {
  //   let outlets: OutletSubProperty[] = [];
  //   let apiResponse: OutletSubProperty[] = await this.InvokeServiceCallAsync<OutletSubProperty[]>('GetSubPropertyAccessByUser', Host.retailManagement, HttpMethod.Get, { userId: this.utils.GetPropertyInfo("UserId") });
  //   if (apiResponse && apiResponse.length > 0) {
  //     apiResponse.forEach(e => {
  //       if (e.isActive) {
  //         outlets.push(e);
  //       }
  //     });
  //   }
  //   return outlets;
  // }

  // async GetCommissionData(outletId: number, classId: number): Promise<any[]> {
  //   let [commissionItems, defaultClassData] = await Promise.all([
  //     this.InvokeServiceCallAsync<CommissionableRetailItem[]>('GetCommissionItems', Host.retailManagement, HttpMethod.Get, { outletId: outletId }),
  //     this.InvokeServiceCallAsync<Commission[]>('GetCommissions', Host.commission, HttpMethod.Get,
  //       { classId: classId, productId: Product.SPA, outletId: outletId })
  //   ]);
  //   return [commissionItems, defaultClassData];
  // }
}
