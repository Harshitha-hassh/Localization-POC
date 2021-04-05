import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { cloneDeep, map, orderBy, isEqual, forEach, includes, differenceWith } from 'lodash';
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Calendar, ContactType, ButtonType, AlertAction } from '../shared/shared-models';
//import { AlertPopupComponent } from '../ag-common/components/alert-popup/alert-popup.component';
// import { SorTypeEnum } from '../shared/components/cdkvirtual/cdkvirtual.model';
import { USER_SESSION, USER_INFO } from '../app-constants';
import { AuthenticationParameters, Configuration } from 'msal';
// import { MsalAngularConfiguration } from '@azure/msal-angular';
import moment from 'moment';
import { CardSwipePopupComponent } from '../retail/shared/card-swipe-popup/card-swipe-popup.component';
import { CommonAlertPopupComponent } from '../common/shared/shared/common-alert-popup/common-alert-popup.component';
import { CommonUtilities } from '../common/shared/shared/utilities/common-utilities';
import { ISubscription } from 'rxjs/Subscription';
import { RetailLocalization } from '../retail/common/localization/retail-localization';
import { HttpServiceCall } from '../common/shared/shared/service/http-call.service';
import { MoreSectionServiceService } from '../common/shared/shared/more-section/more-section-service.service';
import { RetailPropertyInformation } from './services/retail-property-information.service';
import { CommonPropertyInformation } from '../common/shared/services/common-property-information.service';
import { FormatText } from '../common/shared/shared/pipes/formatText-pipe.pipe';
import { AlertType } from '../common/Models/common.models';

export enum RedirectToModules {
    retail,
    order,
    appointment,
    settings,
    Utilities,
    exchange,
    Dayend,
    home
}

export interface PatchJson {
    op: PatchOperation;
    path: string;
    value: any;
}

export interface AppointmentColors {
    BackGround: string;
    BackGroundLight: string;
    Color: string;
    ColorLight: string;
    Border: string;
}

export enum PatchOperation {
    add = 'add',
    remove = 'remove',
    replace = 'replace',
    copy = 'copy',
    move = 'move',
    test = 'test'
}

export const enum Product {
    SPA = 1,
    RETAIL = 2,
    GOLF = 3,
    COMMON = 4,
    SNC = 5,
    PMS = 6,
    Tenant = 7
}



export enum RecurringType {
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Yearly = 3
}



export enum InputTypeNumbers {
    NUMBERS = 'onlynumber',
    ONLYPOSITIVE = 'nonnegative',
    ONLYNEGATIVE = 'onlynegative',
    NODECIMAL = 'nodecimal',
    DECIMAL = 'decimal',
    ROUNDOFF = 'roundoff2',
    PERCENT = 'validPercentage',
    POSITIVEDECIMAL = 'onlyPositiveDecimal',
    POSITIVEDECIMALORNUMERIC = 'PositiveDecimalOrNumeric',
    NUMBERWITHSEPARATOR = 'numberWithSeparator',
    PREMAXDECIMAL = 'preMaxdecimal'
}

export enum InputTypeText {
    CAP = 'capitalise',
    TEXT = 'textonly',
    NOSPL = 'nospecailchar',
    NOSPACE = 'notallowspace',
    EMAIL = 'email',
    FIRST_CHAR_CAP = 'firstcharcapitalise',
    NOPRESPACE = 'noprespace',
    WEBSITE = 'website'
}


export interface CssProp {
    property: string;
    value: string;
}


export function stringFormat(input: string, appendBy?: string) {
    if (appendBy) {
        return input ? (input == '' ? '' : input + appendBy) : '';
    } else {
        return input ? (input == '' ? '' : input) : '';
    }
}



export function convertPhoneNoToUiNo(num: string): string {
    if (num != null || num == '') {
        return (
            num.substring(3, 0) +
            ' - ' +
            num.substring(6, 3) +
            ' - ' +
            num.substring(num.length, 6)
        );
    } else {
        return '';
    }
}

export function tConvert(tt) {
    var time = tt.substring(tt.indexOf('T') + 1, tt.length);
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
        time
    ];

    if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
}


@Injectable(
    {
        providedIn: 'root'
    }
)
export class Utilities extends CommonUtilities implements OnDestroy {
    subscription: ISubscription;
    constructor(public localization: RetailLocalization, public dialog: MatDialog, public httpServiceCall: HttpServiceCall, public route: Router,
        public _MoreSectionServiceService: MoreSectionServiceService, public PropertyInfo: RetailPropertyInformation, public CommonPropertyInfo: CommonPropertyInformation, public formatphno: FormatText) {
            super(localization, dialog, httpServiceCall, route,
                _MoreSectionServiceService, CommonPropertyInfo, formatphno);
    }

    ngOnDestroy() {
    }


    public ShouldDisableSave(form: FormGroup, initialValue: any = undefined, otherValidations: boolean = true): boolean {
        let validity: boolean;

        if (initialValue) {
            validity = !(form.dirty && !isEqual(form.value, initialValue) && form.valid && otherValidations);
        }
        else {
            validity = !(form.dirty && form.valid && otherValidations);
        }
        return validity;
    }

