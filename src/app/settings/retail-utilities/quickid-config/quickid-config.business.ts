import { Injectable } from '@angular/core';
import { ConfigData, QuickIdConfigSetting } from './quickid-config.model';
import { QuickIdConfigService } from './quickid-config.service';
import { UserAccessBusiness } from 'src/app/common/dataservices/authentication/useraccess.business';
import { UserAccessBreakPoints } from 'src/app/common/constants/useraccess.constants';

@Injectable()

export class QuickIdConfigBusiness {
    quickIdConfig = [
        QuickIdConfigSetting.retailtransactions,
        QuickIdConfigSetting.discountUpdateRemove,
        QuickIdConfigSetting.priceOverride
    ] as string[];

    isViewOnly: boolean = false;
    isAllow: boolean = false;
    constructor(private quickIdConfigService: QuickIdConfigService, public _userAccessBusiness: UserAccessBusiness) {    }

    public async GetQuickIdConfiguration(): Promise<ConfigData[]> {    
        let result = await this.quickIdConfigService.GetQuickIdConfigSettings();
        return this.mapToUI(result);
    }

    public async UpdateQuickIdConfigSettings(data): Promise<ConfigData[]> {    
        let result = await this.quickIdConfigService.UpdateQuickIdConfigSettings(data);
        return this.mapToUI(result);
    }

    public async GetSettingByModule(): Promise<any> {    
        let result = await this.quickIdConfigService.GetAllSettingbyModule("QuickIdConfig");
        console.log(result);        
        return result;
    }

    private mapToUI(configData: ConfigData[]): ConfigData[]{
        let result = [];
        this.quickIdConfig.forEach(val => {
            const configValue = configData.find(x=> x.switch === val);
            if(configValue) {
                result = result.concat({
                    id: configValue.id,
                    isActive: configValue.isActive,
                    moduleId: configValue.moduleId,
                    switch: configValue.switch,
                    switchType: configValue.switchType,
                    value: (configValue.value.toLowerCase() === 'true')
                } as ConfigData)
            }
        });
        return result;
    }
    async validateBreakPoints(): Promise<boolean> {
        const result = await this._userAccessBusiness.getUserAccess(UserAccessBreakPoints.QUICKIDCONFIG, true);
        this.isViewOnly = result.isViewOnly;
        this.isAllow = result.isAllow;
        return result.isAllow;
      }
    
}