import { Injectable } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import * as DashBoardInterface from './dashboard.modal';
import { DashBoardService } from 'src/app/shared/data-services/authentication/retailmanagement/dashboard.data.service';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { Outlet } from 'src/app/retail/retail.modals';
import _ from 'lodash';

@Injectable()
export class DashBoardBusiness {
    public readonly Captions: any;
    public readonly dayFormat: number = 1;
    public readonly weekFormat: number = 2;
    public readonly monthFormat: number = 3;
    constructor(private dashBoardService: DashBoardService
        ,       private localization: RetailStandaloneLocalization
        ,       private _subPropertyDataService: SubPropertyDataService
    ) {
        this.Captions = this.localization.captions['dashBoard'];
    }

    async getOutlets(): Promise<DashBoardInterface.OutletOption[]> {
         const outlets = await this._subPropertyDataService.getOutletsByProperty();
        const result: DashBoardInterface.OutletOption[] = outlets?outlets.map(o => {
            return {
                id: o.id,
                name: o.outletName,
                description: o.outletName,
                defaultOutletId: o.id,
                isActive: o.isActive
            }
        }):[];
        return result;
        //const data = [{
        //     id: 1,
        //     name: 'TESt',
        //     description: 'TESt',
        //     defaultOutletId: 1
        // }];
    }

    async getOutletsCount(): Promise<DashBoardInterface.DonutCount> {
        const data = {
            active: 23,
            inActive: 5,
            total: 28
        };
        return data;
    }

    async getVendorsCount(): Promise<DashBoardInterface.DonutCount> {
        const vendorsCount = await this.dashBoardService.getVendorCount();       
        let resultData: DashBoardInterface.DonutCount = {
            inActive: vendorsCount.inActiveCount,
            active: vendorsCount.activeCount,
            total: vendorsCount.totalCounts
        }
        return resultData;
        // const data = {
        //     active: 23,
        //     inActive: 50,
        //     total: 83
        // };
        // return data;
    }

    public async getTransactionCount(outletIds: number[]): Promise<DashBoardInterface.TransactionDetails> {
        return this.dashBoardService.getTransactionCount(outletIds);
    }

