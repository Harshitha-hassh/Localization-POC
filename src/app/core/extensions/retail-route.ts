export enum RetailApiHosts {
  SalesCateringService,
  TenantManagement,
  RetailManagement,
  SNCGateway,
  Report,
  PayAgent,
  MsDeeplink,
  V1IGPosting,
  RetailPOS,
  Image
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
  GetAllPropertyConfigurationSettings = 'propertyConfiguration/configurationName/{configurationName}/propertyId/{propertyId}/productId/{productId}',
  // SNC users
  GetSncUserConfig = 'UserConfiguration?userId={id}',
  // Dashboard
  GetOutletCount = 'DashBoard/getOutletCount',
  GetVendorCount = 'Vendor/GetVendorInfo',
  GetTransactionCount = 'DashBoard/GetTransactionCount',
  GetOutOfStockItems = 'retailitems/GetInventoryRetailItems',
  GetTransactionSaleDetail = 'Transaction/getTransactionSale/{startDate}/{dataFormat}',
  GetItemSaleDetail = 'Transaction/getItemSale/{startDate}/{endDate}',
  GetCategorySaleDetail = 'Transaction/getCategorySale/{startDate}/{endDate}',
  GetOpenTickets = 'DashBoard/getOpenTransactionList/{processDate}',
  GetReturnedItems = 'DashBoard/getReturnedItems/{startDate}/{dataFormat}',

  //Client
  CreateClient = 'Clients' ,
  UpdateClient ='Clients',
  RecentClientInfo ='Clients/recent/{propertyDate}/search/{requestUid}',
  SearchClientInfo = 'Clients/search/{requestUid}',
  GlobalSearchClientInfo = 'Clients/searchByKey',
  GetClientByPatronId="Clients/getClientByPatronId/{patronId}",
  GetClientByIds = "Clients/query/{includeRelatedData}",
  GetClientByGuestId = "clients/guid/{guid}",

   //Image
   saveImage = 'v2/Images',
   updateImage = 'v2/Images',
   DeleteImageByReference = 'v2/images/{guid}',
   GetImagesByReferenceId = 'v2/images?guid={imageReferenceId}&isThumbnailOnly={isThumbnailOnly}',
   GetAllImagesByReferenceId = 'v2/images/list?isThumbnailOnly={isThumbnailOnly}',

   //Retail
   GlobalSearchRetailItems = 'retailitems/search/name',
   GetDefaultUserConfiguration = 'UserSessionConfiguration/user/{userId}',
   GetOutletsByProperty = 'Outlets',
   //EATEC
   EatecToken = 'Login/Token/Eatec',

   //Notification
   SendManualNotification=  "EmailSMSNotification/SendNotification",
}

export enum MsGraphRoutes {
  Me = '/me',
  MeMessages = '/me/messages',
  MeEvents = '/me/events',
  MeTasks = '/me/outlook/tasks',
  MeContacts = '/me/contacts?$filter=createdDateTime ge {lastSyncTime} or lastModifiedDateTime ge {lastSyncTime} &$top=100',
  // MeContacts='/me/contacts?$top=100',
  MeDeltaContacts = '/me/contacts/delta',
  MeUpdateContacts = '/me/contacts',
  MeSendMail = '/me/sendMail',
  Batch = '/$batch'
}