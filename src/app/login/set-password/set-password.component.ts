import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { ActivatedRoute } from '@angular/router';
import { LoginCommunicationService } from '../login-communication.service';
import { ButtonValue } from 'src/app/shared/shared-models';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss']
})
export class SetPasswordComponent implements OnInit, OnDestroy {

  captions: any;
  errorMessage: { oldPassword: string, newPassword: string; confirmPassword: string; };
  setPasswordForms: FormGroup;
  passwordSetUp: FormGroup;
  newPwd: string;
  confirmPwd: string;
  oldPassword: string;
  IsConfirmed = false;
  IsLengthValid: boolean;
  IsHavingAllTypes: boolean;
  IsSameAsUserName: boolean;
  IsHavingLowerCase: boolean;
  IsPasswordValid = false;
  IsLastPassword = true;
  IsOldPassword = false;
  buttonValuePrimary: ButtonValue;
  buttonValueSecondary: ButtonValue;
  minCharacter: any;
  maxCharacter: any;
  allowSpecialCharacters: any;
  formatingType: any;
  allowUserName: any;
  confirmJson: any;
  hiddenPassword = false;
  hideConfirmPassword = false;
  tenantId = '1';
  doneDisabled: boolean;
  constructor(
    private formBuilder: FormBuilder, private loginService: LoginCommunicationService,
    public dialogRef: MatDialogRef<SetPasswordComponent>,
    private localization: RetailStandaloneLocalization,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.passwordSetUp = this.formBuilder.group({});
  }

  async ngOnInit() {
    this.captions = this.localization.captions;
    this.doneDisabled = true;
    this.formGenerator();
    this.tenantId = this.data.tenantId;

    if (this.data.setPassword) {
      this.setPasswordForms.get('oldpassword').clearValidators();
    }
    const serviceParams = {
      route: RetailApiRoute.PasswordSetting,
      uriParams: { TenantId: this.tenantId },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };

    const resp: any = await this.loginService.makeGetCall(serviceParams);
    this.confirmJson = resp;
    this.validationMessage(this.confirmJson.result);
    this.OnFormValueChanges();

  }


  formGenerator() {
    this.setPasswordForms = this.formBuilder.group({
      oldpassword: ['', Validators.required],
      newpassword: ['', Validators.required],
      confirmpassword: ['', Validators.required],
    });
  }


  async DoneClick(event: any) {
    const newpwd = this.setPasswordForms.controls.newpassword.value;
    const cfmpwd = this.setPasswordForms.controls.confirmpassword.value;
    this.CheckPasswordExists(this.data.userName, newpwd, cfmpwd).then(async () => {
      if (!this.IsLastPassword) {
        const serviceParams = {
          route: RetailApiRoute.SavePassword,
          uriParams: { UserId: this.data.userName,
             NewPassword: encodeURIComponent(this.setPasswordForms.controls.newpassword.value), TenantId: this.tenantId, PropertyId: '1' },
          header: '',
          body: '',
          showError: true,
          baseResponse: true
        };
        const savePwdResponse = await this.loginService.makePostCall(serviceParams);
        if (savePwdResponse.successStatus) {
          this.dialogRef.close();
        } else {
          this.doneDisabled = true;
        }
      } else {
        this.doneDisabled = true;
      }
    });

  }

  CancelClick(event: any) {
    this.dialogRef.close();
  }
  OnFormValueChanges(): any {
    this.setPasswordForms.get('newpassword').valueChanges.subscribe(res => {
      this.doneDisabled = true;
      this.IsLengthValid = (res.length >= this.minCharacter) && (res.length <= this.maxCharacter) ? true : false;
      const returnFormat = this.formatingTypeValidation(this.formatingType, res, this.allowSpecialCharacters);
      this.IsHavingAllTypes = returnFormat ? true : false;
      this.IsSameAsUserName = res !== '' ? this.data.userName.toLowerCase() !== res.toLowerCase() : false;
      this.PasswordValidCheck();
      if (this.IsLengthValid) {
        this.CheckPasswordExists(this.data.userName, this.setPasswordForms.controls.newpassword.value, this)
          .then(() => {
            this.doneDisabled = true;
            if (!this.IsLastPassword) {
              this.IsConfirmed = (this.setPasswordForms.controls.confirmpassword.value == res && res != '') ? true : false;
              this.doneButtonChangeState();
            }
          }
          );
      } else {
        this.IsLastPassword = true;
      }

    });

    this.setPasswordForms.get('confirmpassword').valueChanges.subscribe(res => {
      this.doneDisabled = true;
      this.PasswordValidCheck();
      this.CheckPasswordExists(this.data.userName, this.setPasswordForms.controls.newpassword.value, this).then(() => {
        if (!this.IsLastPassword) {
          this.doneDisabled = true;
          this.IsConfirmed = (this.setPasswordForms.controls.newpassword.value == res && res != '') ? true : false;
          this.doneButtonChangeState();
        }
      });

    });
    if (!this.data.setPassword) {
      this.setPasswordForms.get('oldpassword').valueChanges.subscribe(async (res) => {
        this.doneDisabled = true;
        this.PasswordValidCheck();
        if (this.setPasswordForms.controls.oldpassword.value && this.setPasswordForms.controls.oldpassword.value.length > 0) {
          await this.VerifyPassword(this.data.userName, this.setPasswordForms.controls.oldpassword.value);
          this.doneButtonChangeState();
        }

      });
    } else {
      this.IsOldPassword = true;
    }

  }

