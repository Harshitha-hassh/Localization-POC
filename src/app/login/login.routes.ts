export enum LoginRoutes {
    Login = "Property/GetLoginDetails",
    GetADB2CAuthConfig = 'Adb2CAuthentication/GetADB2CAuthConfigByProductId/{tenantId}/{productId}',
    ADB2CLogin = 'Adb2CAuthentication/GetADB2CLoginDetails',
    LogOut = "User/LogOutByUserId/{Username}/{TenantId}/{PropertyId}",
    SavePassword = "User/SavePassword/{UserId}/{NewPassword}/{TenantId}/{PropertyId}",
    CreateSession = "User/session",
    UpdateSession = "User/session/sessionId/{sessionId}",
    CheckPassword = "User/CheckPasswordExists/{UserId}/{NewPassword}/{TenantId}",
    VerifyPassword = "User/VerifyPassword/{UserId}/{NewPassword}/{TenantId}",
    PasswordSetting = "Property/GetPasswordSettings/{TenantId}",
    SupportUserLogin = 'Adb2CAuthentication/GetSupportUserLoginDetails',
}
