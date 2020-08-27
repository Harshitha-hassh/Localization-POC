export interface RetailItemSearchModel {
    itemId: number;
    name: string;
}

export interface RetailItemSearchResults {
    groupName: string;
    itemDetails: RetailItemSearchModel[];
}