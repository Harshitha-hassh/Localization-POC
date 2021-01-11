import { Injectable } from '@angular/core';
import { ConfigData, QuickIdConfigSetting } from './quickid-config.model';
import { QuickIdConfigService } from './quickid-config.service';

@Injectable()

export class QuickIdConfigBusiness {
    quickIdConfig = [
        QuickIdConfigSetting.retailtransactions
    ] as string[];

    constructor(private quickIdConfigService: QuickIdConfigService) {    }

    public async GetQuickIdConfiguration(): Promise<ConfigData[]> {    
        let result = await this.quickIdConfigService.GetQuickIdConfigSettings();
        return this.mapToUI(result);
    }

    public async UpdateQuickIdConfigSettings(data): Promise<ConfigData[]> {    
        let result = await this.quickIdConfigService.UpdateQuickIdConfigSettings(data);
        return this.mapToUI(result);
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

}