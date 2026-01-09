import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, Validators } from '@angular/forms';
import { GuestIdentityTypes } from 'src/app/common/shared/shared/enums/enums';
import { CreateClientBusiness } from '../../client-popup.business';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import { RetailLocalization } from 'src/app/retail/common/localization/retail-localization';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { GuestIdentityDetail } from '../client.modal';
import { AgDateConfig, DropdownOptions } from 'src/app/common/Models/ag-models';

@Component({
    selector: 'app-identification-details',
    standalone: false,
    templateUrl: './identification-details.component.html',
    styleUrls: ['./identification-details.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdentificationDetailsComponent implements OnInit, OnDestroy {
    @Input() parentForm: UntypedFormGroup;
    @Input() isViewOnly: boolean = false;
    @Input() existingDetails: any[] = [];

    identificationForm: UntypedFormGroup;
    identityTypeOptions: any[] = [];
    passportTypeOptions: any[] = [];
    captions: any;
    floatLabel: string;
    maxDate: Date;
    
    // Country autocomplete
    countryDetails: any[] = [];
    filteredCountriesMap: Map<number, Observable<any[]>> = new Map();
    destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    
    // Date picker configs map for each row
    issuedDateConfigMap: Map<number, AgDateConfig> = new Map();
    expiryDateConfigMap: Map<number, AgDateConfig> = new Map();
    
    // Dropdown options map for each row (with disabled state)
    typeDropdownOptionsMap: Map<number, DropdownOptions[]> = new Map();

    constructor(
        private fb: UntypedFormBuilder,
        private business: CreateClientBusiness,
        private propertyInfo: PropertyInformation,
        private localization: RetailLocalization,
        private http: HttpClient
    ) {
        this.captions = this.localization.captions.identificationDetails;
        this.floatLabel = this.localization.setFloatLabel;
        this.maxDate = this.propertyInfo.CurrentDate;
    }

    ngOnInit(): void {
        this.identityTypeOptions = this.business.getGuestIdentityTypes();
        this.passportTypeOptions = this.business.getPassportTypes();

        this.identificationForm = this.fb.group({
            identificationDetails: this.fb.array([this.createItem()])
        });

        if (this.parentForm) {
            this.parentForm.addControl('identificationDetailsFormGroup', this.identificationForm);
        }

        // Initialize dropdown options for first row
        this.createTypeDropdownOptions(0);

        // Load countries for autocomplete
        this.loadCountries().then(() => {
            // Setup filtered countries for initial row
            this.setupFilteredCountries(0);
            
            if (this.existingDetails?.length) {
                this.setExistingDetails(this.existingDetails);
            }
        });

        if (this.isViewOnly) {
            this.identificationForm.disable();
        }
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
    }

    get identificationDetails(): UntypedFormArray {
        return this.identificationForm.get('identificationDetails') as UntypedFormArray;
    }

    createItem(): UntypedFormGroup {
        return this.fb.group({
            id: 0,
            identificationTypeId: '',
            value: [{ value: '', disabled: true }],  // Disabled until type is selected
            issuingCountry: [{ value: '', disabled: true }]  // Disabled until type is selected
        });
    }

    addItem(): void {
        const newIndex = this.identificationDetails.length;
        this.identificationDetails.push(this.createItem());
        this.setupFilteredCountries(newIndex);
        this.createTypeDropdownOptions(newIndex);
        // Update all dropdown options to reflect disabled states
        this.updateAllTypeDropdownOptions();
    }

    removeItem(index: number): void {
        if (this.identificationDetails.length > 1) {
            this.identificationDetails.removeAt(index);
            this.filteredCountriesMap.delete(index);
            this.issuedDateConfigMap.delete(index);
            this.expiryDateConfigMap.delete(index);
            this.typeDropdownOptionsMap.delete(index);
            // Rebuild maps for remaining rows
            this.rebuildFilteredCountriesMap();
            this.rebuildIssuedDateConfigMap();
            this.rebuildExpiryDateConfigMap();
            this.rebuildTypeDropdownOptionsMap();
        }
    }

    /**
     * Load countries from JSON file
     */
    async loadCountries(): Promise<void> {
        try {
            const data: any = await this.http.get('assets/i18n/Countries/en-US.Countries.json').toPromise();
            this.countryDetails = data?.Countries || [];
        } catch (error) {
            console.error('Failed to load countries:', error);
            this.countryDetails = [];
        }
    }

    /**
     * Setup filtered countries observable for a specific row index
     */
    setupFilteredCountries(index: number): void {
        const group = this.identificationDetails.at(index) as UntypedFormGroup;
        if (group) {
            const filtered$ = group.get('issuingCountry').valueChanges.pipe(
                startWith(''),
                debounceTime(100),
                distinctUntilChanged(),
                map((value: string) => value ? this.filterCountries(value) : []),
                takeUntil(this.destroyed$)
            );
            this.filteredCountriesMap.set(index, filtered$);
        }
    }

    /**
     * Rebuild filtered countries map after row removal
     */
    private rebuildFilteredCountriesMap(): void {
        this.filteredCountriesMap.clear();
        for (let i = 0; i < this.identificationDetails.length; i++) {
            this.setupFilteredCountries(i);
        }
    }

    /**
     * Rebuild issued date config map after row removal
     */
    private rebuildIssuedDateConfigMap(): void {
        const existingConfigs = new Map(this.issuedDateConfigMap);
        this.issuedDateConfigMap.clear();
        
        for (let i = 0; i < this.identificationDetails.length; i++) {
            const group = this.identificationDetails.at(i) as UntypedFormGroup;
            if (group.contains('issuedDate')) {
                this.createIssuedDateConfig(i, group);
            }
        }
    }

    /**
     * Rebuild expiry date config map after row removal
     */
    private rebuildExpiryDateConfigMap(): void {
        this.expiryDateConfigMap.clear();
        
        for (let i = 0; i < this.identificationDetails.length; i++) {
            const group = this.identificationDetails.at(i) as UntypedFormGroup;
            if (group.contains('expiryDate')) {
                this.createExpiryDateConfig(i, group);
            }
        }
    }

    /**
     * Filter countries based on input value
     */
    filterCountries(value: string): any[] {
        const filterValue = value.toLowerCase();
        return this.countryDetails.filter(country => 
            country.CountryName.toLowerCase().includes(filterValue)
        );
    }

    /**
     * Validate country on blur - clear if invalid
     */
    clearInvalidCountry(event: any, index: number): void {
        const value = event.target.value?.trim();
        if (value) {
            const isValid = this.countryDetails.some(
                country => country.CountryName.toLowerCase() === value.toLowerCase()
            );
            if (!isValid) {
                const group = this.identificationDetails.at(index) as UntypedFormGroup;
                group.get('issuingCountry').setValue('');
            }
        }
    }

    /**
     * Get filtered countries observable for a row
     */
    getFilteredCountries(index: number): Observable<any[]> {
        return this.filteredCountriesMap.get(index);
    }

    /**
     * Check if an identification type should be disabled
     * A type is disabled if it's already selected in another row (except "Others" which can be selected multiple times)
     */
    isTypeDisabled(typeValue: any, currentIndex: number): boolean {
        // "Others" type can be selected multiple times
        if (typeValue == GuestIdentityTypes.Others) {
            return false;
        }

        // Check if this type is already selected in any other row
        for (let i = 0; i < this.identificationDetails.length; i++) {
            if (i !== currentIndex) {
                const selectedType = this.identificationDetails.at(i).get('identificationTypeId')?.value;
                if (selectedType == typeValue) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get dropdown options for a specific row with disabled state applied
     */
    getTypeDropdownOptions(index: number): DropdownOptions[] {
        return this.typeDropdownOptionsMap.get(index) || [];
    }

    /**
     * Create dropdown options for a row with disabled state based on other selections
     */
    createTypeDropdownOptions(index: number): void {
        const options: DropdownOptions[] = this.identityTypeOptions.map(type => ({
            id: type.value,
            viewValue: type.viewValue,
            disabled: this.isTypeDisabled(type.value, index)
        }));
        this.typeDropdownOptionsMap.set(index, options);
    }

    /**
     * Update all dropdown options when a selection changes
     */
    updateAllTypeDropdownOptions(): void {
        for (let i = 0; i < this.identificationDetails.length; i++) {
            this.createTypeDropdownOptions(i);
        }
    }

    /**
     * Rebuild dropdown options map after row removal
     */
    private rebuildTypeDropdownOptionsMap(): void {
        this.typeDropdownOptionsMap.clear();
        this.updateAllTypeDropdownOptions();
    }

    onTypeChange(event: any, group: UntypedFormGroup, index: number): void {
        // Extract value properly from MatSelectChange event
        const selectedValue = (event && typeof event === 'object' && 'value' in event) ? event.value : event;
        
        // Check if a valid type is selected
        const isValidType = selectedValue !== null && selectedValue !== undefined && selectedValue !== '' && selectedValue !== 0;

        // Remove conditional controls first
        this.removeConditionalControls(group);
        
        // Remove date configs for this row
        this.issuedDateConfigMap.delete(index);
        this.expiryDateConfigMap.delete(index);

        // Handle enable/disable of common fields based on type selection
        const valueControl = group.get('value');
        const issuingCountryControl = group.get('issuingCountry');
        
        if (isValidType) {
            // Enable fields and add required validator for value
            valueControl?.enable();
            valueControl?.setValidators(Validators.required);
            issuingCountryControl?.enable();
        } else {
            // Disable fields, remove validators, and clear values
            valueControl?.disable();
            valueControl?.clearValidators();
            issuingCountryControl?.disable();
            group.patchValue({ value: '', issuingCountry: '' });
        }
        valueControl?.updateValueAndValidity();

        const currentDate = this.propertyInfo.CurrentDate;

        // Social Security Number (1) & Driver's License (3) - No conditional fields needed
        if (selectedValue == GuestIdentityTypes.SocialSecurityNumber || 
            selectedValue == GuestIdentityTypes.DriversLicense) {
            // No additional controls needed - only value and issuingCountry fields are shown
        }
        // Passport Number (2) - issuingLocation, issuedDate (req), expiryDate (req), passportType
        else if (selectedValue == GuestIdentityTypes.PassportNumber) {
            group.addControl('issuingLocation', this.fb.control(''));
            group.addControl('issuedDate', this.fb.control(currentDate, Validators.required));
            group.addControl('expiryDate', this.fb.control(currentDate, Validators.required));
            group.addControl('passportType', this.fb.control(1, Validators.required));
            this.createIssuedDateConfig(index, group);
            this.createExpiryDateConfig(index, group);
        }
        // National ID (4) - issuingLocation, issuedDate (req), expiryDate (req)
        else if (selectedValue == GuestIdentityTypes.NationalID) {
            group.addControl('issuingLocation', this.fb.control(''));
            group.addControl('issuedDate', this.fb.control(currentDate, Validators.required));
            group.addControl('expiryDate', this.fb.control(currentDate, Validators.required));
            this.createIssuedDateConfig(index, group);
            this.createExpiryDateConfig(index, group);
        }
        // Others (5) - identificationTypeOtherName (req), issuingLocation, issuedDate (req), expiryDate (req)
        else if (selectedValue == GuestIdentityTypes.Others) {
            group.addControl('identificationTypeOtherName', this.fb.control('', Validators.required));
            group.addControl('issuingLocation', this.fb.control(''));
            group.addControl('issuedDate', this.fb.control(currentDate, Validators.required));
            group.addControl('expiryDate', this.fb.control(currentDate, Validators.required));
            this.createIssuedDateConfig(index, group);
            this.createExpiryDateConfig(index, group);
        }
        
        // Update all dropdown options to reflect new disabled states
        this.updateAllTypeDropdownOptions();
    }

    /**
     * Create date picker config for issued date
     */
    createIssuedDateConfig(index: number, group: UntypedFormGroup): void {
        const config: AgDateConfig = {
            form: group,
            formControlName: 'issuedDate',
            placeHolder: this.captions.IssuedDate,
            automationId: `Txt_IdentificationDetails_issuedDate_${index}`,
            maxDate: this.maxDate,
            isDateRequired: true,
            errorMessage: this.captions.MissingIssuedDate,
            className: 'width-150px'
        };
        this.issuedDateConfigMap.set(index, config);
    }

    /**
     * Get date picker config for a row
     */
    getIssuedDateConfig(index: number): AgDateConfig {
        return this.issuedDateConfigMap.get(index);
    }

    /**
     * Create date picker config for expiry date
     */
    createExpiryDateConfig(index: number, group: UntypedFormGroup): void {
        const config: AgDateConfig = {
            form: group,
            formControlName: 'expiryDate',
            placeHolder: this.captions.ExpiryDate,
            automationId: `Txt_IdentificationDetails_expiryDate_${index}`,
            minDate: this.propertyInfo.CurrentDate,
            isDateRequired: true,
            errorMessage: this.captions.MissingExpiryDate,
            className: 'width-150px'
        };
        this.expiryDateConfigMap.set(index, config);
    }

    /**
     * Get expiry date picker config for a row
     */
    getExpiryDateConfig(index: number): AgDateConfig {
        return this.expiryDateConfigMap.get(index);
    }

    private removeConditionalControls(group: UntypedFormGroup): void {
        ['passportType', 'issuedDate', 'expiryDate', 'identificationTypeOtherName', 'issuingLocation'].forEach(ctrl => {
            if (group.contains(ctrl)) {
                group.removeControl(ctrl);
            }
        });
    }

    private setExistingDetails(details: GuestIdentityDetail[]): void {
        // Clear existing
        while (this.identificationDetails.length) {
            this.identificationDetails.removeAt(0);
        }
        this.filteredCountriesMap.clear();
        this.issuedDateConfigMap.clear();
        this.expiryDateConfigMap.clear();
        this.typeDropdownOptionsMap.clear();

        const currentDate = this.propertyInfo.CurrentDate;

        details.forEach((detail, index) => {
            const group = this.createItem();
            // Handle both API field names (type) and legacy names (identificationTypeId)
            const typeId = detail.type ?? detail.type;
            const isPassport = typeId === GuestIdentityTypes.PassportNumber;
            const isNationalID = typeId === GuestIdentityTypes.NationalID;
            const isOthers = typeId === GuestIdentityTypes.Others;

            // Types that require issuingLocation, issuedDate, and expiryDate
            const requiresDatesAndLocation = isPassport || isNationalID || isOthers;

            if (requiresDatesAndLocation) {
                group.addControl('issuingLocation', this.fb.control(''));
                group.addControl('issuedDate', this.fb.control(
                    detail.issuedDate ? new Date(detail.issuedDate) : currentDate,
                    Validators.required
                ));
                group.addControl('expiryDate', this.fb.control(
                    detail.expiryDate ? new Date(detail.expiryDate) : currentDate,
                    Validators.required
                ));
                this.createIssuedDateConfig(index, group);
                this.createExpiryDateConfig(index, group);
            }

            if (isPassport) {
                group.addControl('passportType', this.fb.control(detail.passportType || 1));
            }

            if (isOthers) {
                // Handle both API field name (identityTypeOtherName) and UI field name (identificationTypeOtherName)
                const otherName = detail.identificationTypeOtherName || '';
                group.addControl('identificationTypeOtherName', this.fb.control(otherName, Validators.required));
            }

            // Patch base form values
            group.patchValue({
                id: detail.id || 0,
                identificationTypeId: typeId,
                value: detail.value || '',
                issuingCountry: detail.issuingCountry || ''
            });

            // Enable fields if valid type is selected (for existing data)
            if (typeId > 0) {
                const valueControl = group.get('value');
                const issuingCountryControl = group.get('issuingCountry');
                valueControl?.enable();
                valueControl?.setValidators(Validators.required);
                valueControl?.updateValueAndValidity();
                issuingCountryControl?.enable();
            }

            // Patch conditional control values if they exist
            if (requiresDatesAndLocation && detail.issuingLocation) {
                group.get('issuingLocation')?.setValue(detail.issuingLocation);
            }

            this.identificationDetails.push(group);
            this.setupFilteredCountries(index);
            this.createTypeDropdownOptions(index);
        });
        
        // Initialize dropdown options for all rows after loading existing details
        this.updateAllTypeDropdownOptions();
    }
}
