
export interface ClientInfo {
  id: number;
  client: Client;
  phoneNumbers: PhoneNumber[];
  addresses: Address;
  emails: Email[];
  clientCreditCardInfo: ClientCreditCardInfo;
 }
  
 export interface ClientCreditCardInfo {
  id: number;
  clientId: number;
  tokenTransId: number;
  isActive: boolean;
  createdTime: Date | string | null;
}

  export interface Interfaces{
    name:string;
    interfaceGuestId:string;
  }

  export interface PhoneNumber {
    id ?: number;
    contactTypeId: number;
    clientId: number;
    countryCode ?: string | number;
    number: string;
    extension ?: string;
    isPrivate: boolean;
    isPrimary: boolean;
  }

  export interface Email {
    id ?: number;
    contactTypeId: number;
    clientId: number;
    emailId: string;
    isPrivate: boolean;
    isPrimary: boolean;
  }

  export interface Address {
    clientId: number;
    contactTypeId: number;
    addressLine1?: string;
    addressLine2: string;
    addressLine3: string;
    state?: string;
    State?: string;
    city: string;
    country?: string;
    Country?: string;
    zip: string;
    zipCode: string;
    isPrivate: boolean;
  }

  
  export interface Client {
    id: number;
    guestId?: string,
    title: string;
    firstName: string;
    lastName?: string;
    pronounce: string;
    gender: string;
    dateOfBirth: string;
    comments:string;
    lastChangeId?: string;
    interfaceGuestId: string;
    loyaltyDetail: LoyaltyDetail[];
    memberId?: string;
    ClientCategoryId: number;
  }

  export interface LoyaltyDetail{
    patronId: string;
    rank: string;
  }

  
  export interface ClientSearchModel extends Client {
    addresses: Address;
    phoneNumbers: PhoneNumber[];
    emails: Email[];
    requestUid: string;
    clientCreditCardInfo: ClientCreditCardInfo[];
  }