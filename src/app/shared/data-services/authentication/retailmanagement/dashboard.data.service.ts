import { Injectable } from "@angular/core";
//import { GolfScheduleCommunication } from '../../communication/services/golfschedule.service';
import { TransactionDetails, OutOfStock, DonutCount, ItemData, TransactionSaleDetail, CategoryData,ReturnedItems,OpenTickets } from 'src/app/home/dashboard-widgets-report/dashboard.modal';
import { Localization } from 'src/app/core/localization/Localization';
import { RetailPosCommunication } from '../../../communication/services/retailpos.service';
import { RetailManagementCommunication } from '../../../communication/services/retailmanagement.service';
//import { GolfGatewayCommunication } from '../../communication/services/golfGateway';


@Injectable()
export class DashBoardService {

    constructor(private _httpPos: RetailPosCommunication
        ,private _httpRetail:RetailManagementCommunication
        , private localization: Localization) {
    }    

    public  getOutletCount<T>(): Promise<DonutCount> {
        let result: Promise<DonutCount> = this._httpPos.getPromise<DonutCount>(
            { route: RetailApiRoute.GetOutletCount });
        return result;
    }
    
    public  getVendorCount<T>(): Promise<DonutCount> {
        let result: Promise<DonutCount> = this._httpPos.getPromise<DonutCount>(
            { route: RetailApiRoute.GetVendorCount });
        return result;
    }

    public  getTransactionCount<T>(outletIds: number[]): Promise<TransactionDetails> {
        let result: Promise<TransactionDetails> = this._httpPos.putPromise<TransactionDetails>(
            { route: RetailApiRoute.GetTransactionCount, body: outletIds });
        return result;
    }
    
    public getOutOfStockItems<T>(outletIds: number[]): Promise<OutOfStock[]> {
        let result: Promise<OutOfStock[]> = this._httpRetail.putPromise<OutOfStock[]>(
            { route: RetailApiRoute.GetOutOfStockItems, body: outletIds });
        return result;
    }

    public  getItemSaleDetail<T>(startDate: Date, endDate: Date , outletIds: number[]): Promise<ItemData[]> {
        const _startDate: string = this.localization.ConvertDateToISODateTime(startDate);
        const _endDate: string = this.localization.ConvertDateToISODateTime(endDate);
        let result: Promise<ItemData[]> = this._httpPos.putPromise<ItemData[]>(
            { route: RetailApiRoute.GetItemSaleDetail, uriParams: { startDate: _startDate, endDate: _endDate} , body: outletIds  });
        return result;
    } 

    public  getCategorySaleDetail<T>(startDate: Date, endDate: Date , outletIds: number[]): Promise<CategoryData[]> {
        const _startDate: string = this.localization.ConvertDateToISODateTime(startDate);
        const _endDate: string = this.localization.ConvertDateToISODateTime(endDate);
        let result: Promise<CategoryData[]> = this._httpPos.putPromise<CategoryData[]>(
            { route: RetailApiRoute.GetCategorySaleDetail, uriParams: { startDate: _startDate, endDate: _endDate} , body: outletIds  });
        return result;
    } 

    // public  getOutletSaleDetail<T>(startDate: Date, endDate: Date , outletIds: number[]): Promise<OutletData[]> {
    //     const _startDate: string = this.localization.ConvertDateToISODateTime(startDate);
    //     const _endDate: string = this.localization.ConvertDateToISODateTime(endDate);
    //     let result: Promise<OutletData[]> = this._httpPos.putPromise<OutletData[]>(
    //         { route: RetailApiRoute.GetOutletSaleDetail, uriParams: { startDate: _startDate, endDate: _endDate} , body: outletIds  });
    //     return result;
    // }

    public  getTransactionSaleDetail<T>(startDate: Date, dataFormat: number , outletIds: number[]): Promise<TransactionSaleDetail[]> {
        const _startDate: string = this.localization.ConvertDateToISODateTime(startDate);
        let result: Promise<TransactionSaleDetail[]> = this._httpPos.putPromise<TransactionSaleDetail[]>(
            { route: RetailApiRoute.GetTransactionSaleDetail, uriParams: { startDate: _startDate, dataFormat: dataFormat} , body: outletIds  });
        return result;
    }

    public getOpenTickets<T>(propertyDate: Date, outletIds: number[]): Promise<OpenTickets[]> {
        const _propertyDate: string = this.localization.ConvertDateToISODateTime(propertyDate);
        let result: Promise<OpenTickets[]> = this._httpPos.putPromise<OpenTickets[]>(
            { route: RetailApiRoute.GetOpenTickets, uriParams: { processDate: _propertyDate} , body: outletIds });
        return result;
    }

     public  getReturnedItems<T>(startDate: Date, dataFormat: number , outletIds: number[]): Promise<ReturnedItems[]> {
        const _startDate: string = this.localization.ConvertDateToISODateTime(startDate);
        let result: Promise<ReturnedItems[]> = this._httpPos.putPromise<ReturnedItems[]>(
            { route: RetailApiRoute.GetReturnedItems, uriParams: { startDate: _startDate, dataFormat: dataFormat} , body: outletIds  });
        return result;
    }
    
}