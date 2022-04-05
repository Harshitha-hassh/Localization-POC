import { Injectable } from '@angular/core';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';

@Injectable()
export class ManagerUtilitiesService {

  constructor(private _Localization: RetailLocalization) { }

  getCaptions() {
    return this._Localization.captions.settings.utilities;
  }
}
