export enum RetailApiHosts {
  SalesCateringService,
  TenantManagement,
  RetailManagement,
  SNCGateway,
  Report,
  PayAgent,
  MsDeeplink,
  V1IGPosting,
  RetailPOS
}

export class MsalConfiguration {
  AppId: string;
  RedirectUri: string;
  Scopes: string[];
}

export enum RetailRoutes {
  // common route
  ValidateLogin = 'validatelogin',
  Login = 'Property/GetLoginDetails',
  LogOut = 'User/LogOutByUserId/{Username}/{TenantId}/{PropertyId}',
  SavePassword = 'User/SavePassword/{UserId}/{NewPassword}/{TenantId}/{PropertyId}',
  CreateSession = 'User/session',  
  UpdateSession = 'User/session/sessionId/{sessionId}',
  CheckPassword = 'User/CheckPasswordExists/{UserId}/{NewPassword}/{TenantId}',
  VerifyPassword = 'User/VerifyPassword/{UserId}/{NewPassword}/{TenantId}',
  PasswordSetting = 'Property/GetPasswordSettings/{TenantId}',
  UserToken = 'Property/UpdatePayload',
  EnvironmentConfig = 'Login/api/Configuration',
  // Property
  GetProperty = 'property/getPropertyInfoByPropertyId/{id}',
  UpdateProperty = 'property/UpdatePropertyInfo',
  UpdatePropertySetting = 'property/PatchUpdatePropertySetting/{PropertyId}',
  GetAllPropertySettings = 'property/GetPropertySetting/{propertyId}',
  GetAllLanguages = 'language/GetAllLanguages',
  GetPaymentConfigurationByProperty = 'Payment/GetPaymentConfigurationByProperty/{propertyId}',
   // SNC users
   GetSncUserConfig = 'UserConfiguration?userId={id}',
   //Dashboard
   GetOutletCount = 'DashBoard/getOutletCount',
   GetVendorCount = 'DashBoard/getVendorCount',
   GetTransactionCount = 'DashBoard/GetTransactionCount',
   GetOutOfStockItems = 'retailitems/GetInventoryRetailItems',
   GetTransactionSaleDetail = 'Transaction/getTransactionSale/{startDate}/{dataFormat}',
   GetItemSaleDetail = 'Transaction/getItemSale/{startDate}/{endDate}',
   GetCategorySaleDetail = 'Transaction/getCategorySale/{startDate}/{endDate}',
   GetOpenTickets = 'DashBoard/{processDate}',
   GetReturnedItems = 'DashBoard/getReturnedItems/{startDate}/{dataFormat}'
}