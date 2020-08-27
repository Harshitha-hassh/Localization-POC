export const MsalConfiguration = {

    clientId: "",
    redirectUri: "",
    cacheLocation: "sessionStorage",
    unprotectedResources: [],
    protectedResourceMap: [
        "https://graph.microsoft.com/v1.0/me",
        [
            "user.read"
        ]
    ],
    Scopes: [
        "openid",
        "profile",
        "User.Read",
        "Mail.Read"
    ],
    tokenScope: [
        "Mail.Read"
    ]
}