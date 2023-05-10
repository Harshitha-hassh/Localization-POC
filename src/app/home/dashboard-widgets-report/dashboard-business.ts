import { Injectable } from '@angular/core';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import * as DashBoardInterface from './dashboard.modal';
import { DashBoardService } from 'src/app/shared/data-services/authentication/retailmanagement/dashboard.data.service';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { OutletOption } from './dashboard.modal';


@Injectable()
export class DashBoardBusiness {
    public readonly Captions: any;
    public readonly dayFormat: number = 1;
    public readonly weekFormat: number = 2;
    public readonly monthFormat: number = 3;
    public readonly numericTwo = 2;
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
    }

    public async getTransactionCount(outletIds: number[]): Promise<DashBoardInterface.TransactionDetails> {
        return this.dashBoardService.getTransactionCount(outletIds);
    }

    public async getTransactionSaleDetail<T>(dataFormat: number,
                                             startDate: Date, outletIds: number[]): Promise<DashBoardInterface.UITransactionSaleDetail[]> {
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
                avail:`${this.localization.currencySymbol}`+ this.localization.DisplayMillion(x.totalAmount, this.numericTwo),
                value: x.totalAmount,

                name: x.name
            };
        });
    }

    public async getRevenueByOutletDetail<T>(dataFormat: number,
                                             startDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIRevenueByOutlet[]> {
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
                avail:`${this.localization.currencySymbol}`+  this.localization.DisplayMillion(x.totalAmount, this.numericTwo),
            };
        });
    }


    public async getReturned_ItemsDetail<T>(startDate: Date,
                                            dataFormat: number, outletIds: number[]): Promise<DashBoardInterface.UIReturned_Items[]> {
        var transaction = await this.dashBoardService.getReturnedItems(startDate, dataFormat, outletIds);
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


    public async getOpenTicketsData(propertyDate: Date, outletIds: number[],  outlets:OutletOption[] ): Promise<DashBoardInterface.UIOpenTickets[]> {
        const action = 'Settle';
        const outOfStockItems =outletIds.length > 0 ? await this.dashBoardService.getOpenTickets(propertyDate, outletIds) :[];
        const result: DashBoardInterface.UIOpenTickets[] = outOfStockItems ? outOfStockItems.map(o => {
            return {
                id: o.outletId,
                uid :o.id,
                clientId : o.clientId,
                outlet: outlets.find(x=> x.id== o.outletId).description,
                ticketNumber: o.transactionNumber,
                transactionAmount: `${this.localization.currencySymbol}` + o.amount.customToFixed(),
                action
            };
        }) : [];
        return result;
    }

    public async getOutofStockOnData(outletIds: number[], outlets:OutletOption[] ): Promise<DashBoardInterface.UIOutOfStock[]> {
        const outOfStockItems =outletIds.length > 0 ? await this.dashBoardService.getOutOfStockItems(outletIds) :[];
        const result: DashBoardInterface.UIOutOfStock[] = outOfStockItems ? outOfStockItems.map(o => {
            return {
                id: o.id,
                item: o.item,
                outlet:outlets.find(x=> x.id== o.outletId).description,
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