    public async getTransactionSaleDetail<T>(dataFormat: number,
                                             startDate: Date, outletIds: number[]): Promise<DashBoardInterface.UITransactionSaleDetail[]> {
        var transaction = await this.dashBoardService.getTransactionSaleDetail(startDate, dataFormat, outletIds);
        // const transaction = [
        //     { transactions: 10, value: 10, booked: 10, avail: 4, dateOfTransaction: new Date(), id: 1, name: 'name 1' },
        //     { transactions: 30, value: 30, booked: 10, avail: 4, dateOfTransaction: new Date(), id: 2, name: 'name 2' },
        //     { transactions: 50, value: 50, booked: 10, avail: 4, dateOfTransaction: new Date(), id: 3, name: 'name 3' },
        //     { transactions: 50, value: 50, booked: 10, avail: 4, dateOfTransaction: new Date(), id: 4, name: 'name 4' },
        //     { transactions: 50, value: 50, booked: 10, avail: 4, dateOfTransaction: new Date(), id: 5, name: 'name 5' }
        // ];
        const monthsArray = this.localization.monthsArray;
        const daysArray = this.localization.daysNormalArray;
        const weeksArray: DashBoardInterface.UIWeekArray[] = this.getWeekArray();
        if (dataFormat == this.dayFormat) {
            transaction.forEach((trans) => {
                daysArray.forEach((day) => {
                    if (trans.id == day.id) {
                        trans.id = day.id,
                            trans.name = day.short,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        } else if (dataFormat == this.weekFormat) {
            transaction.forEach((trans) => {
                weeksArray.forEach((week) => {
                    if (trans.id == week.id) {
                        trans.id = week.id,
                            trans.name = week.name,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        } else if (dataFormat == this.monthFormat) {
            transaction = _.orderBy(transaction,"id","asc");
            transaction.forEach((trans) => {
                monthsArray.forEach((month) => {
                    if (trans.id == month.id) {
                        trans.id = month.id,
                            trans.name = month.short,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        }

        return transaction.map(x => {
            return {
                id: x.id,
                booked: x.noOfTrasaction,
                avail:`${this.localization.currencySymbol}`+ x.totalAmount,
                value: x.totalAmount,

                name: x.name
            };
        });
    }

    public async getRevenueByOutletDetail<T>(dataFormat: number,
                                             startDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIRevenueByOutlet[]> {
        // const transaction = [
        //     { items: 10, value: 10, id: 1, name: 'name 1' },
        //     { items: 30, value: 30, id: 2, name: 'name 2' },
        //     { items: 50, value: 50, id: 3, name: 'name 3' },
        //     { items: 50, value: 50, id: 4, name: 'name 4' },
        //     { items: 50, value: 50, id: 5, name: 'name 5' }
        // ];
         var transaction = await this.dashBoardService.getTransactionSaleDetail(startDate, dataFormat, outletIds);
        const monthsArray = this.localization.monthsArray;
        const daysArray = this.localization.daysNormalArray;
        const weeksArray: DashBoardInterface.UIWeekArray[] = this.getWeekArray();
        if (dataFormat == this.dayFormat) {
            transaction.forEach((trans) => {
                daysArray.forEach((day) => {
                    if (trans.id == day.id) {
                        trans.id = day.id,
                            trans.name = day.short,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        } else if (dataFormat == this.weekFormat) {
            transaction.forEach((trans) => {
                weeksArray.forEach((week) => {
                    if (trans.id == week.id) {
                        trans.id = week.id,
                            trans.name = week.name,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        } else if (dataFormat == this.monthFormat) {
            transaction = _.orderBy(transaction,"id","asc");
            transaction.forEach((trans) => {
                monthsArray.forEach((month) => {
                    if (trans.id == month.id) {
                        trans.id = month.id,
                            trans.name = month.short,
                            trans.totalAmount = trans.totalAmount;
                    }
                });
            });
        }

        return transaction.map(x => {
            return {
                value: x.totalAmount,
                id: x.id,
                name: x.name,
                items: x.noOfTrasaction,
                booked: x.noOfTrasaction,
                avail:`${this.localization.currencySymbol}`+  x.totalAmount,
            };
        });
    }


    public async getReturned_ItemsDetail<T>(startDate: Date,
                                            dataFormat: number, outletIds: number[]): Promise<DashBoardInterface.UIReturned_Items[]> {
        var transaction = await this.dashBoardService.getReturnedItems(startDate, dataFormat, outletIds);
        // var transaction = [
        // {items: 10,value: 10,id: 1,name:'name 1'},
        // {items: 30,value: 30,id: 2,name:'name 2'},
        // {items: 50,value: 50,id: 3,name:'name 3'},
        // {items: 50,value: 50,id: 4,name:'name 4'},
        // {items: 50,value: 50,id: 5,name:'name 5'}
        // ]
        const monthsArray = this.localization.monthsArray;
        const daysArray = this.localization.daysNormalArray;
        const weeksArray: DashBoardInterface.UIWeekArray[] = this.getWeekArray();
        if (dataFormat == this.dayFormat) {
            transaction.forEach((trans) => {
                daysArray.forEach((day) => {
                    if (trans.id == day.id) {
                        trans.id = day.id,
                            trans.name = day.short,
                            trans.quantity = trans.quantity;
                    }
                });
            });
        } else if (dataFormat == this.weekFormat) {
            transaction.forEach((trans) => {
                weeksArray.forEach((week) => {
                    if (trans.id == week.id) {
                        trans.id = week.id,
                            trans.name = week.name,
                            trans.quantity = trans.quantity;
                    }
                });
            });
        } else if (dataFormat == this.monthFormat) {
            transaction = _.orderBy(transaction,"id","asc");
            transaction.forEach((trans) => {
                monthsArray.forEach((month) => {
                    if (trans.id == month.id) {
                        trans.id = month.id,
                            trans.name = month.short,
                            trans.quantity = trans.quantity;
                    }
                });
            });
        }

        return transaction.map(x => {
            return {
                value: x.quantity,
                id: x.id,
                name: x.name,
                items: x.quantity
            };
        });
    }

    public async getItemSaleDetail<T>(startDate: Date, endDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIItemData[]> {
        // const itemData = await [
        //     { id: 1, amount: 1344, name: 'name 1' },
        //     { id: 2, amount: 2344, name: 'name 2' },
        //     { id: 3, amount: 3344, name: 'name 3' },
        //     { id: 4, amount: 4344, name: 'name 4' },
        //     { id: 5, amount: 5344, name: 'name 5' }
        // ];
        const itemData = await this.dashBoardService.getItemSaleDetail(startDate, endDate, outletIds);
        return itemData.map(x => ({ id: x.id, name: x.name, amount: this.localization.localizeCurrency(x.amount) }));
    }

    public async getCategorySaleDetail<T>(startDate: Date,
                                          endDate: Date, outletIds: number[]): Promise<DashBoardInterface.UICategoryData[]> {
        // const categoryData = await [
        //     { id: 1, amount: 1344, name: 'name 1' },
        //     { id: 2, amount: 2344, name: 'name 2' },
        //     { id: 3, amount: 3344, name: 'name 3' },
        //     { id: 4, amount: 4344, name: 'name 4' },
        //     { id: 5, amount: 5344, name: 'name 5' }
        // ];
        const categoryData = await this.dashBoardService.getCategorySaleDetail(startDate, endDate, outletIds);
        return categoryData.map(x => ({ id: x.id, name: x.name, amount: this.localization.localizeCurrency(x.amount) }));
    }


    public async getPurchaseOrderData(): Promise<DashBoardInterface.UIPurchaseDetails[]> {
        const data = await [
            { id: 1, orderNumber: '#354351', status: 'Pending' },
            { id: 2, orderNumber: '#254463', status: 'Approved' },
            { id: 3, orderNumber: '#334345', status: 'Yet to Approve' },
            { id: 4, orderNumber: '#424343', status: 'Pending' },
            { id: 5, orderNumber: '#784765', status: 'Approved' }
        ];
        return data;
    }


    public async getOpenTicketsData(propertyDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIOpenTickets[]> {
        const action = 'Settle';
        const outOfStockItems = await this.dashBoardService.getOpenTickets(propertyDate, outletIds);
        const result: DashBoardInterface.UIOpenTickets[] = outOfStockItems ? outOfStockItems.map(o => {
            return {
                id: o.outletId,
                ticketNumber: o.transactionNumber,
                transactionAmount: `${this.localization.currencySymbol}` + o.amount,
                action
            };
        }) : [];
        return result;
        // let data = await [
        //     {id: 1,ticketNumber:'OP123465',transactionAmount: "$354,351"   ,action:'Settle'},
        //     {id: 2,ticketNumber:'OP123465',transactionAmount: "$254,463"   ,action:'Settle'},
        //     {id: 3,ticketNumber:'OP123465',transactionAmount: "$334,345"   ,action:'Settle'},
        //     {id: 4,ticketNumber:'OP123465',transactionAmount: "$424,343"   ,action:'Settle'},
        //     {id: 5,ticketNumber:'OP123465',transactionAmount: "$784,765"   ,action:'Settle'},
        // ]
        //  return data;
    }

    public async getOutofStockOnData(outletIds: number[]): Promise<DashBoardInterface.UIOutOfStock[]> {
        const outOfStockItems =outletIds.length > 0 ? await this.dashBoardService.getOutOfStockItems(outletIds) :[];
        const result: DashBoardInterface.UIOutOfStock[] = outOfStockItems ? outOfStockItems.map(o => {
            return {
                id: o.id,
                item: o.item,
                outofStockOn: this.localization.LocalizeShortDate(o.outofStockOn)
            };
        }) : [];
        return result;
    }


    getWeekArray() {
        const weekKeys: string[] = [
            this.Captions.Week1,
            this.Captions.Week2,
            this.Captions.Week3,
            this.Captions.Week4,
            this.Captions.Week5
        ];
        const returnArr: DashBoardInterface.UIWeekArray[] = [];
        for (let i = 1; i <= 5; i++) {
            returnArr.push({
                id: i,
                name: weekKeys[i - 1]
            });
        }
        return returnArr;
    }


}
