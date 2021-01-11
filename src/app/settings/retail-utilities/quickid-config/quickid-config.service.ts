import { Injectable } from "@angular/core";
import { HttpMethod } from "src/app/common/Models/http.model";
import { HttpServiceCall } from "src/app/common/shared/shared/service/http-call.service";
import { ConfigData } from "./quickid-config.model";
import * as GlobalConst from 'src/app/common/shared/shared/globalsContant';

@Injectable()
export class QuickIdConfigService {
    constructor(private http: HttpServiceCall) {        
    }

    public async GetQuickIdConfigSettings(): Promise<ConfigData[]> {
      const response = await this.http.CallApiAsync<ConfigData[]>(
        {
          callDesc: 'GetAllSetting',
          method: HttpMethod.Get,
          host: GlobalConst.Host.retailManagement
        }
      );
      return response.result;
    }

    public async UpdateQuickIdConfigSettings(data): Promise<ConfigData[]> {
      const response = await this.http.CallApiAsync<ConfigData[]>(
        {
          callDesc: 'UpdateSetting',
          method: HttpMethod.Put,
          host: GlobalConst.Host.retailManagement,
          body: data
        }
      );
      return response.result;
    }

    public async GetAllSettingbyModule(data): Promise<ConfigData[]> {
      let response: any = await this.http.CallApiAsync<any>({
        host: GlobalConst.Host.retailManagement,
        callDesc: "GetAllSettingByModule",
        method: HttpMethod.Get,
        uriParams: {  module:data },
       
    });        
      return response.result;
    }
}