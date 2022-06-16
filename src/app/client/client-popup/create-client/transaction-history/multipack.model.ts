export class MultipackAPIModel {
    guestGuid: string;
    clientId: number;
    clientMultiPackRedeemId: number;
    clientMultiPackId: number;
    clientMultiPackRedeemDateTime: Date;
    clientMultiPackSaleDateTime: Date;
    linkedRetailItemId : number;
    multiPackName: string;
    quantity: number;
    redeemedSessions: number;
    remainingSessions: number;
    multiPackSaleTransactionId: number;
    multiPackSaleTransactionDetailId: number;
    multiRedemptionTransactionId: number;
    multiRedemptionTransactionDetailId: number;
    multipackExpirytDate: Date;
    productId: number;
    productName: string;
    isMultiPackExpired: boolean;
    isUnlimitedMultipack: boolean;
}

export class MultipackUIModel {
    DateRedeemed: string;
    DateOfSale: string;
    MultipackDescription: string;
    RedeemedCount: string;
    RemainingCount: string;
    DateOfExpiry: string;
    Product : string;
    IsMultipackExpired: boolean;
}

export interface MultpackHistoryRequest
{
    GuestGuid: string;
    IsIncludeExpiredMultipacks: boolean;
}