    // private hideOverlays() {
    //     let LoaderElement = document.getElementById('cover-spin');
    //     let customElement = document.getElementById('custom-cover-spin');
    //     if (LoaderElement) {
    //         LoaderElement.style.display = 'none';
    //     }
    //     if (customElement) {
    //         customElement.style.display = 'none';
    //     }
    // }

    /**
     * Checks whether given date lies in range
     * @param {Date} dateToCheck
     * @param {Date} from
     * @param {Date} to
     * @returns {boolean}
     * @memberof Utilities
     */
    public isDateInGivenRange(dateToCheck: Date, from: Date, to: Date): boolean {
        return (dateToCheck.getTime() <= to.getTime() && dateToCheck.getTime() >= from.getTime());
    }

    CloseAllOpenedPopups() {
        this.dialog.closeAll();
    }


    capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // getShortWeekArrayLocaleSorted() {
    //     let ShortWeekArr = this.getShortDaysOfWeek(); // locale sorted by default
    //     let returnArr = [];
    //     let localizedCalender: Calendar = this.captions.calendar;

    //     returnArr.push({ id: 7, name: this.captions.common.AllDays });
    //     for (let i = 0; i < ShortWeekArr.length; i++) {
    //         const localeDay = ShortWeekArr[i];
    //         switch (localeDay) {
    //             case localizedCalender.Mon:
    //                 returnArr.push({ id: 1, name: localeDay });
    //                 break;
    //             case localizedCalender.Tue:
    //                 returnArr.push({ id: 2, name: localeDay });
    //                 break;
    //             case localizedCalender.Wed:
    //                 returnArr.push({ id: 3, name: localeDay });
    //                 break;
    //             case localizedCalender.Thu:
    //                 returnArr.push({ id: 4, name: localeDay });
    //                 break;
    //             case localizedCalender.Fri:
    //                 returnArr.push({ id: 5, name: localeDay });
    //                 break;
    //             case localizedCalender.Sat:
    //                 returnArr.push({ id: 6, name: localeDay });
    //                 break;
    //             case localizedCalender.Sun:
    //                 returnArr.push({ id: 0, name: localeDay });
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }

    //     return returnArr;
    // }
    //public weekArray:any = [{"id":0,"name":"All Days"},{"id":1,"name":"Monday"},{"id":2,"name":"TuesDay"},{"id":3,"name":"Wednesday"},{"id":4,"name":"Thursday"},{"id":5,"name":"Friday"},{"id":6,"name":"Saturday"},{"id":7,"name":"Sunday"}];
    // getLongWeekArrayLocaleSorted() {
    //     let longWeekArr = this.getLongDaysOfWeek(); // locale sorted by default
    //     let returnArr = [];
    //     let localizedCalender: Calendar = this.captions.calendar;

    //     returnArr.push({ id: 7, name: this.captions.common.AllDays });
    //     for (let i = 0; i < longWeekArr.length; i++) {
    //         const localeDay = longWeekArr[i];
    //         switch (localeDay) {
    //             case localizedCalender.Monday:
    //                 returnArr.push({ id: 1, name: localeDay });
    //                 break;
    //             case localizedCalender.Tuesday:
    //                 returnArr.push({ id: 2, name: localeDay });
    //                 break;
    //             case localizedCalender.Wednesday:
    //                 returnArr.push({ id: 3, name: localeDay });
    //                 break;
    //             case localizedCalender.Thursday:
    //                 returnArr.push({ id: 4, name: localeDay });
    //                 break;
    //             case localizedCalender.Friday:
    //                 returnArr.push({ id: 5, name: localeDay });
    //                 break;
    //             case localizedCalender.Saturday:
    //                 returnArr.push({ id: 6, name: localeDay });
    //                 break;
    //             case localizedCalender.Sunday:
    //                 returnArr.push({ id: 0, name: localeDay });
    //                 break;
    //             default:
    //                 break;
    //         }
    //     }

    //     return returnArr;
    // }

     /**
    * Converts a javascript date to Invariant date time format string (C# API can understand this format).
    * @param Date javascript date or Javascript ISO string.*
    */
