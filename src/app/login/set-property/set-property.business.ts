import { Injectable } from '@angular/core';
import { PropertyInformationDataService } from 'src/app/common/dataservices/authentication/property-information.data.service';

@Injectable()
export class SetPropertyBusiness {
    constructor(
        private propertyInfoDataService: PropertyInformationDataService) {
    }

    public GetLoginDetailsByToken(token: string) {
        return this.propertyInfoDataService.GetLoginDetailsByToken(token);
    }

}
