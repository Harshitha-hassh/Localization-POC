import { Injectable } from '@angular/core';
import { RetailManagementCommunication } from '../../communication/services/retailmanagement.service';
import { Localization } from 'src/app/common/localization/localization';

@Injectable()
export class RetailItemDataService {

    constructor(private _httpRetail: RetailManagementCommunication, private localization: Localization) {

    }

    public searchRetailItems(pattern: string) {
        var result = this._httpRetail.putPromise<any>(
            { route: RetailApiRoute.GlobalSearchRetailItems, body: pattern }
        );
        return result;
    }
}