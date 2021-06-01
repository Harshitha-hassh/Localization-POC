import { FormGroup, ValidatorFn, AbstractControlOptions, AsyncValidatorFn, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { Injectable } from '@angular/core';

export type AgysFormControlType = [string, ValidatorFn | null, AsyncValidatorFn | null];


export class AgysFormGroup extends FormGroup {

    /**
     *formGroup Value
     * @private
     * @type {{ [key: string]: any; }}
     * @memberof AgysFormGroup
     */
    private _controlValues: { [key: string]: any; };

    private _modified: boolean;

    public get modified(): boolean {
        return this._modified;
    }


    constructor(controls: { [key: string]: any }
        , validatorOrOpts?: ValidatorFn | ValidatorFn[] | AbstractControlOptions | null
        , asyncValidator?: AsyncValidatorFn | AsyncValidatorFn[] | null) {
        super(<any>controls, validatorOrOpts, asyncValidator);

        this._watchValueChanges();
        this._setControlValues();
    }

    private _setControlValues() {
        if (this.value && this.value.length > 0) {
            this._controlValues = [...this.value];
        }
        else {
            this._controlValues = { ...this.value };
        }
    }

    private _watchValueChanges() {
        this.valueChanges.subscribe((x) => {
            this._validateValueChanges(x);
        });
    }

    private _validateValueChanges(formGroupValues) {
        this._modified = !this._checkFormValues(formGroupValues, this._controlValues);
        if (!this._modified) {
            this.markAsPristine();
        }
    }

    public patchValue(value: { [key: string]: any; }
        , options?: { onlySelf?: boolean; emitEvent?: boolean; }): void {
        super.patchValue(value, options);
        // set this.value to validate the given patchvalue -> set value and get the formgroup value
        this._setControlValues();
    }

    private _checkFormValues(newValue: any, oldValue: any) {

        // set default object to avoid error.
        newValue = newValue || {};
        oldValue = oldValue || {};

        // Create arrays of property names
        var aProps = Object.getOwnPropertyNames(newValue);
        var bProps = Object.getOwnPropertyNames(oldValue);

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false;
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i];

            // check Date values changes
            if (typeof newValue[propName] == "object" && Object.prototype.toString.call(newValue[propName]) === '[object Date]') {
                let newDate = new Date(newValue[propName]);
                let oldDate = new Date(oldValue[propName]);
                if (newDate.getTime() !== oldDate.getTime())
                    return false;
            }
            // if the value if an object, use reccursive function to check the value
            else if (typeof newValue[propName] == "object" && newValue[propName] === null && newValue[propName] ===  undefined) {
                if (!this._checkFormValues(newValue[propName], oldValue[propName]))
                    return false;
            }
            // If values of same property are not equal,
            // objects are not equivalent
            else if (newValue[propName] !== oldValue[propName]) {
                return false;
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true;
    }

}

@Injectable({
    providedIn: "root"
})
export class AgysFormBuilder extends FormBuilder {
    constructor() {
        super();

    }

    group<T>(controlsConfig: { [keyof: string]: any; }
        , options?: AbstractControlOptions | { [key: string]: any; } | null): AgysFormGroup {
        const controls = this._reduceControls(controlsConfig);

        let validators: ValidatorFn | ValidatorFn[] | null = null;
        let asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | null = null;
        let updateOn: any = undefined;

        if (options != null) {
            if (isAbstractControlOptions(options)) {
                // `options` are `AbstractControlOptions`
                validators = options.validators != null ? options.validators : null;
                asyncValidators = options.asyncValidators != null ? options.asyncValidators : null;
                updateOn = options.updateOn != null ? options.updateOn : undefined;
            } else {
                // `options` are legacy form group options
                validators = options['validator'] != null ? options['validator'] : null;
                asyncValidators = options['asyncValidator'] != null ? options['asyncValidator'] : null;
            }
        }

        //return new FormGroup(controls, { asyncValidators, updateOn, validators });    
        return new AgysFormGroup(<any>controls, { asyncValidators, updateOn, validators });
    }

    _reduceControls(controlsConfig: { [k: string]: any }): { [key: string]: AbstractControl } {
        const controls: { [key: string]: AbstractControl } = {};
        Object.keys(controlsConfig).forEach(controlName => {
            controls[controlName] = this._createControl(controlsConfig[controlName]);
        });
        return controls;
    }

    /** @internal */
    _createControl(controlConfig: any): AbstractControl {
        if (controlConfig instanceof FormControl || controlConfig instanceof FormGroup ||
            controlConfig instanceof FormArray) {
            return controlConfig;

        } else if (Array.isArray(controlConfig)) {
            const value = controlConfig[0];
            const validator: ValidatorFn = controlConfig.length > 1 ? controlConfig[1] : null;
            const asyncValidator: AsyncValidatorFn = controlConfig.length > 2 ? controlConfig[2] : null;
            return this.control(value, validator, asyncValidator);

        } else {
            return this.control(controlConfig);
        }
    }


}

function isAbstractControlOptions(options: AbstractControlOptions | { [key: string]: any }):
    options is AbstractControlOptions {
    return (<AbstractControlOptions>options).asyncValidators !== undefined ||
        (<AbstractControlOptions>options).validators !== undefined ||
        (<AbstractControlOptions>options).updateOn !== undefined;
}
