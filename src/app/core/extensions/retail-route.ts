export enum RetailApiHosts {
  SalesCateringService,
  TenantManagement,
  RetailManagement,
  SNCGateway,
  Report,
  PayAgent,
  MsDeeplink,
  V1IGPosting
}

export class MsalConfiguration {
  AppId: string;
  RedirectUri: string;
  Scopes: string[];
}

export enum RetailRoutes {
  // // common route
  // ValidateLogin = 'validatelogin',
  // Login = 'Property/GetLoginDetails',
  // LogOut = 'User/LogOutByUserId/{Username}/{TenantId}/{PropertyId}',
  // SavePassword = 'User/SavePassword/{UserId}/{NewPassword}/{TenantId}/{PropertyId}',
  // CreateSession = 'User/session',  
  // UpdateSession = 'User/session/sessionId/{sessionId}',
  // CheckPassword = 'User/CheckPasswordExists/{UserId}/{NewPassword}/{TenantId}',
  // VerifyPassword = 'User/VerifyPassword/{UserId}/{NewPassword}/{TenantId}',
  // PasswordSetting = 'Property/GetPasswordSettings/{TenantId}',
  // UserToken = 'Property/UpdatePayload',
  // // Property
  // GetProperty = 'property/getPropertyInfoByPropertyId/{id}',
  // UpdateProperty = 'property/UpdatePropertyInfo',
  // UpdatePropertySetting = 'property/PatchUpdatePropertySetting/{PropertyId}',
  // GetAllPropertySettings = 'property/GetPropertySetting/{propertyId}',
  // GetAllLanguages = 'language/GetAllLanguages',
  // GetPaymentConfigurationByProperty = 'Payment/GetPaymentConfigurationByProperty/{propertyId}',
  //  // SNC users
  //  GetSncUserConfig = 'UserConfiguration?userId={id}',
}