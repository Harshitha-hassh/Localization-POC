import { Injectable } from '@angular/core';
import { GlobalSearchModel, searchtitleenum, GlobalSearchData } from './global-search.model';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { RetailItemSearchModel } from '../../models/retail-item.model';
import { RetailItemDataService } from '../../data-services/retail-management/retail-item.data.service';
import { ClientDataService } from '../../data-services/client.data.service';
import { ClientGlobalSearchModel, ClientDetails } from 'src/app/client/client-popup/create-client/client.modal';

@Injectable()
export class GlobalSearchBusiness {
    constructor(
        // private _retailItemDataService: RetailItemDataService,
        private _localization: RetailStandaloneLocalization,
        private _retailItemDataService: RetailItemDataService,
        private _clientDataService: ClientDataService
    ) { }
    public async globalSearch(pattern: string): Promise<GlobalSearchModel[]> {
        const filterData = [];
        const searchables: Promise<any>[] = [];
        // Items
        const items = this.searchRetailItem(pattern);
        searchables.push(items);
        const clients = this.searchClient(pattern);
        searchables.push(clients);
        return Promise.all(searchables).then(result => {
            const retailItemResult: RetailItemSearchModel[] = result[0];
            if (retailItemResult && retailItemResult.length > 0) {
                filterData.push(this.formRetailItemData(retailItemResult));
            }
            const clientResult: ClientDetails[] = result[1];
            if (clientResult && clientResult.length) {
                filterData.push(this.formClientData(clientResult));
            }
            return filterData;
        });


    }

    private async searchClient(pattern: string) {
        const clientItems = await this._clientDataService.searchClientForGlobalSerach(pattern);
        return clientItems && clientItems.clientDetails ? clientItems.clientDetails : [];
    }

    private async searchRetailItem(pattern: string) {
        const retailItems = await this._retailItemDataService.searchRetailItems(pattern);
        return retailItems && retailItems.itemDetails ? retailItems.itemDetails : [];
    }

    private formRetailItemData(retailItemResult: RetailItemSearchModel[]): GlobalSearchModel {
        return {
            displayname: this._localization.captions.common.RetailItems,
            title: searchtitleenum.retailItems,
            dataCollection: retailItemResult,
            groupName: 'Items'
        } as GlobalSearchModel;
    }

    private formClientData(clientResult: ClientDetails[]): GlobalSearchModel {
        return {
            displayname: this._localization.captions.common.Clients,
            title: searchtitleenum.clients,
            dataCollection: clientResult,
            groupName: 'Clients'
        } as GlobalSearchModel;
    }
}
