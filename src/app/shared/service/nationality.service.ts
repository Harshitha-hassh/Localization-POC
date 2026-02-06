import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommonDataService } from 'src/app/common/dataservices/common.data.service';
import { PropertyInformation } from 'src/app/core/services/property-information.service';
import countryCodeList from 'src/app/common/components/ag-phone-number/country-code.json';

export interface NationalityItem {
  id: number;
  code: string;
  name: string;
  countryId: number;
  countryCode: string;
  flagClass: string;
}

@Injectable({
  providedIn: 'root'
})
export class NationalityService {
  private nationalitiesSubject = new BehaviorSubject<NationalityItem[]>([]);
  public nationalities$: Observable<NationalityItem[]> = this.nationalitiesSubject.asObservable();
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  constructor(
    private commonDataService: CommonDataService,
    private propertyInfo: PropertyInformation
  ) {}

  /**
   * Load nationalities from API and store in service
   * Call this when client form opens or when nationality is needed
   */
  async loadNationalities(forceRefresh = false): Promise<void> {
    // If already loaded and not forcing refresh, return cached data
    if (!forceRefresh && this.nationalitiesSubject.value.length > 0) {
      return;
    }

    // If already loading, wait for the existing load to complete
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = this.fetchNationalities();
    
    try {
      await this.loadPromise;
    } finally {
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  private async fetchNationalities(): Promise<void> {
    try {
      const tenantId = Number(this.propertyInfo.GetPropertyInfoByKey('TenantId'));
      
      // Fetch nationalities and countries in parallel
      const [nationalities, countries]: [any[], any[]] = await Promise.all([
        this.commonDataService.GetAllNationality(tenantId),
        this.commonDataService.GetAllCountry()
      ]);
      
      if (nationalities && nationalities.length > 0) {
        const nationalityList = nationalities
          .filter(n => n.isActive)
          .map(n => {
            // Find matching country by countryId to get countryCode
            const country = countries?.find(c => c.id === n.countryId);
            const countryCode = country?.countryCode?.toLowerCase() || '';
            
            // Find flagClass from countryCodeList using iso2 code
            const countryCodeMatch = countryCodeList.find(c => 
              c.iso2?.toLowerCase() === countryCode || 
              c.iso3?.toLowerCase() === countryCode
            );
            
            return {
              id: n.id,
              code: n.nationalityName,
              name: n.nationalityName,
              countryId: n.countryId,
              countryCode: countryCode,
              flagClass: countryCodeMatch?.flagClass || ''
            };
          });
        
        this.nationalitiesSubject.next(nationalityList);
      }
    } catch (error) {
      console.error('Error loading nationalities:', error);
      this.nationalitiesSubject.next([]);
    }
  }

  /**
   * Get current nationalities synchronously
   */
  getNationalities(): NationalityItem[] {
    return this.nationalitiesSubject.value;
  }

  /**
   * Force refresh nationalities (e.g., on page reload)
   */
  async refresh(): Promise<void> {
    return this.loadNationalities(true);
  }

  /**
   * Clear cached data
   */
  clear(): void {
    this.nationalitiesSubject.next([]);
  }
}
