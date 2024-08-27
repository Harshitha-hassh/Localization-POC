import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import * as _ from 'lodash';
import { UI } from 'src/app/common/Models/property-information.model';
import { CustomizableDashboardDataService } from 'src/app/common/dataservices/authentication/customizable-dashbard.data.service';
import { Localization } from 'src/app/common/shared/localization/Localization';

@Injectable()
export class HomeDashboardConfigurationBusiness {
    captions: any
    constructor(private localisation: Localization, private customizableDashboardService: CustomizableDashboardDataService) {
        this.captions = this.localisation.captions;
    }


    public shouldActionButtonsDisable(form: UntypedFormGroup): UI.ActionButtonState {
        return {
            isSaveDisable: !(form.dirty && form.valid),
            isCancelDisable: !(form.dirty)
        } as UI.ActionButtonState;
    }
}