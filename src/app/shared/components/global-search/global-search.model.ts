export enum searchtitleenum {
    booking = 'booking',
    settings = 'settings',
    sales = 'sales',
    retailItems = 'Retail Items',
    clients = 'Clients'
}

export interface GlobalSearchModel {
    title: string;
    dataCollection: any[];
}

export interface GlobalSearchData {
    id: number;
    value?: string;
}


