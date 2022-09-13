import { AuthConfig } from 'angular-oauth2-oidc';

export class ADB2CAuthConfiguration
{
    ADB2CAuthFeatureEnabled: boolean = false;
    DiscoveryDocumentConfigUrl: string;
    authConfig: AuthConfig;
}