//    convertDateFormat(dt: Date): string {
//     return super.ConvertDateToISODateTime(dt);
// }

    getTimeDifference(fromtime, toTime, type) {
        return super.getTimeDifference(fromtime, toTime, type);
    }
    /**
    * Converts a javascript date to Invariant date format string (C# API can understand this format).
    * @param Date javascript date or Javascript ISO string.    *
    */
    // formatDate(dt: Date): string {
    //     return super.ConvertDateToISODate(dt);
    // }

    /**
     * removes the duplicate values in the given array
     * @param arrWithDuplicates
     */
    removeDuplicates(arrWithDuplicates): any[] {
        let uniqueArr = [];
        uniqueArr = arrWithDuplicates.filter(
            function (item, position) {
                return arrWithDuplicates.indexOf(item) == position
            }
        );
        return uniqueArr;
    }

    GetDistinctByProp(myArr, prop) {
        return myArr.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
        });
    }

    isExist(coll, obj) {
        let index = -1;
        if (coll) {
            index = coll.findIndex(x => { return ((x.id || x.id == 0) ? x.id : x) == obj.id });
        }
        return index;
    }

    setUserAccessSettings = (allAvailableSettings, selectedSettings) => {
        forEach(allAvailableSettings, setting => {
            let selectedSettingIds = map(selectedSettings, selectedOutlet => selectedOutlet.id);
            includes(selectedSettingIds, setting.id) ? setting.isSelected = true : setting.isSelected = false;
        });
    }

    getToggleFilter(DataArr, SelectedArr, gv, isWeekLocalized = false) {

        if (gv.id == 0 && !isWeekLocalized) {
            if (SelectedArr.indexOf(gv.id) == -1) {
                DataArr.forEach(result => {
                    if (SelectedArr.indexOf(result.id) == -1) {
                        SelectedArr.push(result.id)
                    }
                });
            } else {
                SelectedArr = [];
            }
            return SelectedArr;
        }

        if (SelectedArr.indexOf(gv.id) == -1) {
            SelectedArr.push(gv.id);
            if (SelectedArr.length == DataArr.length - 1 && this.isExist(DataArr, { id: 0 }) != -1) {
                SelectedArr = [];
                DataArr.forEach(result => { SelectedArr.push(result.id) });
            }
        } else {
            SelectedArr.splice(SelectedArr.indexOf(gv.id), 1);
            if (SelectedArr.length == DataArr.length - 1) {
                if (SelectedArr.findIndex(x => x == 0) != -1) {
                    SelectedArr.splice(SelectedArr.findIndex(x => x == 0), 1);
                }
            } else {
                if (SelectedArr.findIndex(x => x == 0) != -1) {
                    SelectedArr.splice(SelectedArr.findIndex(x => x == 0), 1)
                }
            }
        }

        if (isWeekLocalized && SelectedArr.length != DataArr.length) {
            SelectedArr = SelectedArr.filter(x => x != 7);
        }
        return SelectedArr;
    }


    getOutletFilterObject(DataArr, SelectedArr, gv) {

        let selectedIds: number[] = SelectedArr.map(x => x.id);
        if (selectedIds.indexOf(gv.id) == -1) {
            SelectedArr.push(gv);
            if (SelectedArr.length == DataArr.length - 1 && this.isExist(DataArr, { id: 0 }) != -1) {
                SelectedArr = [];
                DataArr.forEach(result => { SelectedArr.push(result) });
            }
        } else {
            SelectedArr.splice(selectedIds.indexOf(gv.id), 1);
            if (SelectedArr.length == DataArr.length - 1) {
                if (SelectedArr.findIndex(x => x == 0) != -1) {
                    SelectedArr.splice(SelectedArr.findIndex(x => x.id == 0), 1);
                }
            } else {
                if (SelectedArr.findIndex(x => x.id == 0) != -1) {
                    SelectedArr.splice(SelectedArr.findIndex(x => x.id == 0), 1)
                }
            }
        }

        return SelectedArr;
    }

    getToggleAllFilter(DataArr, SelectedArr) {
        if (SelectedArr.length != DataArr.length) {
            SelectedArr = []
            DataArr.forEach(result => { SelectedArr.push(result.id) });
        } else {
            SelectedArr = [];
        }
        return SelectedArr;

    }

    getToggleSingleSelectFilter(Arr, value) {
        Arr.splice(0, 1);
        Arr.push(value);
        return Arr;
    }

    getToggleSingleFilter(ga, gv) {
        if (ga.indexOf(gv) == -1) {
            ga.splice(0, 1);
            ga.push(gv);
        } else {
            ga.splice(0, 1);
        }
        return ga;
    }

    DateDiff = {
        inHours: function (d1, d2) {
            var t2 = d2.getTime();
            var t1 = d1.getTime();

            return Math.round((t2 - t1) / (3600 * 1000));
        },
        inDays: function (d1, d2) {
            var t2 = d2.getTime();
            var t1 = d1.getTime();

            return Math.round((t2 - t1) / (24 * 3600 * 1000));
        },

        inWeeks: function (d1, d2) {
            var t2 = d2.getTime();
            var t1 = d1.getTime();

            return Math.round((t2 - t1) / (24 * 3600 * 1000 * 7));
        },

        inMonths: function (d1, d2) {
            var d1Y = d1.getFullYear();
            var d2Y = d2.getFullYear();
            var d1M = d1.getMonth();
            var d2M = d2.getMonth();

            return Math.round((d2M + 12 * d2Y) - (d1M + 12 * d1Y));
        },

        inYears: function (d1, d2) {
            return Math.round(d2.getFullYear() - d1.getFullYear());
        }
    }


    //This function will return only date with 00:00:00 time
    GetDateWithoutTime(input: Date) {
        if (typeof (input) == 'string') {
            input = this.getDate(input);
        }
        input = cloneDeep(input);
        input.setHours(0, 0, 0, 0);
        return input;
    }
    //Validates only date without time - Returns true if both dates are same
    ValidateDatesAreEqual(date1: Date | string, date2: Date | string) {
        return this.GetDateWithoutTime(this.localization.getDate(date1)).valueOf() == this.GetDateWithoutTime(this.localization.getDate(date2)).valueOf();
    }
    //Validates only date without time - Returns true if date is greater that other date
    ValidateDatesGreaterThan(date1: Date | string, date2: Date | string) {
        return this.GetDateWithoutTime(this.localization.getDate(date1)).valueOf() > this.GetDateWithoutTime(this.localization.getDate(date2)).valueOf();
    }

    //Formats money based on given language and currency code
    FormatMoney(value: any, languageCode: string, currencyCode: string, includeCurrencysymbol: boolean = false) {

        let formattedMoney: string = value.toLocaleString(languageCode, {
            style: 'currency',
            currency: currencyCode,
        });
        if (formattedMoney) {
            if (!includeCurrencysymbol) {
                formattedMoney = formattedMoney.substring(1);
            }
        } else {
            formattedMoney = value;
        }

        return formattedMoney;
    }

    /**
     * Disables Form Group controls( applies Read only )
     * @param FormGroup Form Group with Valid Form Controls.
     * @param excludedControls Exceptional controls.
     */
    disableControls(FormGroup: FormGroup, excludedControls?: string[]) {
        excludedControls = excludedControls ? excludedControls : [];
        let allControls: string[] = Object.keys(FormGroup.controls);
        for (let i = 0; i < allControls.length; i++) {
            let _control: string = allControls[i];
            if (!excludedControls.includes(_control)) {
                FormGroup.controls[_control].disable({ emitEvent: false });
            }
        }

    }

    /**
     * Enables Form Group controls( applies Read only )
     * @param FormGroup Form Group with Valid Form Controls.
     * @param excludedControls Exceptional controls.
     */
    enableControls(FormGroup: FormGroup, excludedControls?: string[]) {
        excludedControls = excludedControls ? excludedControls : [];
        let allControls: string[] = Object.keys(FormGroup.controls);
        for (let i = 0; i < allControls.length; i++) {
            let _control: string = allControls[i];
            if (!excludedControls.includes(_control)) {
                FormGroup.controls[_control].enable();
            }
        }

    }


    // getRecurringDates(type: RecurringType, startDate: Date, endDate: Date, everyRecurringNumber: number,
    //     days?: any[], monthlyDate?: Date, monthlyDay?: number, month?: number): Date[] {
    //     let dates: Date[] = [];
    //     days = days ? days : [];
    //     days = days.filter(x => { return (x || x == 0); });
    //     let dayObject = [];
    //     startDate = this.GetDateWithoutTime(startDate);
    //     endDate = this.GetDateWithoutTime(endDate);
    //     let dateDiff = this.DateDiff.inDays(startDate, endDate) + 1;
    //     if (type == RecurringType.Daily) {
    //         //check zero
    //         everyRecurringNumber = everyRecurringNumber ? everyRecurringNumber : 1;
    //         dateDiff = Math.round(dateDiff / everyRecurringNumber);
    //         for (let i = 0; i <= dateDiff; i++) {
    //             if (startDate.getTime() <= endDate.getTime()) {
    //                 dates.push(startDate)
    //                 startDate = this.AddDays(startDate, everyRecurringNumber);
    //             }
    //         }
    //     } else if (type == RecurringType.Weekly) {
    //         let daysArrayInGivenPeriod = [];
    //         let dayOccurIndex = 0;
    //         for (let index = 0; index < dateDiff; index++) {
    //             let curday: number = this.AddDays(startDate, index).getDay();
    //             if (curday == 0 && index != 0) {
    //                 dayOccurIndex++;
    //             }
    //             dayObject.push({
    //                 date: this.AddDays(startDate, index),
    //                 dayIndex: dayOccurIndex,
    //                 day: curday,
    //                 added: false
    //             })
    //             if (!daysArrayInGivenPeriod.includes(curday) && days.some(item => (item['id']) % 7 === curday))// days.includes(curday))
    //             {
    //                 daysArrayInGivenPeriod.push(curday);
    //             }
    //         }
    //         for (let i = 0; i < dateDiff; i++) {
    //             let curDate = this.AddDays(startDate, i);
    //             let flg = dayObject.filter(x => { return x.day == curDate.getDay() && !x.added && (x.dayIndex % everyRecurringNumber) == 0 });
    //             if (flg.length > 0) {
    //                 flg[0].added = true;
    //             }
    //             if (daysArrayInGivenPeriod.includes(curDate.getDay()) && (everyRecurringNumber == 1 || flg.length > 0)) {
    //                 let dt = flg.length > 0 ? flg[0].date : curDate;
    //                 if (dt.getTime() <= endDate.getTime()) {
    //                     dates.push(dt)
    //                 }
    //             }
    //         }

    //     } else if (type == RecurringType.Monthly) {
    //         // days
    //         if (days && days.length > 0) {
    //             let daysArrayInGivenPeriod = [];
    //             let dayOccurIndex = 0, monthOccurIndex = 0;
    //             for (let index = 0; index < dateDiff; index++) {
    //                 let curday: number = this.AddDays(startDate, index).getDay();
    //                 let curDate: number = this.AddDays(startDate, index).getDate();
    //                 if (curDate == 1 && index != 0) {
    //                     monthOccurIndex++;
    //                 }
    //                 dayObject.push({
    //                     monthIndex: monthOccurIndex,
    //                     date: this.AddDays(startDate, index),
    //                     dayIndex: this.getDayIndexOfTheMonth(this.AddDays(startDate, index)),
    //                     day: curday,
    //                     added: false
    //                 })
    //                 if (!daysArrayInGivenPeriod.includes(curday) && days.some(item => (item['id'] % 7) === curday)) {
    //                     daysArrayInGivenPeriod.push(curday);
    //                 }
    //             }

    //             for (let i = 0; i < dateDiff; i++) {
    //                 let curDate = this.AddDays(startDate, i);
    //                 let flg = dayObject.filter(x => {
    //                     return x.day == curDate.getDay() && !x.added && x.dayIndex == monthlyDay && (x.monthIndex % everyRecurringNumber) == 0;
    //                 });
    //                 if (flg.length > 0) {
    //                     flg[0].added = true;
    //                 }
    //                 if (daysArrayInGivenPeriod.includes(curDate.getDay()) && flg.length > 0) {
    //                     let dt = flg.length > 0 ? flg[0].date : curDate;
    //                     if (dt.getTime() <= endDate.getTime()) {
    //                         dates.push(dt);
    //                     }
    //                 }
    //             }

    //         } else {
    //             let monthDiff = this.DateDiff.inMonths(startDate, endDate) + 1;
    //             for (let i = 0; i < monthDiff; i++) {
    //                 if ((everyRecurringNumber == 1 || (i % everyRecurringNumber) == 0) && startDate.getTime() <= endDate.getTime()) {
    //                     var monthlyDate1 = this.GetDateWithoutTime(new Date(startDate.getFullYear(), startDate.getMonth(), 1))

    //                     monthlyDate1.setMonth(startDate.getMonth() + i)
    //                     let m_startDate = cloneDeep(monthlyDate1);

    //                     let lastDate = new Date(m_startDate.getFullYear(), m_startDate.getMonth() + 1, 0).getDate();
    //                     if (lastDate < monthlyDate.getDate()) {
    //                         m_startDate.setDate(lastDate);
    //                     } else {
    //                         m_startDate.setDate(monthlyDate.getDate());
    //                     }
    //                     m_startDate = this.GetDateWithoutTime(m_startDate);
    //                     if (m_startDate.getTime() >= startDate.getTime() && m_startDate.getTime() <= endDate.getTime()) {
    //                         dates.push(m_startDate);
    //                     }
    //                 }
    //             }
    //         }
    //     } else if (type == RecurringType.Yearly) {
    //         let yearDiff = this.DateDiff.inYears(startDate, endDate) + 1;
    //         // Loop through years
    //         for (let i = 0; i < yearDiff; i++) {
    //             var y_startDate = this.dateAdd.AddYears(startDate, i)
    //             var y_year = y_startDate.getFullYear();
    //             var y_month = everyRecurringNumber;
    //             var weekArr: any[] = this.getWeekFirstArrayOfMonth(new Date(y_year, y_month, 1));
    //             // loop through the days
    //             for (let j = 0; j < days.length; j++) {
    //                 var firstOccuranceOfDay = weekArr.find(a => a.day == (days[j].id % 7));
    //                 var finalDate = firstOccuranceOfDay.dateOnly && (firstOccuranceOfDay.dateOnly + (7 * (monthlyDay)))

    //                 var sch_date = this.GetDateWithoutTime(new Date(y_year, y_month, finalDate));
    //                 if (sch_date.getTime() >= startDate.getTime() && sch_date.getTime() <= endDate.getTime()) {
    //                     dates.push(sch_date)
    //                 }
    //             }
    //         }
    //     }
    //     return dates;
    // }

    getDayIndexOfTheMonth(dt: Date): number {
        let startDate = cloneDeep(dt)
        startDate.setDate(1);
        return Math.floor(this.DateDiff.inDays(startDate, dt) / 7);
    }

    addMinsInTime(time: string, minutesToBeAdded: number) {
        return moment(time, 'hh:mm a').add(minutesToBeAdded, 'minutes').format('hh:mm a');
    }

    getWeekFirstArrayOfMonth(dt: Date): any[] {
        dt.setDate(1);
        var weekArr = [];
        for (let index = 0; index < 7; index++) {
            var dt1 = this.AddDays(dt, index)
            weekArr.push({
                day: dt1.getDay(),
                dateTime: dt1,
                dateOnly: dt1.getDate()
            });
        }
        return weekArr;
    }

    /**
     * Function to reset time part of date to 00:00:000
     * @param {Date} date
     * @returns {Date}
     * @memberof Utilities
     */
    resetTime(date: Date): Date {
        return this.localization.getDate(date.setHours(0, 0, 0, 0));
    }
    /**
    *
    * @param Properties This method creates a css class with given styles and returns the class name
    * @param uniqueString unique name to append in class name
    * @param Type belong to
    */
    CreateCssClass(Properties: CssProp[], uniqueString: string, Type: string, deleteClass: boolean = false): string {
        if (!Properties || Properties.length == 0) { return ''; }

        let className = `css-class-${Type}-${uniqueString.replace('#', '-')}`;

        if (document.getElementsByClassName(className).length > 0 && !deleteClass) {
            return className;
        }
        let styleDivElem = document.getElementsByClassName('Style-Div');
        if (!styleDivElem || styleDivElem.length == 0) {
            var styleDiv = document.createElement('div');
            styleDiv.classList.add('Style-Div');
            document.body.appendChild(styleDiv);
            styleDivElem = document.getElementsByClassName('Style-Div');
        }

        var style = document.createElement('style');
        style.classList.add(className);
        style.type = 'text/css';
        var styleStr = `.${className} { `;

        for (let style of Properties) {
            styleStr += ` ${style.property}:${style.value}; `
        }

        styleStr += ` }`

        style.innerHTML = styleStr;
        styleDivElem[0].appendChild(style);
        return className;
    }

    RgbaToRgb(RGBA) {
        let alpha = 1 - RGBA.alpha;
        let bg = { red: 255, green: 255, blue: 255 };
        let RGB = { red: 0, green: 0, blue: 0 };
        RGB.red = Math.round((RGBA.alpha * (RGBA.red / 255) + (alpha * (bg.red / 255))) * 255);
        RGB.green = Math.round((RGBA.alpha * (RGBA.green / 255) + (alpha * (bg.green / 255))) * 255);
        RGB.blue = Math.round((RGBA.alpha * (RGBA.blue / 255) + (alpha * (bg.blue / 255))) * 255);
        return `rgb(${RGB.red},${RGB.green},${RGB.blue})`;
    }

    hexToRgbA(hex: string, resetOpacity?: number): string {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            resetOpacity = resetOpacity ? resetOpacity : 1;
            //return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',' + resetOpacity + ')';
            return this.RgbaToRgb({ red: (c >> 16) & 255, green: (c >> 8) & 255, blue: c & 255, alpha: resetOpacity });
        }
        return '';
    }

    public appendFormat(value: string | number, format: string): string {
        if (!value && value == '') {//for null exception
            return '';
        }
        let userInput = value.toString();
        let returnVal: string = '';
        let indexOfUserValue: number = 0;
        if (format && format == '') {
            return value.toString();
        }
        for (let i = 0; i < format.length; i++) {
            const char = format[i];
            let charCode = char.toString().charCodeAt(0);
            const IsNumber: boolean = ((charCode >= 48) && (charCode <= 57));
            if (!IsNumber) {
                returnVal = returnVal + format[i];
            } else {
                if (userInput[indexOfUserValue]) {
                    returnVal = returnVal + userInput[indexOfUserValue];
                    indexOfUserValue++;
                } else {
                    break;
                }
            }
        }
        return returnVal;
    }

    // public phoneNumberFormatWithExtension(value: string) {
    //     value = value ? value : '';
    //     return value ? (value.indexOf(':') != -1) ?
    //         this.appendFormat(value.split(':')[1], this.captions.common.PhoneFormat).toString() + ' ext:' + value.split(':')[0].toString()
    //         : this.appendFormat(value, this.captions.common.PhoneFormat).toString() : ''
    // }

    // public formatPhoneNumber(value: string): string {
    //     value = value ? value : '';
    //     value = value.toString();
    //     return <string>this.appendFormat(value, this.captions.common.PhoneFormat);
    // }

    // public formatPhoneExtention(value: string): string {
    //     value = value ? value : '';
    //     value = value.toString();
    //     return <string>this.appendFormat(value, this.captions.common.ExtensionFormat);
    // }

    public removePhoneFormat(value: string) {
        value = value ? value : '';
        value = value.toString();
        return value.replace('(', '').replace(')', '').replace('-', '').replace(' ', '');
    }

    CheckForMaxvalue(value: any, maxlengthPositive: any = 999.99, maxlengthNegative: any = -999.99): boolean {
        return (value > maxlengthPositive || value < maxlengthNegative)
    }
    FormatValueForMaxLength(value: any, maxlengthPositive: any = 999.99, maxlengthNegative: any = -999.99): number {
        if (value > maxlengthPositive) {
            value = maxlengthPositive
        } else if (value < maxlengthNegative) {
            value = maxlengthNegative
        }
        return value;
    }


    //This method should only be used if the Input field does not have a time as Date() will include the timezone also.
    //For Eg, if the application is browsed from any location which has a Negative GMT (like PST or EST),
    //the Date("YYYY-MM-DD") will return 1 day less
    //Hence, we will append the hours and create a date
    parseDateToDateWithHours(date: string): Date {
        return this.getDate(date + 'T00:00:00');
    }



    getMinDate(...params: Date[]) {
        let firstDate = this.GetDateWithoutTime(params[0]);
        let minDate = cloneDeep(firstDate);
        for (const element of params) {
            let date = this.GetDateWithoutTime(element);
            if (minDate > date)
                minDate = cloneDeep(date);
        }
        return minDate;
    }

    getMaxDate(...params: Date[]) {
        let firstDate = this.GetDateWithoutTime(params[0]);
        let maxDate = cloneDeep(firstDate);
        for (const element of params) {
            let date = this.GetDateWithoutTime(element);
            if (maxDate < date)
                maxDate = cloneDeep(date);
        }
        return maxDate;
    }

    getFullMonth(dt: Date): string {
        return (dt.getMonth() + 1 > 9 ? dt.getMonth() + 1 : '0' + (dt.getMonth() + 1)).toString();
    }
    getFullDate(dt: Date): string {
        return (dt.getDate() > 9 ? dt.getDate() : '0' + dt.getDate()).toString();
    }

    GetClientTimeZone(): string {
        let zone: string = '';
        try {
            zone = Intl.DateTimeFormat().resolvedOptions().timeZone
        } catch (e) { }
        return zone;
    }
    GetCurrentUserSessionId(): number {
        let sessionId: number = 0;
        var session = sessionStorage.getItem(USER_SESSION)
        if (session) {
            sessionId = Number(session);
        }
        return sessionId;
    }

    // checkDateWithLocaleFormat(dateString: string): boolean {
    //     return moment(dateString, this.dateFormat, true).isValid();

    // }

    getFullName(firstName: string, lastName: string) {
        return firstName + ' ' + lastName;
    }

    getNumberString(input: string): string {
        return input.replace(/[^0-9]/g, '');
    }

    buildPhoneNumberToolTip(phoneType: number, phoneNumber: string): string | number {
        return (phoneType === ContactType.office && phoneNumber.split(':')[1]) ? this.appendFormat(phoneNumber.split(':')[1], this.localization.captions.common.PhoneFormat) + ' ext:' + phoneNumber.split(':')[0]
            : this.appendFormat(phoneNumber, this.localization.captions.common.PhoneFormat);
    }

    buildPhoneNumber(phoneType: number, extension: string, phoneNumber: string): string {
        phoneNumber = this.localization.validateString(phoneNumber) ? phoneNumber : '';
        return (phoneType == ContactType.office) && extension ? extension + ':' + this.getNumberString(phoneNumber) : this.getNumberString(phoneNumber);
    }

    getPhoneNumberFromValue(phoneType: number, phoneNumber: string): string | number {
        let result = ((phoneType === ContactType.office && phoneNumber.split(':')[1]) ? this.appendFormat(phoneNumber.split(':')[1], this.localization.captions.common.PhoneFormat)
            : this.appendFormat(phoneNumber, this.localization.captions.common.PhoneFormat));
        return result;
    }

    getExtensionFromValue(phoneType: number, phoneNumber: string): string {
        return phoneType === ContactType.office ? phoneNumber.split(':')[1] ? phoneNumber.split(':')[0] : '' : '';
    }

    isIpad() {
        const userAgent = navigator.userAgent || navigator.vendor;
        if (/iPad|iPhone|iPod/.test(userAgent)) {
            return true;
        }
        return false;
    }

    getUserInfoByKey(name: string) {
        const nameEQ = name + '=';

        const userInfo = sessionStorage.getItem(USER_INFO)
        if (userInfo != null) {
            const ca = userInfo.split(';');

            for (let i = 0; i < ca.length; i++) {
                let c = ca[i].trim();
                while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
                if (c.indexOf(nameEQ) == 0) { return c.substring(nameEQ.length, c.length); }
            }
        }
        return null;
    }

    calcAge(dateString) {
        return dateString != null ? ~~((Date.now() - +this.localization.getDate(dateString)) / (31557600000)) : 0;
    }

    findUserAgent() {
        const objAgent = navigator.userAgent;
        let objbrowserName = navigator.appName;

        if ((objAgent.indexOf('Edge')) != -1) {
            objbrowserName = 'Microsoft Edge';
        } else if ((objAgent.indexOf('Chrome')) != -1) {
            objbrowserName = 'Chrome';
            // objfullVersion = objAgent.substring(objOffsetVersion+7); 
        } else if ((objAgent.indexOf('Trident/7.0')) != -1) {
            objbrowserName = 'IE11 ';
        } else if ((objAgent.indexOf('Trident/6.0')) != -1) {
            objbrowserName = 'Internet Explorer 10';
        } else if ((objAgent.indexOf('Trident/5.0')) != -1) {
            objbrowserName = 'Internet Explorer 9';
        } else if ((objAgent.indexOf('Trident/4.0')) != -1) {
            objbrowserName = 'Internet Explorer 8';
        } else if ((objAgent.indexOf('Firefox')) != -1) {
            objbrowserName = 'Firefox';
        } else if ((objAgent.indexOf('Safari')) != -1) {
            objbrowserName = 'Safari';
        }
        return objbrowserName;
    }

    /**
     * Shows Error Popup 
     * @param {string} message content 
     * @memberof Utilities
     */
    public showError(message: string): void {
        this.showAlert(message, AlertType.Error, ButtonType.Ok);
    }

    /**
   * Alert popup to show 'Warning' , 'Error' , 'Success'
   * @param {string} message  - Content
   * @param {AlertType} type  - Type of Popup  
   * @param {ButtonType} [btnType=ButtonType.Ok] - Button Actions Type( by default 'Ok')
   * @param {(result: string, extraParams?: any[]) => void} [callback] - CallBack ( optional ) 
   * @returns - Dialog Reference of the modal with Result of enum AlertAction
   * @memberof Utilities
   */
    public showAlert(message: string, type: AlertType, btnType: ButtonType = ButtonType.Ok,
        callback?: (result: AlertAction, extraParams?: any[]) => void, extraParams?: any[], headerText?: string,
         additionalInfo?: {message: string, class: string}) {

        const dialogRef = this.dialog.open(CommonAlertPopupComponent, {
            height: 'auto',
            width: '300px',
            data: { type: type, message: message, buttontype: btnType, header: headerText, additionalInfo },
            panelClass: 'small-popup',
            disableClose: true,
        });
        this.subscription = dialogRef.afterClosed().subscribe(res => {
            if (callback) {
                callback(res, extraParams);
            }
        });
        return dialogRef;
    }

    /**
  * search filter
  * @param searchText
  */
    SearchFilter(searchText: string, searchKey: string[], searcData: any[]): any {
        const headerarray = searchKey;
        if (headerarray && headerarray.length > 0 && searcData) {
            return searcData.filter(result => {
                const headerKey = headerarray;
                for (const key in result) {
                    if (typeof (result[key]) == 'string' && result[key].toLowerCase().includes(searchText.toLowerCase())) {
                        if (headerKey.indexOf(key) != -1) {
                            return result[key].toLowerCase().includes(searchText.toLowerCase());
                        }
                    } else if (typeof (result[key]) == 'number') {
                        if (headerKey.indexOf(key) != -1) {
                            const matchedValue = Number(result[key].toString().toLowerCase().includes(searchText.toLowerCase()));
                            if (matchedValue) {
                                return matchedValue;
                            }
                        }
                    }
                }
            });

        }
    }

    public getLocalDateTime(inputDate: Date): Date {
        if (inputDate) {
            const currentDate = Date.parse(inputDate.toString().replace('T', ' ') + ' GMT');
            return new Date(currentDate);
        } else {
            return null;
        }
    }

    public CompareArrays(arr1, arr2) {
        return differenceWith(arr1, arr2, isEqual);
    }

        convertToNumber(x: any) {
        if(x && typeof(x) == "string")
        {
               x= x.replace(',','') 
        }
        if (isNaN(x)) {
            return 0;
        }
        else
            return Number(x);
    }

    /**
  * 
  * @param popupData 
  * @param callback
  * @returns - Dialog Reference of the modal with Result
  */
