export interface AccordianInput{
    headerData: AccordianHeaderData;
}

export interface AccordianHeaderData{
    details: AccordianDetails[];
    titleData: string;
    titledesc: string;
}

export interface AccordianDetails{
    count: number;
    description: string;
    id: number;
    localeId: string;
    productId: string;
    userClaims:AccordianUserClaims[];
}

export interface AccordianUserClaims{
    allow: boolean;
    breakPointCategoryId: number;
    breakPointId: number;
    breakPointNumber: string;
    description: string;
    userClaimId: number;
    userRoleId: number;
    view: boolean;
    viewOnlyAllowed: boolean;
}