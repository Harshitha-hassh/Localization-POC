import { Injectable } from '@angular/core';
import { Localization } from 'src/app/core/localization/Localization';
import * as DashBoardInterface from './dashboard.modal';
import { DashBoardService } from 'src/app/shared/data-services/authentication/retailmanagement/dashboard.data.service';
import { SubPropertyDataService } from 'src/app/retail/retail-code-setup/retail-outlets/subproperty-data.service';
import { Outlet } from 'src/app/retail/retail.modals';

@Injectable()
export class DashBoardBusiness {
    public readonly Captions: any;
    public readonly dayFormat: number = 1;
    public readonly weekFormat: number = 2;
    public readonly monthFormat: number = 3;
    constructor(private _dashBoardService: DashBoardService
        , private _localization:Localization
        , private _subPropertyDataService: SubPropertyDataService
        ) {
            this.Captions = this._localization.captions['dashBoard']; 
    }

    async getOutlets(): Promise<DashBoardInterface.OutletOption[]> {
        const outlets = await this._subPropertyDataService.getOutletsByPropertyAndProduct();
        const result: DashBoardInterface.OutletOption[] = outlets?outlets.map(o => {
            return {
                id: o.id,
                name: o.outletName,
                description: o.outletName,
                defaultOutletId: o.id
            }
        }):[];
        return result;
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

    public async getTransactionCount(outletIds: number[]): Promise<DashBoardInterface.TransactionDetails> {
        return this._dashBoardService.getTransactionCount(outletIds);
    }
    

    public async getTransactionSaleDetail<T>(dataFormat: number): Promise<DashBoardInterface.UITransactionSaleDetail[]> {
        var transaction = [
        {transactions: 10,value: 10, booked: 10,avail: 4,dateOfTransaction: new Date(),id: 1,name:'name 1'},
        {transactions: 30,value: 30, booked: 10,avail: 4,dateOfTransaction: new Date(),id: 2,name:'name 2'},
        {transactions:50,value: 50, booked: 10,avail: 4,dateOfTransaction: new Date(),id: 3,name:'name 3'},
        {transactions: 50,value: 50, booked: 10,avail: 4,dateOfTransaction: new Date(),id: 4,name:'name 4'},
        {transactions: 50,value: 50, booked: 10,avail: 4,dateOfTransaction: new Date(),id: 5,name:'name 5'}
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
                            trans.value = trans.value
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
                            trans.value = trans.value
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
                            trans.value = trans.value
                    }
                })
            })
        }

        return transaction.map(x => { 
            return {
            id:x.id,
            booked:x.booked,
            avail:x.avail,
            value: x.value, 
           
            name: x.name } });
    }

    public async getRevenueByOutletDetail<T>(dataFormat: number): Promise<DashBoardInterface.UIRevenueByOutlet[]> {
        var transaction = [
        {items: 10,value: 10,id: 1,name:'name 1'},
        {items: 30,value: 30,id: 2,name:'name 2'},
        {items: 50,value: 50,id: 3,name:'name 3'},
        {items: 50,value: 50,id: 4,name:'name 4'},
        {items: 50,value: 50,id: 5,name:'name 5'}
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
                            trans.value = trans.value
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
                            trans.value = trans.value
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
                            trans.value = trans.value
                    }
                })
            })
        }

        return transaction.map(x => { 
            return {
                value: x.value,
                id: x.id,
                name:x.name,
                items:x.items} 
        });
    }

    
    public async getReturned_ItemsDetail<T>(dataFormat: number): Promise<DashBoardInterface.UIReturned_Items[]> {
        var transaction = [
        {items: 10,value: 10,id: 1,name:'name 1'},
        {items: 30,value: 30,id: 2,name:'name 2'},
        {items: 50,value: 50,id: 3,name:'name 3'},
        {items: 50,value: 50,id: 4,name:'name 4'},
        {items: 50,value: 50,id: 5,name:'name 5'}
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
                            trans.value = trans.value
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
                            trans.value = trans.value
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
                            trans.value = trans.value
                    }
                })
            })
        }

        return transaction.map(x => { 
            return {
                value: x.value,
                id: x.id,
                name:x.name,
                items:x.items} 
        });
    }

    public async  getItemSaleDetail<T>(startDate: Date, endDate: Date, outletIds: number[]): Promise<DashBoardInterface.UIItemData[]> {
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
        var categoryData = await [
            {id: 1,amount: 1344,name:'name 1'},
            {id: 2,amount: 2344,name:'name 2'},
            {id: 3,amount: 3344,name:'name 3'},
            {id: 4,amount: 4344,name:'name 4'},
            {id: 5,amount: 5344,name:'name 5'}
        ];
        return categoryData.map(x => { return { id: x.id, name: x.name, amount: this._localization.localizeCurrency(x.amount) } })
    }


    public async getPurchaseOrderData(): Promise<DashBoardInterface.UIPurchaseDetails[]> {
       let data = await [
           {id: 1,orderNumber: "#354351"   ,status:'Pending'},
           {id: 2,orderNumber: "#254463"   ,status:'Approved'},
           {id: 3,orderNumber: "#334345"   ,status:'Yet to Approve'},
           {id: 4,orderNumber: "#424343"   ,status:'Pending'},
           {id: 5,orderNumber: "#784765"   ,status:'Approved'}
       ]
        return data;
    }


    public async getOpenTicketsData(): Promise<DashBoardInterface.UIOpenTickets[]> {
        let data = await [
            {id: 1,ticketNumber:'OP123465',transactionAmount: "$354,351"   ,action:'Settle'},
            {id: 2,ticketNumber:'OP123465',transactionAmount: "$254,463"   ,action:'Settle'},
            {id: 3,ticketNumber:'OP123465',transactionAmount: "$334,345"   ,action:'Settle'},
            {id: 4,ticketNumber:'OP123465',transactionAmount: "$424,343"   ,action:'Settle'},
            {id: 5,ticketNumber:'OP123465',transactionAmount: "$784,765"   ,action:'Settle'},
        ]
         return data;
     }

     public async getOutofStockOnData(outletIds: number[]): Promise<DashBoardInterface.UIOutOfStock[]> {
        const outOfStockItems= await this._dashBoardService.getOutOfStockItems(outletIds);
        const result: DashBoardInterface.UIOutOfStock[] = outOfStockItems?outOfStockItems.map(o => {
            return {
                id: o.id,
                item: o.item,
                outofStockOn: this._localization.LocalizeShortDate(o.outofStockOn)
            }
        }):[];
        return result;
        // let data = await [
        //     {id: 1,item: "Item 3535",outofStockOn: '10/11/2020'},
        //     {id: 2,item: "Item 235"   ,outofStockOn: '11/11/2020'},
        //     {id: 3,item: "Item 3535"  ,outofStockOn: '12/11/2020'},
        //     {id: 4,item: "Item 535"   ,outofStockOn: '13/11/2020'},
        //     {id: 5,item: "Item 535"   ,outofStockOn: '10/11/2020'},
        // ]
        //  return data;
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