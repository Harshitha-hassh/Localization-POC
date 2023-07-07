export class RetailApiHosts {
  SalesCateringService: string;
  TenantManagement: string;
  RetailManagement: string;
  SNCGateway: string;
  Report: string;
  PayAgent: string;
  MsDeeplink: string;
  V1IGPosting: string;
  RetailPOS: string;
  Image: string;
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
  GetSupportedPMAgentVersionByProperty = 'Payment/GetPMAgentVersion/{propertyId}',
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
  RecentClientInfo ='Clients/recent/{propertyDate}/search/{searchType}/{requestUid}',
  SearchClientInfo = 'Clients/search/{searchType}/{requestUid}',
  GlobalSearchClientInfo = 'Clients/searchByKey',
  GetClientByPatronId="Clients/getClientByPatronId/{patronId}",
  GetClientByIds = "Clients/query/{includeRelatedData}",
  GetClientByGuestId = "clients/guid/{guid}",
  GetClientStayDetails = "Itinerary/clients/{clientId}/stay",

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

   // Combine Guests
   GetGuestInformation= "GuestCombine/guestsearch",
   CombineGuestInformation= "GuestCombine/{primaryGuestId}",
   GetGuestInfoByGuid="GuestCombine/{id}",
   UpdateGuestInformation= "GuestCombine/updateguest" ,
   LoginEncrypted = 'Property/GetEncLoginDetails',
   GetEncryptKey = 'Login/encValue',
   CheckPasswordPut = 'User/CheckPasswordExists',
   VerifyPasswordPut = 'User/VerifyPassword',
   SavePasswordPost = 'User/SavePassword',
   UpdateConsentPolicyDetailsForGuestId = 'PointOfSaleService/GuestPolicy/UpdateConsentPolicyDetailsForGuestId',

   // support user
   GetUserByTenantId = 'User/GetUserByTenantId/{UserName}/{tenantId}',
   GetTenantGroupDetailByProductId = 'TenantOrganization/GetTenantGroupDetailByProductId?productId={productId}',
   GetPropertyDetailsByProductId = 'Property/GetPropertyDetailsByProductId?productId={productId}',
   ValidateUserByTenantAndEmail = 'User/ValidateUserByTenantAndEmail?tenantId={tenantId}&emailId={emailId}'
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
