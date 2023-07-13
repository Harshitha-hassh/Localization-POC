import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RetailStandaloneLocalization } from 'src/app/core/localization/retailStandalone-localization';
import { ActivatedRoute } from '@angular/router';
import { LoginCommunicationService } from '../login-communication.service';
import { ButtonValue } from 'src/app/shared/shared-models';
import { RetailRoutes } from 'src/app/core/extensions/retail-route';
import { CryptoUtility } from 'src/app/core/utilities/crypto.utility';
import { NewPasswordDetail } from 'src/app/common/Models/common.models';
import { debounceTime } from 'rxjs/operators';


@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.scss'],
  providers: [CryptoUtility ]
})
export class SetPasswordComponent implements OnInit, OnDestroy {

  captions: any;
  errorMessage: { oldPassword: string, newPassword: string; confirmPassword: string; };
  setPasswordForms: UntypedFormGroup;
  passwordSetUp: UntypedFormGroup;
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
  key : string ;
  iv : string;
  floatLabel: string;
  characterValidationMsg: any;
  allowReuse: any;
  hiddenPassword1 = false;
  hiddenPassword2 = false;
  debounceTime = 1500;



  constructor(
    private formBuilder: UntypedFormBuilder, private loginService: LoginCommunicationService,
    public dialogRef: MatDialogRef<SetPasswordComponent>,
    private localization: RetailStandaloneLocalization,  private crypto: CryptoUtility,
    private route: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.passwordSetUp = this.formBuilder.group({});
    this.floatLabel = this.localization.setFloatLabel;
  }

  async ngOnInit() {
    this.captions = this.localization.captions;
    this.doneDisabled = true;
    this.formGenerator();
    this.tenantId = this.data.tenantId;

    if (this.data.setPassword) {
      this.setPasswordForms.get('oldpassword').clearValidators();
    }
    if(this.data && this.data.encKeyIv && this.data.encKeyIv.key &&  this.data.encKeyIv.iv)
    {
      this.key = this.data.encKeyIv.key;
      this.iv = this.data.encKeyIv.iv;
    }
    this.validationMessage(this.data.passwordSetting);
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
    const oldpwd: string = this.setPasswordForms.controls.oldpassword.value;
    let isValidOldPassword: boolean = oldpwd != undefined && oldpwd.length > 0 ? true : false;
    let newPasswordDetail: NewPasswordDetail = { userName: this.data.userName, newPassword: this.setPasswordForms.controls.newpassword.value, tenantId: Number(this.tenantId), propertyId: 1, oldPassword: oldpwd, isPasswordEncrypted: false };
    let savePwdResponse;
    let serviceParams;
    this.CheckPasswordExists(this.data.userName, newpwd, cfmpwd).then(async () => {
      if (!this.IsLastPassword) {
        if (this.key && this.iv) {
          newPasswordDetail.isPasswordEncrypted = true;

          if (isValidOldPassword) {
            newPasswordDetail.oldPassword = this.crypto.EncryptString(this.setPasswordForms.controls.oldpassword.value, this.key, this.iv);
          }
          serviceParams = {
            route: RetailRoutes.SavePasswordPost,
            header: '',
            body: newPasswordDetail,
            showError: true,
            baseResponse: true
          };

          serviceParams.body.newPassword = this.crypto.EncryptString(this.setPasswordForms.controls.newpassword.value, this.key, this.iv);

        }
        savePwdResponse = await this.loginService.makePostCall(serviceParams);
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
    this.setPasswordForms.get('newpassword').valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(res => {
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

    this.setPasswordForms.get('confirmpassword').valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(res => {
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
      this.setPasswordForms.get('oldpassword').valueChanges.pipe(debounceTime(this.debounceTime)).subscribe(async (res) => {
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
        const exp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]{4,}$/;
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
    let resp: any;
    if(password.length !=0)
    {
        if(this.key && this.iv)
        {
          let newPasswordDetail : NewPasswordDetail = { userName: userName, newPassword: password, tenantId: Number(this.tenantId) , oldPassword :"",isPasswordEncrypted:true  } ;
          let serviceParams = {
            route: RetailRoutes.CheckPasswordPut,
            header: '',
            body: newPasswordDetail,
            showError: true,
            baseResponse: true
          };
          serviceParams.body.newPassword = this.crypto.EncryptString(password,this.key,this.iv);
          resp = password.length !=0 ? await this.loginService.makePutCall(serviceParams) : null;
        }
        else{
      const serviceParams = {
        route: RetailRoutes.CheckPassword,
        uriParams: { UserId: userName, NewPassword: encodeURIComponent(password), TenantId: this.tenantId },
        header: '',
        body: '',
        showError: true,
        baseResponse: true
      };
      resp = password.length !=0 ?  await this.loginService.makeGetCall(serviceParams): null;
      }
      this.IsLastPassword = Boolean(resp.result);
    }
  }
  validationMessage(passwordresult: any) {
    this.minCharacter = passwordresult.minimumCharacters;
    this.maxCharacter = passwordresult.maximumCharacters;
    this.formatingType = passwordresult.formattingType;
    this.allowReuse = passwordresult.allowReuse;
    this.allowUserName = (passwordresult.allowUserName) ? true : false;
    this.allowSpecialCharacters = (passwordresult.allowSpecialCharacters) ? true : false;
    if(this.formatingType == 2)
    {
      this.characterValidationMsg = this.allowSpecialCharacters ? this.captions.OneSpecialCharactersAndAlphabets : this.captions.OnlyAlphabets;
    }
    else if(this.formatingType == 3)
    {
      this.characterValidationMsg = this.allowSpecialCharacters ? this.captions.OneSpecialCharactersAndNumbers : this.captions.OnlyNumbers;
    }
    else if(this.formatingType == 4)
    {
      this.characterValidationMsg = this.allowSpecialCharacters ? this.captions.OneSpecialCharacterNumberAlphabet : this.captions.AlphabetsAndNumbers;
    }
  }
  getReturnFormValue(event: any) {
    this.newPwd = event.confirmPwd[0].confirmPwd;
    this.confirmPwd = event.newPwd[0].newPwd;
    if (!this.data.setPassword) {
      this.oldPassword = event.oldPassword[0].oldPassword;
    }
  }
  async VerifyPassword(userName, password) {
    let resp: any;
        if(this.key && this.iv)
        {
          let newPasswordDetail : NewPasswordDetail = { userName: userName, newPassword: password, tenantId: Number(this.tenantId),oldPassword:"",isPasswordEncrypted:true  } ;
          let serviceParams = {
              route: RetailRoutes.VerifyPasswordPut,
              header: '',
              body:  newPasswordDetail,
              showError: true,
              baseResponse: true
          };
          serviceParams.body.newPassword = this.crypto.EncryptString(password,this.key,this.iv);
          resp = await this.loginService.makePutCall(serviceParams);
        }
        else{
    const serviceParams = {
      route: RetailRoutes.VerifyPassword,
      uriParams: { UserId: userName, NewPassword: encodeURIComponent(password), TenantId: this.tenantId },
      header: '',
      body: '',
      showError: true,
      baseResponse: true
    };
    resp = await this.loginService.makeGetCall(serviceParams);
  }
    this.IsOldPassword = Boolean(resp.result);
  }
  ngOnDestroy() {

  }
}