//  OpenCardSwipeDialog(popupData: any, callback?: (x: any) => void): MatDialogRef<any, any> {
//     const data = {
//         headername: popupData.headertext,
//         headerIcon: popupData.icon,
//         headerMessage: popupData.text,
//         buttonName: popupData.buttonname,
//         type: 'message',
//         isloaderenable : popupData.isloaderenable,
//         isHiddenFieldRequired: popupData.isHiddenFieldRequired,
//         cardpayment: popupData.cardpayment
//     }
//     const dialogRef = this.dialog.open(CardSwipePopupComponent, {
//         width: '350px',
//         hasBackdrop: true,
//         panelClass: 'small-popup',
//         data: data,
//         disableClose: true
//     });
//     const subscription = dialogRef.afterClosed().subscribe((x) => {
//         if (callback) {
//             callback(x);
//         }
//         if (subscription) {
//             subscription.unsubscribe();
//         }
//     });
//     return dialogRef;
// }

    getMsalAuthParams(): AuthenticationParameters {
        return {
            scopes : Window.prototype.MsalConfig.Scopes
        };
    }

    // getMsalConfigurationForRoot(): Configuration {
    //     return {
    //         auth: {
    //             clientId: Window.prototype.MsalConfig.AppId,
    //             redirectUri: Window.prototype.MsalConfig.RedirectUri
    //         }
    //     };
    // }

    // getMsalAngularConfiguration(): MsalAngularConfiguration {
    //     return {
    //         consentScopes: Window.prototype.MsalConfig.Scopes,
    //         protectedResourceMap: [
    //           ['https://graph.microsoft.com/v1.0/me', ['user.read']]
    //         ]
    //       };
    // }

    openUrlAsNewTab(url: string) {
        window.open(url, '_blank');
    }
    
    openUrlAsPopoutWindow(url: string) {
        window.open(url, '', 'width=800,height=900');
    }    

    // To do : to be removed once login details moved to localStorage
    public GetUserInfo(name: string) {
        return this.localization.GetsessionStorageValue('_userInfo', name);
    }
}


