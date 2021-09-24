

export interface MenuObj {
  elementId: number | string; //guid
  textType?: string; //Primary
  textId?: number | string; //guid
  text?: string; //guid
  routePath?: string;
  imgPath?: string;
  order?: number;
  visibility?: boolean;
  disable?: boolean;
  parentId?: string; //guid
  linkedElement?: MenuObj[] | any[];
  routeTree?: string;
  tenantID?: number;
  propertyID?: number;
  productID?: number;
  parentID?: number;
  menuPosition?: string;
  menuAlignment?: string;
  externalLink?: boolean;
  breakPointNumber?:number;
}

export interface linkedElementObj {
  elementId: number | string; //guid
  textType: string; //Primary
  textID?: number | string; //guid
  text: string; //guid
  routePath: string;
  imgPath: string;
  order?: number;
  visibility: boolean;
  disable: boolean;
  parentId?: string; //guid
  linkedElement?: MenuObj[];
  routeTree?: string;
  tenantID?: number;
  propertyID?: number;
  productID?: number;
  parentID?: number;
  menuPosition?: string;
  menuAlignment?: string;
  externalLink?: boolean;
}

export interface Menu {
  menu: MenuObj[];
}

export enum AgMenuTypes {
  initial = 'Initial',
  horizontal = 'Horizontal',
  combo = 'Combo',
  vertical = 'Vertical' 
}

export enum NotificationFailureType {
  paymentTransactionFailure = 1,
  revenuePostingFailure = 2
}
