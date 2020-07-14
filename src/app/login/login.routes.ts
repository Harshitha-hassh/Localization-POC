export enum LoginRoutes {
    Login = "Property/GetLoginDetails",
    LogOut = "User/LogOutByUserId/{Username}/{TenantId}/{PropertyId}",
    SavePassword = "User/SavePassword/{UserId}/{NewPassword}/{TenantId}/{PropertyId}",
    CreateSession = "User/session",
    UpdateSession = "User/session/sessionId/{sessionId}",    
    CheckPassword = "User/CheckPasswordExists/{UserId}/{NewPassword}/{TenantId}",
    VerifyPassword = "User/VerifyPassword/{UserId}/{NewPassword}/{TenantId}",
    PasswordSetting = "Property/GetPasswordSettings/{TenantId}",
}
