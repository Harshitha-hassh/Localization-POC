import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class SystemSetupBusinessService {

  public systemForm: FormGroup;
  public systemConfigValues: any;

  constructor() { }

}
