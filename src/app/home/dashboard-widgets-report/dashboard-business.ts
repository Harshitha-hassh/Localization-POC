import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import * as DashBoardInterface from './dashboard.modal';
// import { UserAccessBreakPoints } from 'src/app/shared/constants/useraccess.constants';
// import { UserAccessBusiness } from 'src/app/shared/data-services/authentication/useraccess.business';
// import { DashBoardService } from 'src/app/shared/data-services/golfschedule/dashboard.data.service';
// import { CourseDataService } from 'src/app/shared/data-services/golfschedule/course.data.service';
// import { CourseOption } from 'src/app/settings/rate-setup/rate-setup.model';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { Outlet } from 'src/app/retail/retail.modals';
// import { Filter } from 'src/app/shared/shared-models';
import { DashboardWidgetsReportService } from './dashboard-widgets-report.service';
// import { TeeSheetDashboard } from 'src/app/tee-time/shared/tee-sheet/tee-sheet.dashboard';
// import { TeeSheetSkeletonData, ScheduleStatus } from 'src/app/shared/models/teesheet.form.models';
import { Observable, of, BehaviorSubject, from } from 'rxjs';
// import { DefaultUserConfigDataService } from 'src/app/settings/utilities/manager-utilities/default-user-config/default-user-config.data.service';
// import { TeeTimeConfigDataService } from 'src/app/shared/data-services/golfmanagement/teetime-config.data.service';
import _ from 'lodash';
import { Utilities } from 'src/app/core/utilities';
// import { GolfUserConfigDataService } from 'src/app/shared/data-services/golfmanagement/golfuser.config.data';
// import { Utilities } from 'src/app/shared/utilities/utilities';
// import { PropertyDataService } from 'src/app/settings/system-setup/property-info/property.data.service';
// import { WeatherService } from '../dashboard-weather/weather.service';

@Injectable()
export class DashBoardBusiness {
    public readonly Captions: any;
    public readonly dayFormat: number = 1;
    public readonly weekFormat: number = 2;
    public readonly monthFormat: number = 3;
    constructor(
        private _localization:Localization
        ) {
            this.Captions = this._localization.captions['dashBoard']; 
    }


    async getOutletsCount(): Promise<DashBoardInterface.DonutCount> {
        const data= { active: 23,
                    inActive: 5,
                    total : 28};
        return data;
    }

    async getVendorsCount(): Promise<DashBoardInterface.DonutCount> {
        const data= { active: 23,
                    inActive: 50,
                    total : 83};
        return data;
    }


    public async getTransactionSaleDetail<T>(startDate: Date, dataFormat: number, outletIds: number[]): Promise<DashBoardInterface.UIRevenue[]> {
        // var transaction = await this._dashBoardService.getTransactionSaleDetail(startDate, dataFormat, outletIds);
        var transaction = [
        {noOfTrasaction: 4,totalAmount: 10, dateOfTransaction: new Date(),id: 1,name:'name 1'},
        {noOfTrasaction: 45,totalAmount: 30, dateOfTransaction: new Date(),id: 2,name:'name 2'},
        {noOfTrasaction: 2,totalAmount: 50, dateOfTransaction: new Date(),id: 3,name:'name 3'},
        {noOfTrasaction: 23,totalAmount: 50, dateOfTransaction: new Date(),id: 4,name:'name 4'},
        {noOfTrasaction: 12,totalAmount: 50, dateOfTransaction: new Date(),id: 5,name:'name 5'},
        {noOfTrasaction: 50,totalAmount: 50, dateOfTransaction: new Date(),id: 6,name:'name 6'}
        ]
        var monthsArray = this._localization.monthsArray;
        var daysArray = this._localization.daysNormalArray;
        var weeksArray: DashBoardInterface.UIWeekArray[] = this.getWeekArray();
        if (dataFormat == this.dayFormat) {
            transaction.forEach((trans) => {
                daysArray.forEach((day) => {
                    if (trans.id == day.id) {
                        trans.id = day.id,
                            trans.name = day.short,
                            trans.noOfTrasaction = trans.noOfTrasaction,
                            trans.totalAmount = trans.totalAmount
                    }
                })
            })
        }
        else if (dataFormat == this.weekFormat) {
            transaction.forEach((trans) => {
                weeksArray.forEach((week) => {
                    if (trans.id == week.id) {
                        trans.id = week.id,
                            trans.name = week.name,
                            trans.noOfTrasaction = trans.noOfTrasaction,
                            trans.totalAmount = trans.totalAmount
                    }
                })
            })
        }
        else if (dataFormat == this.monthFormat) {
            transaction.forEach((trans) => {
                monthsArray.forEach((month) => {
                    if (trans.id == month.id) {
                        trans.id = month.id,
                            trans.name = month.short,
                            trans.noOfTrasaction = trans.noOfTrasaction,
                            trans.totalAmount = trans.totalAmount
                    }
                })
            })
        }

        return transaction.map(x => { return { value: x.totalAmount, transactions: x.noOfTrasaction, name: x.name } });
    }



    public async  getItemSaleDetail<T>(startDate: Date, endDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIItemData[]> {
        // var itemData = await this._dashBoardService.getItemSaleDetail(startDate, endDate, outletIds);
        var itemData = await [
            {id: 1,amount: 1344,name:'name 1'},
            {id: 2,amount: 2344,name:'name 2'},
            {id: 3,amount: 3344,name:'name 3'},
            {id: 4,amount: 4344,name:'name 4'},
            {id: 5,amount: 5344,name:'name 5'}
        ];
        return itemData.map(x => { return { id: x.id, name: x.name, amount: this._localization.localizeCurrency(x.amount) } })
    }

    public async  getCategorySaleDetail<T>(startDate: Date, endDate: Date, outletIds: number[]): Promise<DashBoardInterface.UICategoryData[]> {
        // var categoryData = await this._dashBoardService.getCategorySaleDetail(startDate, endDate, outletIds);
        var categoryData = await [
            {id: 1,amount: 1344,name:'name 1'},
            {id: 2,amount: 2344,name:'name 2'},
            {id: 3,amount: 3344,name:'name 3'},
            {id: 4,amount: 4344,name:'name 4'},
            {id: 5,amount: 5344,name:'name 5'}
        ];
        return categoryData.map(x => { return { id: x.id, name: x.name, amount: this._localization.localizeCurrency(x.amount) } })
    }




    getWeekArray() {
        let weekKeys: string[] = [
            this.Captions.Week1,
            this.Captions.Week2,
            this.Captions.Week2,
            this.Captions.Week4,
            this.Captions.Week5
        ];
        let returnArr: DashBoardInterface.UIWeekArray[] = [];
        for (let i = 1; i <= 5; i++) {
            returnArr.push({
                id: i,
                name: weekKeys[i - 1]
            });
        }
        return returnArr;
    }
   

}