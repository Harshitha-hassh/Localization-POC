import { FormGroup } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material";
import * as _ from 'lodash'
import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import * as moment from "moment";
import { SubscriptionLike as ISubscription } from "rxjs";
import { CommonUtilities } from 'src/app/common/shared/shared/utilities/common-utilities';

import { HttpServiceCall, HttpMethod } from 'src/app/common/shared/shared/service/http-call.service';
import { CommonPropertyInformation } from 'src/app/common/shared/services/common-property-information.service';
import { FormatText } from 'src/app/common/shared/shared/pipes/formatText-pipe.pipe';
import * as GlobalConst from 'src/app/common/shared/shared/globalsContant';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { RetailPropertyInformation } from 'src/app/retail/common/services/retail-property-information.service';
import { MoreSectionServiceService } from 'src/app/retail/shared/more-section/more-section-service.service';
import { AlertMessagePopupComponent } from 'src/app/retail/shared/alert-message-popup/alert-message-popup.component';
import { DialogOverviewExampleDialog } from 'src/app/retail/shared/dialog-popup/dialogPopup-componenet';
import { ButtonType } from 'src/app/retail/shared/globalsContant';
import { MoreFilterOptions } from 'src/app/retail/shared/business/shared.modals';
export enum RedirectToModules {
    retail = 1,
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
    add = "add",
    remove = "remove",
    replace = "replace",
    copy = "copy",
    move = "move",
    test = "test"
}

export enum RecurringType {
    Daily = 0,
    Weekly = 1,
    Monthly = 2,
    Yearly = 3
}

export enum AppointmentColorConfiguration {
    "CKIN" = "APPOINMENT_CHECKEDIN_COLOR",
    "RESV" = "APPOINMENT_SCHEDULED_COLOR",
    "NOSHOW" = "APPOINMENT_NOSHOW_COLOR",
    "CKOUT" = "APPOINMENT_CHECKEDOUT_COLOR",
    "CANC" = "APPOINMENT_CANCEL_COLOR",
    "WAIT" = "APPOINMENT_WAIT_COLOR",
    "OPEN" = "APPOINMENT_OPEN_COLOR",
    "CLOSED" = "APPOINMENT_CLOSED_COLOR",
    "TEMP" = "APPOINMENT_TEMP_COLOR",
    "BREAK" = "APPOINMENT_BREAK_COLOR",
    "SETUP" = "APPOINMENT_SETUP_COLOR",
    "BREAKDOWN" = "APPOINMENT_BREAKDOWN_COLOR",
    "ONCALL" = "APPOINMENT_ONCALL_COLOR"
}

export enum InputTypeNumbers {
    NUMBERS = "onlynumber",
    ONLYPOSITIVE = "nonnegative",
    ONLYNEGATIVE = "onlynegative",
    NODECIMAL = "nodecimal",
    DECIMAL = "decimal",
    ROUNDOFF = "roundoff2",
    PERCENT = "validPercentage",
    POSITIVEDECIMAL = "onlyPositiveDecimal",
    POSITIVEDECIMALORNUMERIC = 'PositiveDecimalOrNumeric',
    NUMBERWITHSEPARATOR = "numberWithSeparator"
}

export enum InputTypeText {
    CAP = "capitalise",
    TEXT = "textonly",
    NOSPL = "nospecailchar",
    NOSPACE = "notallowspace",
    EMAIL = "email"
}


export interface CssProp {
    property: string;
    value: string;
}


export function stringFormat(input: string, appendBy?: string) {
    if (appendBy) {
        return input ? (input == "" ? "" : input + appendBy) : "";
    } else {
        return input ? (input == "" ? "" : input) : "";
    }
}



export function convertPhoneNoToUiNo(num: string): string {
    if (num != null || num == "") {
        return (
            num.substring(3, 0) +
            " - " +
            num.substring(6, 3) +
            " - " +
            num.substring(num.length, 6)
        );
    } else {
        return "";
    }
}

