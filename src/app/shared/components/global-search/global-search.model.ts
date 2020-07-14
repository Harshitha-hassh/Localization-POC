export enum searchtitleenum {    
    booking = 'booking',
    settings = 'settings',
    sales = 'sales'  

}

export interface GlobalSearchModel {
    title: string;
    dataCollection: GlobalSearchData[];
}

export interface GlobalSearchData {
    id: number;    
    value: any
}