  doneButtonChangeState() {
    this.doneDisabled = true;
    if (this.IsPasswordValid && this.IsLengthValid
       && this.IsHavingAllTypes && !this.IsLastPassword && this.IsSameAsUserName && this.IsOldPassword) {
      this.doneDisabled = !this.IsConfirmed;
    }
  }

  formatingTypeValidation(e: any, d: any, f: any) {
    let returnType;
    if (e === 1) {
      returnType = true;
    } else if (e === 2) {
      if (f) {
        const exp = '(?=.*[A-Za-z])(?=.*[ !"#$%&\'()*+,-./:;<=>?@\\[\\]^_`{|}~\\\\])(?!.*[0-9])';
        const regexpValue = new RegExp(exp, 'g');
        returnType = regexpValue.test(d);
      } else {
        const regexpValue = new RegExp('^[A-Za-z]+$');
        returnType = regexpValue.test(d);
      }
    } else if (e === 3) {
      if (f) {
        const exp = '(?=.*[0-9])(?=.*[ !"#$%&\'()*+,-./:;<=>?@\\[\\]^_`{|}~\\\\])(?!.*[A-Za-z])';
        const regexpValue = new RegExp(exp, 'g');
        returnType = regexpValue.test(d);
      } else {
        const regexpValue = new RegExp('^[0-9]+$');
        returnType = regexpValue.test(d);
      }

    } else if (e === 4) {
      if (f) {
        const exp = '(?=.*[A-Za-z])(?=.*[0-9])(?=.*[ !"#$%&\'()*+,-./:;<=>?@\\[\\]^_`{|}~\\\\])';
        const regexpValue = new RegExp(exp, 'g');

        returnType = regexpValue.test(d);
      } else {
        const exp = '(?=.*[A-Za-z])(?=.*[0-9])(?!=.*[ !"#$%&\'()*+,-./:;<=>?@\\[\\]^_`{|}~\\\\])';
        const regexpValue = new RegExp(exp, 'g');
        returnType = regexpValue.test(d);
      }
    }
    return returnType;
  }
  PasswordValidCheck() {
    this.IsPasswordValid = (this.IsLengthValid && this.IsHavingAllTypes && this.IsSameAsUserName);
  }
  async CheckPasswordExists(userName, password, confirmpassword: any) {
    const serviceParams = {
      route: RetailRoutes.CheckPassword,
      uriParams: { UserId: userName, NewPassword: encodeURIComponent(password), TenantId: this.tenantId },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    if (password.length != 0) {
      const resp: any = await this.loginService.makeGetCall(serviceParams);
      this.IsLastPassword = Boolean(resp.result);
    }
  }
  validationMessage(passwordresult: any) {
    this.minCharacter = passwordresult.minimumCharacters;
    this.maxCharacter = passwordresult.maximumCharacters;
    this.formatingType = passwordresult.formattingType;
    this.allowUserName = (passwordresult.allowUserName) ? true : false;
    this.allowSpecialCharacters = (passwordresult.allowSpecialCharacters) ? true : false;
  }
  getReturnFormValue(event: any) {
    this.newPwd = event.confirmPwd[0].confirmPwd;
    this.confirmPwd = event.newPwd[0].newPwd;
    if (!this.data.setPassword) {
      this.oldPassword = event.oldPassword[0].oldPassword;
    }
  }
  async VerifyPassword(userName, password) {
    const serviceParams = {
      route: RetailRoutes.VerifyPassword,
      uriParams: { UserId: userName, NewPassword: encodeURIComponent(password), TenantId: this.tenantId },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    const resp: any = await this.loginService.makeGetCall(serviceParams);
    this.IsOldPassword = Boolean(resp.result);
  }
  ngOnDestroy() {

  }
}