export function tConvert(tt) {
    var time = tt.substring(tt.indexOf("T") + 1, tt.length);
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [
        time
    ];

    if (time.length > 1) {
        // If time format correct
        time = time.slice(1); // Remove full string match value
        time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(""); // return adjusted time or original string
}

export function addMinutesToGivenTime(time, minTobeAdded) {
    let dummyDate: Date = this.getDate("2019-01-01T" + time);
    let dateTimeValue = dummyDate.setMinutes(
        dummyDate.getMinutes() + minTobeAdded
    );
    let dateTimeWithAddedMinutes = this.getDate(dateTimeValue);

    let hours = dateTimeWithAddedMinutes.getHours();
    let min = dateTimeWithAddedMinutes.getMinutes();

    return (hours < 9 ? "0" + hours.toString() : hours.toString()) + ":" + (min < 9 ? "0" + min.toString() : min.toString());
}

@Injectable(
    { providedIn: 'root'}
)
export class RetailUtilities extends CommonUtilities implements OnDestroy {
    subscription: ISubscription;
    constructor(public localization: RetailLocalization, public dialog: MatDialog, public httpServiceCall: HttpServiceCall, public route: Router,
        public _MoreSectionServiceService: MoreSectionServiceService, public PropertyInfo: RetailPropertyInformation, public CommonPropertyInfo: CommonPropertyInformation, public formatphno: FormatText) {
            super(localization, dialog, httpServiceCall, route,
                _MoreSectionServiceService, CommonPropertyInfo, formatphno);
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    /*
         * The method returns the only edited data in PatchJson format.
         * In addition to that, The @param defaultKeys -The values of the controls having the name will be added by default.
         * @param formGroup - FormGroup to get the edited data
         */

    getEditedData(formGroup: FormGroup, idKey?: string, defaultKeys?: string[], dateKeys?: string[]): any {
        let patchJson = [];
        let keyValue: string;
        let keys: string[] = Object.keys(formGroup.controls);

        defaultKeys = defaultKeys ? defaultKeys : [];
        let fnconvertDateObjToAPIdate = this.localization.convertDateObjToAPIdate;
        keys.forEach(function (key) {
            if (idKey == key) keyValue = formGroup.controls[key].value;

            if (formGroup.controls[key].dirty || defaultKeys.includes(key)) {
                var val = formGroup.controls[key].value;
                if (dateKeys && dateKeys.includes(key)) {
                    val = typeof val != "string" ? fnconvertDateObjToAPIdate(val) : val;
                }
                patchJson.push({
                    op: PatchOperation.replace,
                    path: "/" + key,
                    value: val
                });
            }
        });
        return {
            key: keyValue,
            patchJson: patchJson
        };
    }
    
    ShowErrorMessage(title: string, message: any, popButtonType: ButtonType = ButtonType.Ok, callback?: (result: string, extraParams?: any[]) => void, extraParams?: any[] | any, closebool = true) {
        this.hideOverlays();
        let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
            height: 'auto',
            width: '40%',
            data: { headername: title, closebool: closebool, templatename: 'In the Given Data', datarecord: message, buttonType: popButtonType },
            panelClass: 'small-popup',
            disableClose: true,
            hasBackdrop: true
        });
        this.subscription = dialogRef.afterClosed().subscribe(res => {
            if (callback)
                callback(res, extraParams);
        });
        return dialogRef;
    }

    IsTherapistHaveSchedule(dateTime, TherapistObj) {
        if (!dateTime || !TherapistObj) return false;
        let therapistScheduled = false;
        if (TherapistObj && TherapistObj.length) {
            for (let i = 0; i < TherapistObj.length; i++) {
                const therap = TherapistObj[i];
                const timeArr = therap ? therap.availableTime : null;
                if (!timeArr) break;
                for (let k = 0; k < timeArr.length; k++) {
                    const timeList = timeArr[k];
                    if (timeList.fromTime && timeList.toTime && dateTime >= this.getDate(timeList.fromTime) && dateTime < this.getDate(timeList.toTime)) {
                        therapistScheduled = true;
                    }
                }

                const breakTimeArr = therap ? therap.breakTime : null;
                if (!breakTimeArr) break;
                for (let k = 0; k < breakTimeArr.length; k++) {
                    const breakTimeList = breakTimeArr[k];
                    if (breakTimeList.fromTime && breakTimeList.toTime) {
                        let fromBreakTime = this.getDate(breakTimeList.fromTime);
                        let toBreakTime = this.getDate(breakTimeList.toTime);
                        let nearest15MinutesFromBreakTime = this.AddMinutes(fromBreakTime, -1 * fromBreakTime.getMinutes() % 15);
                        let nearest15MinutesToBreakTime = this.AddMinutes(toBreakTime, fromBreakTime.getMinutes() % 15 == 0 ? 0 : (15 - fromBreakTime.getMinutes() % 15));
                        if (dateTime >= nearest15MinutesFromBreakTime && dateTime < nearest15MinutesToBreakTime) {
                            therapistScheduled = false;
                        }
                    }

                }

            }
        }
        return therapistScheduled;
    }

    IsTherapistHaveOnCallSchedule(dateTime, TherapistObj) {
        if (!dateTime || !TherapistObj) return false;
        let therapistScheduled = false;
        if (TherapistObj && TherapistObj.length) {
            for (let i = 0; i < TherapistObj.length; i++) {
                const therap = TherapistObj[i];
                const timeArr = therap ? therap.availableTime : null;
                if (!timeArr) break;
                for (let k = 0; k < timeArr.length; k++) {
                    const timeList = timeArr[k];
                    if (timeList.fromTime && timeList.toTime && dateTime >= this.getDate(timeList.fromTime) && dateTime < this.getDate(timeList.toTime)) {
                        if (timeList.availableOnCall)
                            therapistScheduled = true;
                    }
                }
            }
        }
        return therapistScheduled;
    }

    IsTherapistHaveOnCallScheduleCopyAndMove(dateTime, TherapistObj) {
        if (!dateTime || !TherapistObj) return false;
        let therapistScheduled = false;
        let therapistScheduleData = TherapistObj[0].scheduleTime;
        if (TherapistObj && therapistScheduleData.length) {
            for (let k = 0; k < therapistScheduleData.length; k++) {
                const timeList = therapistScheduleData[k];
                if (timeList.startTime && timeList.endTime && dateTime >= this.getDate(timeList.startTime) && dateTime < this.getDate(timeList.endTime)) {
                    if (timeList.availableOnCall)
                        therapistScheduled = true;
                }
            }
        }
        return therapistScheduled;
    }

    /**Localization verified - Do not remove this comment  - language param needs to be removed*/
    FormatAppointmentDateTime(startTime: any, endTime: any): string {
        let StartApptTime: Date = this.getDate(startTime);
        let EndApptTime: Date = this.getDate(endTime);
        // let date: number = StartApptTime.getDate();
        // let appointmentTime: string = (date > 9 ? date : `0${date}`) + "-" + monthNames[StartApptTime.getMonth()] + " " + this.formatAMPM(StartApptTime, true) + " - " + this.formatAMPM(EndApptTime, true);
        // return appointmentTime;
        return this.localization.LocalizeShortDate(StartApptTime) + " " + this.FormatAppointmentTime(StartApptTime, EndApptTime);
    }

    FormatAppointmentTime(startTime: any, endTime: any, isCapital = false): string {
        let StartApptTime: Date = this.getDate(startTime);
        let EndApptTime: Date = this.getDate(endTime);
        let appointmentTime: string = this.localization.LocalizeTime(StartApptTime, isCapital) + " - " + this.localization.LocalizeTime(EndApptTime, isCapital);
        return appointmentTime;
    }

    getGuid(callDesc = "GetGuid", successCallback, errorCallback, extraParams) {
        this.httpServiceCall.CallApiWithCallback<any>({
            host: GlobalConst.Host.schedule,
            success: successCallback,
            error: errorCallback,
            callDesc: callDesc,
            method: HttpMethod.Get,
            showError: true,
            extraParams: extraParams
        });
    }

    getclassNames(startTime, endTime, className, parentClass, time, ShowLapoption, dataLength, ObjectIndex) {
        let currentselectedDivParent = document.getElementsByClassName(parentClass)[0];
        let currentselectedDiv = document.getElementsByClassName(className)[0];
        let differenceFA = this.getTimeDifference(this.localization.LocalizeTime(time), this.localization.LocalizeTime(startTime), 'Min');
        let differenceFT = this.getTimeDifference(this.localization.LocalizeTime(startTime), this.localization.LocalizeTime(endTime), 'Min');
        let topPosition = (differenceFA / GlobalConst.GridTimeInterval) * 100;
        let cellheight = (differenceFT / GlobalConst.GridTimeInterval) * 100;

        if (currentselectedDiv) {
            currentselectedDiv["style"].top = topPosition + "%";
            currentselectedDiv["style"].height = cellheight + "%";
        }
        if (currentselectedDiv) {
            currentselectedDivParent["style"].width = "0px";
            currentselectedDiv["style"].top = topPosition + "%";
            currentselectedDiv["style"].height = cellheight + "%";
            if (ShowLapoption) {
                let widthSize = 200;
                /*
                if (document.getElementsByClassName(tdClass).length > 0) {
                    let tdElem: any = document.querySelectorAll("." + tdClass)[0];
                    widthSize = tdElem.offsetWidth / dataLength
                }
                if (widthSize < 200) {
                    widthSize = 200;
                }
    */
                if (dataLength > 1) {
                    currentselectedDivParent["style"].width = (widthSize * dataLength) + "px";
                    for (let l = 0; l <= dataLength; l++) {
                        if (l == ObjectIndex) {
                            currentselectedDiv["style"].width = widthSize + "px";
                            currentselectedDiv["style"].left = (widthSize * l) + "px";
                        }
                    }
                }
            }

        }
        return true;
    }
    getclassNames_New(startTime, endTime, className, parentClass, setupClassname, breakdownClassname, time, ShowLapoption, data, i, j, poi, ObjectIndex, currData, timinterval, selecteddateIDwithYr, appointmentConfiguration) {

        let dataLength = data.length;
        let widthSize = 200;
        let timeInterval = timinterval;

        let setupTime = currData.appointmentDetail.setUpTime;
        let breakdownTime = currData.appointmentDetail.breakDownTime;


        let currentselectedSetupTimeDiv = document.getElementsByClassName(setupClassname)[0];
        let currentselectedBreakDownDiv = document.getElementsByClassName(breakdownClassname)[0];

        //To Do: Customize appt time for exceptional appt time
        // if(selecteddateIDwithYr && selecteddateIDwithYr !=''){
        //     this.changeExceptionalApptTime(data , selecteddateIDwithYr, appointmentConfiguration);
        //     }

        let currentselectedDivParent = document.getElementsByClassName(parentClass)[0];
        let currentselectedDiv = document.getElementsByClassName(className)[0];
        let differenceFA = this.getTimeDifference(this.localization.LocalizeTime(time), this.localization.LocalizeTime(startTime), 'Min');

        let differenceFT = this.getTimeDifference(this.getDate(currData.appointmentDetail.startTime), this.getDate(currData.appointmentDetail.endTime), 'Min');
        // let setuptopPosition = (differenceFA / timeInterval) * 100 + (differenceFA / timeInterval);
        // let topPosition = ((differenceFA) / timeInterval) * 100 + ((differenceFA) / timeInterval);
        // let cellheight = (differenceFT / timeInterval) * 100 + (differenceFT / timeInterval);
        // let cellSUheight = (setupTime / timeInterval) * 100 + (setupTime / timeInterval);
        // let cellBDheight = (breakdownTime / timeInterval) * 100 + (breakdownTime / timeInterval);

        let setuptopPosition = (differenceFA / timeInterval) * 100;
        let topPosition = ((differenceFA) / timeInterval) * 100;
        let cellheight = (differenceFT / timeInterval) * 100;
        let cellSUheight = (setupTime / timeInterval) * 100;
        let cellBDheight = (breakdownTime / timeInterval) * 100;

        let otherOverlapCount = data[0].overlapped;
        let otherdoubleOverlapCount = data[0].overalldoubleoverlapcnt
        let otheOverlapflag = data[0].overlappedFlag


        if (currentselectedDiv && currentselectedSetupTimeDiv && currentselectedBreakDownDiv) {
            currentselectedDiv["style"].left = "0px";
            currentselectedDiv["style"].width = "100%";
            currentselectedSetupTimeDiv["style"].left = "0px";
            currentselectedSetupTimeDiv["style"].width = "100%";
            currentselectedBreakDownDiv["style"].left = "0px";
            currentselectedBreakDownDiv["style"].width = "100%";

            currentselectedDiv["style"].top = topPosition + "%";
            // currentselectedDiv["style"].height = cellheight + "%";
            let PropertyOperateTime = {
                startTime: "00:00",
                endTime: "23:59"
            }
            PropertyOperateTime.startTime = appointmentConfiguration[0]["APPOINMENT_OPENTIME"];
            PropertyOperateTime.endTime = appointmentConfiguration[0]["APPOINMENT_CLOSETIME"];

            let beginningTime = moment(PropertyOperateTime.endTime, 'h:mm');
            let endTime = moment(this.getTime(currData.appointmentDetail.endTime, 24), 'h:mm');
            let brkendTime = moment(this.getTime(currData.appointmentDetail.endTimewithbreakdowntime, 24), 'h:mm');

            if (endTime.isAfter(beginningTime) && (cellheight > 99)) {
                let tempdifference = this.getTimeDifference(this.getDate(currData.appointmentDetail.startTime), this.localization.AddTimeToDate(selecteddateIDwithYr, moment(PropertyOperateTime.endTime, "HH:mm").toDate()), 'Min');
                currentselectedDiv["style"].height = (tempdifference / timeInterval) * 100 + "%";
            } else {
                currentselectedDiv["style"].height = cellheight + "%";
            }

            currentselectedSetupTimeDiv["style"].top = setuptopPosition - cellSUheight + "%";
            currentselectedSetupTimeDiv["style"].height = cellSUheight + "%";
            if (currData.appointmentDetail.endTimewithbreakdowntime == "2019-01-11T20:25") { }
            if (brkendTime.isAfter(beginningTime) && (cellheight > 99)) {
                currentselectedBreakDownDiv["style"].top = "0%";
                currentselectedBreakDownDiv["style"].height = "0%";
            } else {
                currentselectedBreakDownDiv["style"].top = (setuptopPosition + cellheight) + "%";
                currentselectedBreakDownDiv["style"].height = cellBDheight + "%";
            }

            // currentselectedBreakDownDiv["style"].top = (setuptopPosition + cellheight) + "%";
            // currentselectedBreakDownDiv["style"].height = cellBDheight + "%";

            currentselectedDivParent["style"].width = "0px";
            currentselectedDiv["style"].top = topPosition + "%";
            // currentselectedDiv["style"].height = cellheight + "%";
            if (ShowLapoption) {
                // if (dataLength > 1) {
                //     currentselectedDivParent["style"].minWidth = (widthSize * dataLength) + "px";
                //     for (let l = 0; l <= dataLength; l++) {
                //         if (l == ObjectIndex) {
                //             currentselectedDiv["style"].width = widthSize + "px";
                //             currentselectedDiv["style"].left = (widthSize * l) + "px";
                //         }
                //     }
                // }
                if (dataLength > 1 || otherOverlapCount > 0 || otheOverlapflag) {
                    currentselectedDiv["style"].width = widthSize + "px";
                    currentselectedDiv["style"].left = (widthSize * (ObjectIndex + otherOverlapCount)) + "px";
                    currentselectedSetupTimeDiv["style"].width = widthSize + "px";
                    currentselectedSetupTimeDiv["style"].left = (widthSize * (ObjectIndex + otherOverlapCount)) + "px";
                    currentselectedBreakDownDiv["style"].width = widthSize + "px";
                    currentselectedBreakDownDiv["style"].left = (widthSize * (ObjectIndex + otherOverlapCount)) + "px";
                    let newDlen = dataLength + otherOverlapCount;
                    // if ((parseInt(currentselectedDivTH["style"].width) ? parseInt(currentselectedDivTH["style"].width) : 0) < widthSize * newDlen) {
                    //if (!this.ResetHeaderFlag && this.tabColArr.length > 1) {
                    currentselectedDivParent["style"].minWidth = (widthSize * newDlen) + "px";
                    currentselectedDivParent["style"].width = (widthSize * newDlen) + "px";
                    //   } else {
                    //     currentselectedDivTH["style"].minWidth = (widthSize * newDlen) + "px";
                    //     currentselectedDivTH["style"].width = "inherit";
                    //   }
                    // }
                }
            }

            currData.setcss = false;
        }
        return true;
    }

    public changeExceptionalApptTime(data, selecteddateIDwithYr, appointmentConfiguration) {

        let PropertyOperateTime = {
            startTime: "00:00",
            endTime: "23:59"
        }
        PropertyOperateTime.startTime = appointmentConfiguration[0]["APPOINMENT_OPENTIME"];
        PropertyOperateTime.endTime = appointmentConfiguration[0]["APPOINMENT_CLOSETIME"];

        let GridFromTime = this.localization.AddTimeToDate(selecteddateIDwithYr, moment(PropertyOperateTime.startTime, "HH:mm").toDate());
        let GridToTime = this.localization.AddTimeToDate(selecteddateIDwithYr, moment(PropertyOperateTime.endTime, "HH:mm").toDate());

        if (data.appointmentDetail.status == "BREAK" && data.appointmentDetail.locationId > 0) {
            let StartApptTime: Date = this.getDate(data.appointmentDetail.startTime);
            let EndApptTime: Date = this.getDate(data.appointmentDetail.endTime);
            if (moment(StartApptTime).isSameOrBefore(GridFromTime) && moment(EndApptTime).isSameOrAfter(GridToTime)) {
                data.appointmentDetail.startTime = this.localization.ConvertDateToISODateTime(GridFromTime);
                data.appointmentDetail.endTime = this.localization.ConvertDateToISODateTime(GridToTime);
            }
            else if (moment(StartApptTime).isSameOrBefore(GridFromTime) && moment(EndApptTime).isSameOrBefore(GridToTime)) {
                data.appointmentDetail.startTime = this.localization.ConvertDateToISODateTime(GridFromTime);
            }
            else if (moment(StartApptTime).isSameOrAfter(GridFromTime) && moment(EndApptTime).isSameOrAfter(GridToTime)) {
                data.appointmentDetail.endTime = this.localization.ConvertDateToISODateTime(GridToTime);
            }
        }
    }

    GetAppointmentColors(status: string): AppointmentColors {
        let AppointmentColors: AppointmentColors = {
            BackGround: "",
            BackGroundLight: "",
            Border: "",
            Color: "",
            ColorLight: ""
        };
        if (status == "CKIN") {
            AppointmentColors.BackGround = "checkinBGclr";
            AppointmentColors.BackGroundLight = "checkinBGclrLight";
            AppointmentColors.Color = "checkedinTextclr";
            AppointmentColors.ColorLight = "checkedinTextclrLight";
            AppointmentColors.Border = "checkinBDRclr";
        }
        else if (status == "CKOUT") {
            AppointmentColors.BackGround = "checkoutBGclr";
            AppointmentColors.BackGroundLight = "checkoutBGclrLight";
            AppointmentColors.Color = "checkedoutTextclr";
            AppointmentColors.ColorLight = "checkedoutTextclrLight";
            AppointmentColors.Border = "checkoutBDRclr";
        }
        else if (status == "CLOSED") {
            AppointmentColors.BackGround = "closeBGclr";
            AppointmentColors.BackGroundLight = "closeBGclrLight";
            AppointmentColors.Color = "closeTXTclrLight";
            AppointmentColors.ColorLight = "closeTXTclrLight";
            AppointmentColors.Border = "closeBDRclr";
        }
        else if (status == "NOSHOW") {
            AppointmentColors.BackGround = "nsBGclr";
            AppointmentColors.BackGroundLight = "nsBGclrLight";
            AppointmentColors.Color = "noshowTextclr";
            AppointmentColors.ColorLight = "noshowTextclrLight";
            AppointmentColors.Border = "nsBDRclr";

        }
        else if (status == "RESV") {
            AppointmentColors.BackGround = "sBGclr";
            AppointmentColors.BackGroundLight = "sBGclrLight";
            AppointmentColors.Color = "scheduledTextclr";
            AppointmentColors.ColorLight = "scheduledTextclrLight";
            AppointmentColors.Border = "sBDRclr";
        }
        else if (status == "TEMP") {
            AppointmentColors.BackGround = "closeBGclr";
            AppointmentColors.BackGroundLight = "closeBGclrLight";
            AppointmentColors.Color = "closeTXTclrLight";
            AppointmentColors.ColorLight = "closeTXTclrLight";
            AppointmentColors.Border = "closeBDRclr";
        }
        else if (status == "BREAK") {
            AppointmentColors.BackGround = "closeBGclr";
            AppointmentColors.BackGroundLight = "closeBGclrLight";
            AppointmentColors.Color = "closeTXTclrLight";
            AppointmentColors.ColorLight = "closeTXTclrLight";
            AppointmentColors.Border = "closeBDRclr";
        }
        return AppointmentColors;
    }
    /**
    *
    * @param Properties This method creates a css class with given styles and returns the class name
    * @param uniqueString unique name to append in class name
    * @param Type belong to
    */
    CreateCssClass(Properties: CssProp[], uniqueString: string, Type: string, deleteClass: boolean = false): string {
        if (!Properties || Properties.length == 0) return "";

        let className = `css-class-${Type}-${uniqueString.replace('#', '-')}`;

        if (document.getElementsByClassName(className).length > 0 && !deleteClass) {
            return className;
        }
        let styleDivElem = document.getElementsByClassName("Style-Div");
        if (!styleDivElem || styleDivElem.length == 0) {
            var styleDiv = document.createElement("div");
            styleDiv.classList.add("Style-Div");
            document.body.appendChild(styleDiv);
            styleDivElem = document.getElementsByClassName("Style-Div");
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

    public appendFormat(value: string | number, format: string) {
        if (!value && value == "") {
            return "";
        }
        let userInput = value.toString();
        let returnVal: string = "";
        let indexOfUserValue: number = 0;
        // if (format && format == "") {
        if (format == "") {
            return value;
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

    getConfiguration(successCallback, errorCallBack, moduleName: string, switchName: string) {
        this.httpServiceCall.CallApiWithCallback<any>({
            host: GlobalConst.Host.spaManagement,
            success: successCallback,
            error: errorCallBack,
            callDesc: "GetConfiguration",
            method: HttpMethod.Get,
            uriParams: { module: moduleName, Switch: switchName },
            showError: true,
            extraParams: []
        });
    }



    // getstatusColour(_appointmentService: appointmentService, appointmentDetail: any, breakTypeDetail: any = null): string {

    //     status = appointmentDetail.status;
    //     if (status == "BREAK" && appointmentDetail.locationId !== 0) {
    //         status = 'CLOSED';
    //     }
    //     if (status == "BREAK" && breakTypeDetail != null) {
    //         var color = _appointmentService.managementData["BreakType"].filter(x => { return x.id == breakTypeDetail.id });
    //         if (color && color.length > 0 && color[0].color != null) {


    //             let props: CssProp[] = [];

    //             let bgcolorRgba = this.hexToRgbA(color[0].color, 0.1);
    //             let bordercolorRgba = this.hexToRgbA(color[0].color, 1);
    //             props = [{
    //                 property: "background",
    //                 value: bgcolorRgba + " !important"
    //             },
    //             {
    //                 property: "border",
    //                 value: " 2px solid " + bordercolorRgba + " !important"
    //             }];

    //             return this.CreateCssClass(props, color[0].color, 'Status');
    //         }
    //     }
    //     else if (appointmentDetail.linkCodeId > 0 && _appointmentService.managementData) {
    //         var color = _appointmentService.managementData["LinkCode"].filter(x => { return x.id == appointmentDetail.linkCodeId });
    //         if (color && color.length > 0) {


    //             let props: CssProp[] = [];

    //             let bgcolorRgba = this.hexToRgbA(color[0].color, 0.1);
    //             let bordercolorRgba = this.hexToRgbA(color[0].color, 1);
    //             let txtcolorRgba = this.hexToRgbA(color[0].color, 1);
    //             props = [{
    //                 property: "background",
    //                 value: bgcolorRgba + " !important"
    //             },
    //             {
    //                 property: "border",
    //                 value: " 2px solid " + bordercolorRgba + " !important"
    //             }];
    //             return this.CreateCssClass(props, color[0].color, 'Status');
    //         }
    //     }


    //     if (appointmentDetail.linkCodeId == 0 && _appointmentService.managementData && status == 'RESV') {
    //         var color = _appointmentService.managementData["Service"].filter(x => { return x.id == appointmentDetail.serviceId });
    //         if (color && color.length > 0 && color[0].colorCode != null && color[0].colorCode != '') {


    //             let props: CssProp[] = [];

    //             let bgcolorRgba = this.hexToRgbA(color[0].colorCode, 0.1);
    //             let bordercolorRgba = this.hexToRgbA(color[0].colorCode, 1);
    //             let txtcolorRgba = this.hexToRgbA(color[0].colorCode, 1);
    //             props = [{
    //                 property: "background",
    //                 value: bgcolorRgba + " !important"
    //             },
    //             {
    //                 property: "border",
    //                 value: " 2px solid " + bordercolorRgba + " !important"
    //             }];
    //             return this.CreateCssClass(props, color[0].colorCode, 'Status');
    //         }
    //     }


    //     let config = _appointmentService.managementData["AppointmentConfigurations"]

    //     if (config && Object.keys(config).length > 0) {
    //         let colorObject = Object.keys(config);
    //         let color = config[AppointmentColorConfiguration[status]];

    //         let props: CssProp[] = [];

    //         let bgcolorRgba = this.hexToRgbA(color, 0.1);
    //         let bordercolorRgba = this.hexToRgbA(color, 1);
    //         props = [{
    //             property: "background",
    //             value: bgcolorRgba + " !important"
    //         },
    //         {
    //             property: "border",
    //             value: " 2px solid " + bordercolorRgba + " !important"
    //         }];
    //         return this.CreateCssClass(props, color, 'Status');

    //     }

    //     let colornameBDR;
    //     let colornameBACKGRNDLight;
    //     if (status == "CKIN") {
    //         colornameBDR = "checkinBDRclr";
    //         colornameBACKGRNDLight = "checkinBGclrLight";
    //     }
    //     else if (status == "CKOUT") {
    //         colornameBDR = "checkoutBDRclr";
    //         colornameBACKGRNDLight = "checkoutBGclrLight";
    //     }
    //     else if (status == "CLOSED") {
    //         colornameBDR = "closeBDRclr";
    //         colornameBACKGRNDLight = "closeBGclrLight";
    //     }
    //     else if (status == "NOSHOW") {
    //         colornameBDR = "nsBDRclr";
    //         colornameBACKGRNDLight = "nsBGclrLight";
    //     }
    //     else if (status == "RESV") {
    //         colornameBDR = "sBDRclr";
    //         colornameBACKGRNDLight = "sBGclrLight";
    //     }
    //     else if (status == "TEMP") {
    //         colornameBDR = "sBDRclr";
    //         colornameBACKGRNDLight = "sBGclrLight";
    //     }
    //     else if (status == "BREAK") {
    //         colornameBDR = "closeBDRclr";
    //         colornameBACKGRNDLight = "closeBGclrLight";
    //     }
    //     else if (status == "ONCALL") {
    //         colornameBDR = "closeBDRclr";
    //         colornameBACKGRNDLight = "closeBGclrLight";
    //     }
    //     return colornameBDR + ' ' + colornameBACKGRNDLight;
    // }
    // getLegendColor(_appointmentService: appointmentService, status: string): string {


    //     let config = _appointmentService.managementData["AppointmentConfigurations"]

    //     if (config && Object.keys(config).length > 0) {
    //         let colorObject = Object.keys(config);
    //         let color = config[AppointmentColorConfiguration[status]];

    //         let props: CssProp[] = [];

    //         let bgcolorRgba = this.hexToRgbA(color, 1);
    //         props = [{
    //             property: "background",
    //             value: bgcolorRgba + " !important"
    //         }];
    //         return this.CreateCssClass(props, color, 'Legend');

    //     }
    // }

    // getBackgroundColor(_appointmentService: appointmentService, appointmentDetail: any, breakTypeDetail: any = null): string {
    //     let status = appointmentDetail.status;
    //     let config = _appointmentService.managementData["AppointmentConfigurations"]

    //     if (status == "BREAK" && appointmentDetail.locationId !== 0) {
    //         let color = _appointmentService.managementData["BreakType"].filter(x => { return x.id == breakTypeDetail.id });
    //         if (color && color.length > 0 && color[0].color != null) {


    //             let props: CssProp[] = [];

    //             let bgcolorRgba = this.hexToRgbA(color[0].color, 0.1);
    //             let bordercolorRgba = this.hexToRgbA(color[0].color, 1);
    //             props = [{
    //                 property: "background",
    //                 value: bgcolorRgba + " !important"
    //             }];

    //             return this.CreateCssClass(props, color[0].color, 'Background');
    //         }
    //     }
    //     else if (status == "BREAK" && breakTypeDetail != null) {
    //         let color = _appointmentService.managementData["BreakType"].filter(x => { return x.id == breakTypeDetail.id });
    //         if (color && color.length > 0 && color[0].color != null) {


    //             let props: CssProp[] = [];

    //             let bgcolorRgba = this.hexToRgbA(color[0].color, 0.1);
    //             let bordercolorRgba = this.hexToRgbA(color[0].color, 1);
    //             props = [{
    //                 property: "background",
    //                 value: bgcolorRgba + " !important"
    //             }];

    //             return this.CreateCssClass(props, color[0].color, 'Background');
    //         }
    //     }

    //     if (config && Object.keys(config).length > 0) {
    //         let colorObject = Object.keys(config);
    //         let color = config[AppointmentColorConfiguration[status]];

    //         let props: CssProp[] = [];

    //         let bgcolorRgba = this.hexToRgbA(color, 1);
    //         props = [{
    //             property: "background",
    //             value: bgcolorRgba + " !important"
    //         }];
    //         return this.CreateCssClass(props, color, 'Background');

    //     }
    // }

    // getTextColor(_appointmentService: appointmentService, status: string): string {

    //     let config = _appointmentService.managementData["AppointmentConfigurations"]

    //     if (config && Object.keys(config).length > 0) {
    //         let colorObject = Object.keys(config);
    //         let color = config[AppointmentColorConfiguration[status]];

    //         let props: CssProp[] = [];

    //         let bgcolorRgba = this.hexToRgbA(color, 1);
    //         props = [{
    //             property: "color",
    //             value: bgcolorRgba + " !important"
    //         }];
    //         return this.CreateCssClass(props, color, 'Text');

    //     }
    // }

    getBorderColor(status: string): string {

        let config = this.PropertyInfo.AppointmentConfigurations();

        if (config && Object.keys(config).length > 0) {
            let colorObject = Object.keys(config);
            let color = config[AppointmentColorConfiguration[status]];

            let props: CssProp[] = [];

            let bgcolorRgba = this.hexToRgbA(color, 1);
            props = [{
                property: "border",
                value: "2px solid " + bgcolorRgba + " !important"
            }];
            return this.CreateCssClass(props, color, 'Border');

        }
    }

    getOnlyBackgoundColor(status: string): string {

        let config = this.PropertyInfo.AppointmentConfigurations();

        if (config && Object.keys(config).length > 0) {
            let colorObject = Object.keys(config);
            let color = config[AppointmentColorConfiguration[status]];

            let props: CssProp[] = [];

            let bgcolorRgba = this.hexToRgbA(color, 1);
            props = [{
                property: "background",
                value: bgcolorRgba + " !important"
            }];
            return this.CreateCssClass(props, color, 'Background');

        }
    }

    getOnlyLightBackgoundColor(status: string): string {

        let config = this.PropertyInfo.AppointmentConfigurations();

        if (config && Object.keys(config).length > 0) {
            let colorObject = Object.keys(config);
            let color = config[AppointmentColorConfiguration[status]];

            let props: CssProp[] = [];

            let bgcolorRgba = this.hexToRgbA(color, 0.1);
            props = [{
                property: "background",
                value: bgcolorRgba + " !important"
            }];
            return this.CreateCssClass(props, color, 'LightBackground');

        }
    }

    setFilterPopUp(ShowMoreFilters: boolean, moreData: any, selectedMoreData: any, topPos: Number, leftPos: Number, belongto: string, fromPage: string) {
        this._MoreSectionServiceService.filterOptions = {
            'ShowMoreFilters': ShowMoreFilters,
            'moreData': moreData,
            'selectedMoreData': selectedMoreData,
            'top': topPos,
            'left': leftPos,
            'belongto': belongto,
            'fromPage': fromPage
        }
    }

    getFilterPopUpOption(ShowMoreFilters: boolean, moreData: any, selectedMoreData: any, topPos: Number, leftPos: Number, belongto: string, fromPage: string): MoreFilterOptions {
        return {
            'ShowMoreFilters': ShowMoreFilters,
            'moreData': moreData,
            'selectedMoreData': selectedMoreData,
            'top': topPos,
            'left': leftPos,
            'belongto': belongto,
            'fromPage': fromPage
        }
    }

    // getPMSSessionData(): PMSSessionData {
    //     let pmsData: PMSSessionData;
    //     var session = sessionStorage.getItem(GlobalConst.PMSDATA);
    //     if (session) {
    //         pmsData = JSON.parse(session);
    //     }
    //     return pmsData;
    // }

    roomOpenDialog(popupData: any, callback?: (x: any) => void): MatDialogRef<any, any> {
        const data = {
            headername: popupData.headertext,
            headerIcon: popupData.icon,
            headerMessage: popupData.text,
            buttonName: popupData.buttonname,
            type: 'message',
            isloaderenable: popupData.isloaderenable,
            isHiddenFieldRequired: popupData.isHiddenFieldRequired,
            cardpayment: popupData.cardpayment
        }
        const dialogRef = this.dialog.open(AlertMessagePopupComponent, {
            // width: '350px',
            // height: '300px',
            width: '350px',
            hasBackdrop: true,
            panelClass: 'small-popup',
            data: data,
            disableClose: true
        });
        const subscription = dialogRef.afterClosed().subscribe((x) => {
            if (callback) {
                callback(x);
            }
            if (subscription) {
                subscription.unsubscribe();
            }
        });
        return dialogRef;
    }

    splitPhoneNo(phNo) {
        let phoneNumber = phNo;
        if (phNo.indexOf('|') != -1) {
            let splitNo = phNo.split('|');
            phoneNumber = splitNo[1];
        }
        return phoneNumber;
    }
    splitCountryCode(phNo) {
        let phoneNumber = phNo;
        if (phNo.indexOf('|') != -1) {
            let splitNo = phNo.split('|');
            phoneNumber = splitNo[0] ? splitNo[0] + ' - ' : '';
        }else{
            phoneNumber = '';
        }
        return phoneNumber;
    }


}
