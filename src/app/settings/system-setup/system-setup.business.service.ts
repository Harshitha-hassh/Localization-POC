import { Injectable } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Injectable()
export class SystemSetupBusinessService {

  public systemForm: UntypedFormGroup;
  public systemConfigValues: any;

  constructor() { }

}
