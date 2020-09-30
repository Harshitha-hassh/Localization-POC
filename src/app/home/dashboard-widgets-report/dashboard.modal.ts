export interface OutletOption {
    id: number;
    name: string;
    description: string;
    defaultOutletId : number;
    isActive:boolean;
}

export interface DonutCount {
    active: number;
    inActive: number;
    total : number;
}

export interface UITransactionSaleDetail {
    value: number;
    id: number;
    name:string;
    booked:number,
    avail:number |string;
}

export interface UIRevenueByOutlet {
    value: number;
    id: number;
    name:string;
    items:number;
}
export interface UIReturned_Items {
    value: number |string;
    id: number;
    name:string;
    items:number |string;
}


export interface ItemData {
    id: number;
    amount: number;
    name:string;
}
export interface UIItemData {
    id: number;
    amount: string;
    name:string;
}

export interface UIRevenue{
    value : number;
    transactions:number;
    name:string;
}

export interface UIWeekArray{
    id:number;
    name:string;
}

export interface UICategoryData {
    id: number;
    amount: string;
    name:string;
}

export interface UIPurchaseDetails {
    id: number;
    orderNumber: string;
    status:string;
}

export interface UIOpenTickets {
    id: number;
    ticketNumber :string;
    transactionAmount: string;
    action:string;
    clientId : number;
    uid :number;
}
export interface UIOutOfStock {
    id: number;
    item :string;
    outofStockOn: string;  
}

export interface OutOfStock {
    id: number;
    item :string;
    outofStockOn: Date;  
}
export interface TransactionDetails {
    transactionCount: number;
    transactionRevenue: number;
    averageRevenue: number;
}

export interface TransactionSaleDetail {
    noOfTrasaction: number;
    totalAmount: number;
    dateOfTransaction: Date;
    id: number;
    name:string;
}

export interface ItemData {
    id: number;
    amount: number;
    name:string;
}

export interface UIItemData {
    id: number;
    amount: string;
    name:string;
}

export interface CategoryData {
    id: number;
    amount: number;
    name:string;
}

export interface UICategoryData {
    id: number;
    amount: string;
    name:string;
}
export interface ReturnedItems {
    quantity: number;
    id: number;
    returnedItems:number;
    name: string;
}
export interface OpenTickets {
    outletId: number;
    transactionNumber :string;
    amount: string;   
    clientId : number;
    id : number; 
}

export interface VendorInfo {
    activeCount: number;
    inActiveCount: number;
    totalCounts : number;
}