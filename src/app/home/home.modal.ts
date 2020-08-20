export interface HeaderOptionInteface {
  'key': string;
  'sortingKey'?: string;
  'description': string;
  'alignment': string;
  'searchable'?:boolean ;
  'tooTipkey'?:string;
}

export interface salesCategoriesBodyData {
   item: string;
   price: string
}

export interface headerData {
  key: string;
  description: string;
  alignment: string;
  showArrow?:boolean;
  customClass?:string;
}
