export interface TranslogType {
    id: number;
    code: string;
    description: string;
    logtype: string;
  }

  export interface ReportParams {
    [parameter: string]: string | number | boolean;
  }

  export interface ReportFilterParams {
    [Filter: string]: number[];
  }
  
  export interface ReportOptions {
    code: string;
    params: ReportParams[];
    URIParams: ReportParams[];
    Filter: ReportFilterParams[];
    pageBreak: boolean;
    layout: string;
    language: string;
  }

  export interface Users {
    tenantId: 1;
    userId: 1;
    userName: string;
    firstName: string;
    lastName: string;
    password: null;
    isActive: boolean;
  }