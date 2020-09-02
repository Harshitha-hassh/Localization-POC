import { Injectable } from '@angular/core';
import { GlobalSearchModel, searchtitleenum, GlobalSearchData } from './global-search.model';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailItemSearchModel } from '../../models/retail-item.model';

@Injectable()
export class GlobalSearchBusiness {
    constructor(
        // private _retailItemDataService: RetailItemDataService,
        private _localization: RetailStandaloneLocalization) { }
    public async globalSearch(pattern: string): Promise<GlobalSearchModel[]> {
        const filterData = [];
        const searchables: Promise<any>[] = [];
        // Items
        const items = this.searchRetailItem(pattern);
        searchables.push(items);

        return Promise.all(searchables).then(result => {
            const retailItemResult: RetailItemSearchModel[] = result[0];
            if (retailItemResult && retailItemResult.length > 0) {
                filterData.push(this.formRetailItemData(retailItemResult));
            }
            return filterData;
        });


    }

    private async searchRetailItem(pattern: string) {
        // const retailItems = await this._retailItemDataService.searchRetailItems(pattern);
        const retailItems = null;
        return retailItems && retailItems.itemDetails ? retailItems.itemDetails : [];
    }

    private formRetailItemData(retailItemResult: RetailItemSearchModel[]): GlobalSearchModel {
        return {
            displayname: this._localization.captions.common.RetailItems,
            title: searchtitleenum.retailItems,
            dataCollection: retailItemResult.map(iterator => {
                return {
                    id: iterator.itemId,
                    value: `${iterator.name}`
                } as GlobalSearchData;
            })
        } as GlobalSearchModel;
    }
}
