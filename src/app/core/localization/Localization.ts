import * as EnUs from "../../../assets/i18n/en-US.json";
import * as DefaultErrors from '../../../assets/errors/error.en-US.json';
import { Injectable } from "@angular/core";
import * as moment from "moment";
import * as _ from "lodash";
import { LocalizedMonthsModel, localizationJSON, Calendar, DaysModel } from 'src/app/shared/shared-models';


declare var $: any;
const DEFAULT_LOCALE = "en-US";
const DEFAULT_CURRENCY = "USD";
const DEFAULT_DECIMAL_SEP = ".";
const DEFAULT_THOUSAND_SEP = ",";
const DEFAULT_DATE_FORMAT = "l";
const DEFAULT_DATETIME_FORMAT = "l";
const DEFAULT_CURRENCY_LENGTH = 15;//Total Length With Decimal separator
type hourFormat = '24' | '12';

export const enum DateTimeFormat {
  HHmmss = 1,
  HHmm
}

export const enum JsonDataSourceType {
  ContactType
}
//export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Injectable(
  {
    providedIn: 'root'
  }
)
export class Localization {

  public captions: localizationJSON;
  public localeCode: string = DEFAULT_LOCALE;
  public currencyCode: string = DEFAULT_CURRENCY;
  public decimalSeparator: string = DEFAULT_DECIMAL_SEP;
  public thousandSeparator: string = DEFAULT_THOUSAND_SEP;
  public currencySymbol: string = "";
  public timeFormat: string = "";
  public dateFormat: string = "";
  public daysArray: DaysModel[] = [];
  public daysNormalArray: DaysModel[] = [];
  public monthsArray: LocalizedMonthsModel[] = [];
  public shortDateFormat: string = "";
  public propertyCaptions: localizationJSON;
  /**
   * Locale Days with Valid ID.
   */

  public LongDaysModel;
  public ShortDays;
  public LongDays;
  private errorCaptions: any = {};
  ContactTypes: any;

  constructor() {
    this.SetLocaleBasedProperties();
  }

  public SetLocaleBasedProperties() {
    this.setLocaleCode();
    this.setLocaleCurrency();
    this.setDecimalSeparator();
    this.setThousandSeparator();
    this.setCurrencySymbol();
    this.setDateTimeFormat();
    this.captions = this.getCaptions();
    this.propertyCaptions = this.getPropertyCaptions();
    this.ContactTypes = this.loadJson(JsonDataSourceType.ContactType);
    this.fillCalenderObject();
    this.daysArray = this.getDaysModel(true);
    this.daysNormalArray = this.getDaysArray();
    this.monthsArray = this.generateMonthsArr();
    this.errorCaptions = this.getErrorCaptions();
  }

  private getJsonUrl(type: JsonDataSourceType): string {
    let url = '';
    switch (type) {
      case JsonDataSourceType.ContactType:
        url = `./assets/i18n/DataSource/${this.GetUserLanguage()}.ContactTypes.json`
        break;
      default:
        break;
    }
    return url;
  }

  private loadJson(type: JsonDataSourceType): any {
    let url: string = this.getJsonUrl(type);
    let jsonResult: any;
    $.ajax({
      url: url,
      async: false,
      success: function (result) {
        if (typeof result == "object") {
          jsonResult = result;
        }
        else {
          jsonResult = [];
        }
      },
      error: function (result) {
        jsonResult = [];
      }
    });

    if (jsonResult.length == 0) {
      $.ajax({
        url: `./assets/i18n/DataSource/${this.localeCode}.ContactTypes.json`,
        async: false,
        success: function (result) {
          jsonResult = result;
        },
        error: function (result) {
          jsonResult = [];
        }
      });
    }

    if (jsonResult.length == 0) {
      $.ajax({
        url: `./assets/i18n/DataSource/en-US.ContactTypes.json`,
        async: false,
        success: function (result) {
          jsonResult = result;
        },
        error: function (result) {
          jsonResult = [];
        }
      });
    }
    return jsonResult;
  }

  /**
   * Returns the language based JSON
   */
  public getCaptions() {
    let userLanguage = this.GetUserLanguage();
    let languageJsonValue = (userLanguage == "" || userLanguage == null ? DEFAULT_LOCALE : userLanguage) + ".json";
    return this.parseCaptionsFromLanguageJSON(languageJsonValue);
  }

  private getPropertyCaptions() {
      const propertyLanguage = this.GetPropertyInfo('Language');
      let languageJsonValue = (propertyLanguage == "" || propertyLanguage == null ? DEFAULT_LOCALE : propertyLanguage) + ".json";
      return this.parseCaptionsFromLanguageJSON(languageJsonValue);
  }



  private parseCaptionsFromLanguageJSON(language: string) {
    let languageJson: any = this.getLocaleLanguageJson(language);
    if (languageJson != null) {
      if (!languageJson[0].success) {
        language = this.localeCode + ".json";
        languageJson = this.getLocaleLanguageJson(language);
      }
      return languageJson[0].json;
    }
  }

  private getLocaleLanguageJson(languageJsonValue: string) {
    let languageJson = [];
    $.ajax({
      url: "./assets/i18n/" + languageJsonValue,
      async: false,
      success: function (result) {
        if (typeof result == "object") {
          languageJson.push({
            "json": result,
            "success": true
          });
        }
        else {
          languageJson.push({
            "json": EnUs,
            "success": false
          });
        }
      },
      error: function (result) {
        languageJson.push({
          "json": EnUs,
          "success": false
        });
      }
    });
    return languageJson;
  }

  private async getLocaleJSON(name: string): Promise<any> {
    // TO DO need to implement Promise instead of ajax( jquery )
    // let url: string = `./assets/i18n/${name}`;
    // let value: any = this.http.get<any>(url).toPromise();
    // let json: any = await value;
  }

  /**
   * Returns the Localized error string from Error.json file.
   * @param code Error Code (as in error.json)
   */
  public getError(code: number): string {
    if (!code || code == -1 || code == -2 || code == 0) {
      return (
        this.errorCaptions[-2] +
        "." +
        "<br><br>" +
        "<span> Error Code: " +
        code +
        "</span>"
      );
    } else {
      if (this.errorCaptions[code]) {
        return this.errorCaptions[code];
      } else {
        return (
          this.errorCaptions[-2] +
          "." +
          "<br><br>" +
          "<span> Error Code: " +
          code +
          "</span>"
        );
      }
    }
  }

  private GetUserLanguage(): string {
    let userPreferred = this.GetUserInfo("language"); let propertyLanguage = this.GetPropertyInfo("UserLanguage");
    let userLanguage = this.validateString(userPreferred) ? userPreferred : this.validateString(propertyLanguage) ? propertyLanguage : "en-US";
    return userLanguage;
  }

  public validateString(input: string) {
    if (input != "null" && input != null && input != undefined && input != '') {
      return true;
    }
    return false;
  }
  private getErrorCaptions() {
    let userLanguage = this.GetUserLanguage();
    let errorJsonValue = "error." + (userLanguage == "" || userLanguage == null ? DEFAULT_LOCALE : userLanguage) + ".json";
    let errorJson: any = this.loadErrorJSON(errorJsonValue);

    if (errorJson != null) {
      if (!errorJson[0].success) {
        errorJsonValue = "error." + this.localeCode + ".json";
        errorJson = this.loadErrorJSON(errorJsonValue);
      }
      return errorJson[0].json;
    }
  }

  /**
   * This method returns list of error messages
   * @param errorCode Error code
   */
  public getErrorText(errorCode: number[]): string {
    let errorTxt = "";
    if (errorCode && errorCode.length > 0) {
      for (let i = 0; i < errorCode.length; i++) {
        errorTxt += "<span>" + this.getError(errorCode[i]) + "</span></br></br>";
      }
    }
    return errorTxt;
  }
  private loadErrorJSON(errorJsonValue: string) {
    let errorJson = [];
    $.ajax({
      url: "./assets/errors/" + errorJsonValue,
      async: false,
      success: function (result) {
        if (typeof result == "object") {
          errorJson.push({
            "json": result,
            "success": true
          });
        }
        else {
          errorJson.push({
            "json": DefaultErrors,
            "success": false
          });
        }
      },
      error: function (result) {
        errorJson.push({
          "json": DefaultErrors,
          "success": false
        });
      }
    });
    return errorJson;
  }

  private ReadCookie(name: string) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    //var ca = sessionStorage.getItem("propertyInfo").split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i].trim();
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  public GetPropertyInfo(name: string) {
    return this.GetsessionStorageValue("propertyInfo", name);
  }
  public GetUserInfo(name: string) {
    return this.GetsessionStorageValue("_userInfo", name);
  }
  public GetUserSettings(name: string) {
    return this.GetsessionStorageValue("userSettings", name);
  }
  public GetsessionStorageValue(key: string, name: string) {
    return this.getStorageValue(sessionStorage, key, name);
  }

  public GetLocalStorageValue(key: string, name: string) {
    return this.getStorageValue(localStorage, key, name);
  }

  private getStorageValue(storage, key: string, name: string) {
    const nameEQ = name + '=';
    const propertyInfo = storage.getItem(key);
    if (propertyInfo != null) {
      const ca = propertyInfo.split(';');

      for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
        if (c.indexOf(nameEQ) == 0) { return c.substring(nameEQ.length, c.length); }
      }
    }
    return null;
  }

  private setLocaleCode() {
    // const localeCode = this.GetUserLanguage();
    const localeCode = this.GetPropertyInfo("Language"); //bug fix for 27078
    this.localeCode = localeCode ? localeCode : DEFAULT_LOCALE;
    moment.locale(this.localeCode);
  }

  private setLocaleCurrency() {
    let currencyCode = this.GetPropertyInfo("Currency");
    this.currencyCode = currencyCode == null ? DEFAULT_CURRENCY : currencyCode;
  }

  private setCurrencySymbol() {
    const decimalNumber = 1;
    this.currencySymbol = decimalNumber
      .toLocaleString(this.localeCode, {
        style: "currency",
        currency: this.currencyCode,
        minimumFractionDigits: 0
      })
      .replace(/[\d]/g, "")
      .trim();
  }

  private setDecimalSeparator(localeCode = null) {
    const decimalNumber = 1.1;
    this.decimalSeparator = decimalNumber
      .toLocaleString(localeCode ? localeCode : this.localeCode)
      .substring(1, 2);
  }

  private setThousandSeparator(localeCode = null) {
    const decimalNumber = 1000;
    this.thousandSeparator = decimalNumber
      .toLocaleString(localeCode ? localeCode : this.localeCode)
      .substring(1, 2);
  }

  private setDateTimeFormat() {
    var localeData = moment.localeData();
    this.timeFormat = localeData.longDateFormat("LT");
    // To append zero for single hours in time
    if (this.timeFormat == "h:mm A") {
      let mnt: any = moment.localeData();
      mnt._longDateFormat.LT = "hh:mm A";
    }
    localeData = moment.localeData();
    this.dateFormat = localeData.longDateFormat("L");
    this.shortDateFormat = localeData.longDateFormat("ll");
  }

  private trimThousandSeparator(value: string): string {
    return value
      .toString()
      .split(this.thousandSeparator)
      .join("");
  }


  private fillCalenderObject(): void {
    let ShortDaysOfWeek: string[] = moment.weekdaysShort(false); // locally sorted false starts with SUNDAY For any language.
    let ShortDaysOfWeek_Keys: string[] = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ]; //Calendar Keys to be used across app

    let LongDaysOfWeek: string[] = moment.weekdays(false);
    let LongDaysOfWeek_Keys: string[] = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]; //Calendar Keys to be used across app

    let monthsShort: string[] = moment.monthsShort();
    let monthsShortKeys: string[] = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];

    let monthsLong: string[] = moment.months();
    let monthsLongKeys: string[] = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    this.createCalendarObject(ShortDaysOfWeek_Keys, ShortDaysOfWeek);
    this.createCalendarObject(LongDaysOfWeek_Keys, LongDaysOfWeek);
    this.createCalendarObject(monthsLongKeys, monthsLong);
    this.createCalendarObject(monthsShortKeys, monthsShort);
  }

  private createCalendarObject(keys: any[], values: any[]) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.captions.calendar[key] = values[i];
    }
  }

  private generateMonthsArr(): LocalizedMonthsModel[] {
    let monthsShortKeys: string[] = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    let monthsLong: string[] = moment.months();
    let monthsShort: string[] = moment.monthsShort();
    let returnArr: LocalizedMonthsModel[] = [];
    for (let i = 0; i < 12; i++) {
      returnArr.push({
        id: i,
        short: monthsShort[i],
        long: monthsLong[i],
        code: monthsShortKeys[i]
      });
    }
    return returnArr;
  }

  /**
   *  Converts to localized currency
   * @param value Valid number with decimal seperator as '.'
   * @param currencySymbolRequired Flag to enable/disable currency symbol.
   * @param minFraction Defines the minimum fraction in localized currency.
   */

  public localizeCurrency(value: any, currencySymbolRequired: boolean = true, minFraction: number = 2): string {
    let decimalNumber: number;
    if ((!value && value != "0") || value.length === 0 || isNaN(Number(value)))
      return "";
    decimalNumber = parseFloat(parseFloat(value).toFixed(minFraction));
    if (isNaN(decimalNumber)) decimalNumber = 0.0;
    return currencySymbolRequired
      ? decimalNumber.toLocaleString(this.localeCode, {
        style: "currency",
        currency: this.currencyCode,
        minimumFractionDigits: minFraction
      })
      : decimalNumber.toLocaleString(this.localeCode, {
        minimumFractionDigits: minFraction
      });
  }

  /**
  * Converts to localized number format without thousand separator
  * @param string A string with valid number. Decimal separator should be period (.)
  */
  localizePercentage(value: string) {
    let decimalNumber: number = 0;
    if ((!value && value != "0") || value.length === 0 || isNaN(Number(value)))
      return decimalNumber.toString();
    decimalNumber = parseFloat(value);
    if (isNaN(decimalNumber)) decimalNumber = 0;
    return decimalNumber.toLocaleString(this.localeCode, {
      minimumFractionDigits: 2
    }).split(this.thousandSeparator).join('');
  }

  /**
   * Converts  a formatted currency string to a floating-point number which can be saved into database
   * @param string A string can contain currency symbol, thousand separator, decimal separator etc.
   * eg: 1.500,50 will be converted to 1500.50
   */
  currencyToSQLFormat(value: string): number {
    if (!value || value.length === 0) return 0;
    let decimal: any;
    decimal = this.trimThousandSeparator(value);
    if (this.decimalSeparator == ",") {
      decimal = decimal.toString().replace(this.decimalSeparator, ".");
    }
    decimal = decimal.toString().replace(/[^\d.,-]/g, "");
    return isNaN(decimal) ? 0.0 : parseFloat(decimal);
  }

  /**
   * Converts a formatted currency string to a currency with decimal separator
   * @param string A string can contain currency symbol, thousand separator, decimal separator etc.
   */
  removeThousandSeparator(value: string): string {
    return value
      .toString()
      .replace(/[^\d.,-]/g, "")
      .split(this.thousandSeparator)
      .join("");
  }

  /**
   * Converts  a formatted currency string to a string with decimal separator for patch JSON model.
   * @param any[] Array of patched JSON .
   * @param string Key of patched element to be formatted.
   */
  currencyToSQLFormatForPatchedJSON(patchJson: any[], keys: string): any[] {
    let keyPath = "/" + keys;
    for (let i = 0; i < patchJson.length; i++) {
      const patchedElement = patchJson[i];
      if (patchedElement.path == keyPath) {
        patchedElement.value = this.currencyToSQLFormat(patchedElement.value);
        return patchedElement;
      }
    }
  }
  /**
   * Converts a moment date object to SQL date format yyyy-MM-ddTHH:ss:MM+05:30.
   * @param moment moment date object.
   * @param string Date separator.'-' will be used as default
   */
  convertMomentDateToSQLDate(value): string {
    if (value._isAMomentObject) {
      return value.format('YYYY-MM-DDTHH:mm:ss');
    } else return value;
  }
  /**
   * Converts a javascript date object to API date format yyyy-MM-dd.
   * @param Date javascript date object.
   * @param string Date separator.'-' will be used as default
   */
  convertDateObjToAPIdate(value: Date | string, separator: string = "-"): string {
    if (typeof value == "string") {
      value = this.getDate(moment(value).format("YYYY-MM-DDTHH:mm"));
    }
    return (
      value.getFullYear() +
      separator +
      (value.getMonth() + 1) +
      separator +
      value.getDate()
    );
  }

  convertDateTimeToAPIDateTime(value: Date) {
    return moment(value).format("YYYY-MM-DDTHH:mm")
  }

  /**
* Converts a javascript date object to API date format yyyy-MM-dd.
* @param Date javascript date object.
* @param string Date separator.'-' will be used as default
*/
  localizeDisplayDate(value: Date | string, isDateTime: boolean = false): string {
    if (typeof value == "string") {
      value = this.getDate(value);
    }
    const displayStyle: string = isDateTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT;
    return moment(value).format(displayStyle);
  }

  delocalizeDisplayDate(value: string | Date, isDateTime: boolean = false): Date {
    const displayStyle: string = isDateTime ? DEFAULT_DATETIME_FORMAT : DEFAULT_DATE_FORMAT;
    return this.getDate(moment(value, displayStyle).format("YYYY-MM-DDTHH:mm"));

  }
  localizeUTCDate(value: Date | string, isDateTime: boolean = false): string {
    const displayStyle: string = isDateTime ? 'lll' : 'l';
    return moment.utc(value).local().format(displayStyle);
  }
  /**
   *
   * @param value time format to convert to API date time
   * @param hourFormat 12 hour or 24 hour format. either `24` or `12`
   */
  convertTimePartToAPIDateTime(value: string, hourFormat: hourFormat = '24'): string {
    if (value) {
      let timeformat = value.split(' ');
      if (timeformat[1]) {
        hourFormat = '12';
      } else {
        hourFormat = '24';
      }
      if (hourFormat == '12')
        return moment(value, 'hh:mm A').format("YYYY-MM-DDTHH:mm");
      return moment(value, 'HH:mm').format("YYYY-MM-DDTHH:mm");
    }
  }

  /**
   * Converts a javascript date to localized date string.
   * @param Date javascript date.
   */
  LocalizeDate(value: Date | string): string {
    if (typeof value == "string") {
      value = this.getDate(moment(value).format("YYYY-MM-DDTHH:mm"));
    }
    return moment(value).format("DD MMM YYYY");
    /*
        * using Javascript native method
        var options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return value.toLocaleDateString(this.localeCode, options);
        */
  }

    /**
   * Display number in Million or Thousand format.
   * @param number value.
   */
  DisplayMillion(value: number,args: number): string {
    //Localization pending
    var exp, suffixes = ['K', 'M', 'B', 'T', 'Q'];
    if (value < 1000) {
      return value.toString();
    }
    exp = Math.floor(Math.log(value) / Math.log(1000));
    return (value / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1];   
  }

  /**
   * Converts a javascript date to localized short date string.
   * @param Date javascript date.
   */
  LocalizeShortDate(value: Date): string {
    if (typeof value == "string") {
      value = this.getDate(moment(value).format("YYYY-MM-DDTHH:mm"));
    }
    return moment(value).format(this.dateFormat);
  }

  /**
   * Converts a Localized Short date string to javascript date.
   * @param value Localized Short date.
   */
  DeLocalizeShortDate(value: string): Date {
    return this.getDate(moment(value, "ll").format("YYYY-MM-DDTHH:mm"));
  }

  /**
   * Converts a javascript date to localized short date time string.
   * @param Date javascript date.
   */
  LocalizeShortDateTime(value: Date): string {
    return this.LocalizeShortDate(value) + " " + this.LocalizeTime(value, true);
  }

  /**
   * Converts a javascript date to localized string of format 11-January-2019 11:11 am
   * @param Date javascript date.
   */
  LocalizeDateTimeFormatDDMMMMYYYY(value: Date): string {
    if (typeof value == 'string') value = this.getDate(value);
    let separator: string = "-";
    let localizedMonth: string = this.getLocalizedMonth(value);
    return value.getDate() + separator + localizedMonth + separator + value.getFullYear() + " " + this.LocalizeTime(value, true);
  }

  /**
 * Converts a javascript date to localized string of format 11-Jan-2019 11:11 am
 * @param Date javascript date.
 */
  LocalizeDateTimeFormatDDMMMYYYY(value: Date): string {
    if (typeof value == 'string') value = this.getDate(value);
    let separator: string = "-";
    let localizedMonth: string = this.getLocalizedMonthShort(value);
    return value.getDate() + separator + localizedMonth + separator + value.getFullYear() + " " + this.LocalizeTime(value, true);
  }

  /**
   * Converts a javascript date to localized time string.
   * @param Date javascript date.    *
   */
  LocalizeTime(value: Date | string, isCapital = true): string {
    if (typeof value == "string") {
      value = this.getDate(moment(value).format("YYYY-MM-DDTHH:mm"));
    }
    if (isCapital) {
      return moment(value).format("LT");
    } else {
      return moment(value)
        .format("LT")
        .toLowerCase();
    }
  }
  /**
   * Converts localized time to ISO time format(24 hour).
   * @param string Localized time string*
   */
  DeLocalizeTime(value: string): string {
    if (value.trim() == "")
      return "";
    return moment(value, "hh:mm A").format('HH:mm');
  }

  /**
   *
   * @param value Convert Date To time in 12 Hours Format
   */
  ConvertDateToTime(value: string): string {
    return moment(value).format('hh:mm a');
  }

  /**
   * Converts ISO time string to localized time string.
   * @example 13:00 to 1 PM for en-US locale
   * @param string time in AM PM format.*
   */
  LocalizeISOTime(value: string): string {
    return this.LocalizeTime(moment(value, "HH:mm").toDate());
  }
  /**
   * Returns 12 or 24 hour format.
   */
  getTimeFormat(): number {
    return (this.timeFormat.toLowerCase().indexOf('a')) > -1 ? 12 : 24; // a - means am/pm
  }
  getDefaultTime(): string {
    let date: Date = this.getCurrentDate();
    date.setHours(0, 0, 0, 0);
    return this.LocalizeTime(date, true);
  }

  getFirstDayOfWeek(): number {
    var localeData = moment.localeData();
    return localeData.firstDayOfWeek();
  }
  getShortDaysOfWeek(): string[] {
    return moment.weekdaysShort(true);
  }

  getLongDaysOfWeek(): string[] {
    return moment.weekdays(true);
  }

  getLocalizedDay(value: Date): string {
    return moment(value).format("dddd");
  }

  getLocalizedDayShort(value: Date): string {
    return moment(value).format("ddd");
  }

  getLocalizedMonth(value: Date): string {
    return moment(value).format("MMMM");
  }

  getLocalizedMonthShort(value: Date): string {
    return moment(value).format("MMM");
  }

  /**
   * Converts a javascript date to correponding day(Localized)
   * @param Date javascript date or Javascript ISO string.    *
   * check
   */
  getDayForDate(value: Date): string {
    return moment(value).format("ddd");
  }
  /**
   * Converts a javascript date to ISO date format string (C# API can understand this format).
   * @param Date javascript date or Javascript ISO string.    *
   */
  ConvertDateToISODate(dt: Date): string {
    try {
      if (typeof dt == "string") dt = this.getDate(moment(dt).format("YYYY-MM-DDTHH:mm"));
      return (
        dt.getFullYear() +
        "-" +
        (dt.getMonth() + 1 > 9
          ? dt.getMonth() + 1
          : "0" + (dt.getMonth() + 1)) +
        "-" +
        (dt.getDate() > 9 ? dt.getDate() : "0" + dt.getDate())
      );
    } catch (ee) { }
  }
  LocalizedTimeToISOTime(value: string): string {
    return this.ConvertDateToISOTime(
      this.getDate(moment(value, this.timeFormat).format("YYYY-MM-DDTHH:mm"))
    );
  }

  LocalizedTimeToISODateTime(value: string): string {
    return this.ConvertDateToISODateTime(
      this.getDate(moment(value, this.timeFormat).format("YYYY-MM-DDTHH:mm"))
    );
  }

  LocalizedTimeToISODate(value: string): string {
    return this.ConvertDateToISODate(
      this.getDate(moment(value, this.timeFormat).format("YYYY-MM-DDTHH:mm"))
    );
  }
  /**
   * Converts a javascript date to ISO date time format string (C# API can understand this format).
   * @param Date javascript date or Javascript ISO string.*
   */
  ConvertDateToISODateTime(dt: Date): string {
    if ((typeof dt) == "string") {
      dt = this.getDate(moment(dt).format("YYYY-MM-DDTHH:mm"));
    }
    if (!dt) return "";
    return (
      dt.getFullYear() +
      "-" +
      (dt.getMonth() + 1 < 10 ? "0" + (dt.getMonth() + 1) : dt.getMonth() + 1) +
      "-" +
      (dt.getDate() > 9 ? dt.getDate() : "0" + dt.getDate()) +
      "T" +
      (dt.getHours() > 9 ? dt.getHours() : "0" + dt.getHours()) +
      ":" +
      (dt.getMinutes() > 9 ? dt.getMinutes() : "0" + dt.getMinutes()) +
      ":" +
      (dt.getSeconds() > 9 ? dt.getSeconds() : "0" + dt.getSeconds())
    );
  }

  ConvertStringDateTimeToDate(date: string, time: string): Date {
    let selectedTime: Date = this.TimeToDate(this.DeLocalizeTime(time));
    let requestdate: Date = this.AddTimeToDate(this.convertDateObjToAPIdate(this.getDate(date)), selectedTime);
    return requestdate;
  }
  /**
   * Converts a javascript date to ISO date time format string (C# API can understand this format).
   * @param Date javascript date or Javascript ISO string.*
   */
  ConvertDateToISOTime(dt: Date): string {
    if (typeof dt == "string") {
      dt = this.getDate(moment(dt).format("YYYY-MM-DDTHH:mm"));
    }
    if (!dt) return "";
    return (
      (dt.getHours() > 9 ? dt.getHours() : "0" + dt.getHours()) +
      ":" +
      (dt.getMinutes() > 9 ? dt.getMinutes() : "0" + dt.getMinutes())
    );
  }
  /**
   * Adds Date and time from two different date objects.
   * @param Date javascript date or Javascript ISO string - date*
   * @param time javascript date or Javascript ISO string - time*
   */
  AddTimeToDate(date: any, time: any): Date {
    try {
      if (typeof date == "string") date = this.getDate(moment(date).format("YYYY-MM-DDTHH:mm"));
      if (typeof time == "string") time = this.getDate(moment(time).format("YYYY-MM-DDTHH:mm"));
      date =
        date.getFullYear() +
        "-" +
        (date.getMonth() + 1 > 9
          ? date.getMonth() + 1
          : "0" + (date.getMonth() + 1)) +
        "-" +
        (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
      time =
        (time.getHours() > 9 ? time.getHours() : "0" + time.getHours()) +
        ":" +
        (time.getMinutes() > 9 ? time.getMinutes() : "0" + time.getMinutes());
      return this.getDate(date + "T" + time);
    } catch (e) {
      return this.getCurrentDate();
    }
  }

  getformattedDateFromDDMMYYYY(date: string, separator: string = '/'): Date {
    let f = `DD${separator}MM${separator}YYYY`;
    return this.getDate(moment(date, f).format("YYYY-MM-DDTHH:mm"));
  }

  getDaysModel(AddAllDays: boolean): DaysModel[] {
    let longWeekArr = this.getLongDaysOfWeek();
    let shortWeekArr = this.getShortDaysOfWeek();
    let returnArr: DaysModel[] = [];
    let localizedCalender: Calendar = this.captions.calendar;
    if (AddAllDays) {
      returnArr.push({
        id: 0,
        short: this.captions.common.all,
        long: this.captions.common.all,
        code: "All"
      });
    }
    for (let i = 0; i < longWeekArr.length; i++) {
      const localelongDay = longWeekArr[i];
      const localeShortDay = shortWeekArr[i];
      switch (localelongDay) {
        case localizedCalender.Monday:
          returnArr.push({
            id: 1,
            short: localeShortDay,
            long: localelongDay,
            code: "Mon"
          });
          break;
        case localizedCalender.Tuesday:
          returnArr.push({
            id: 2,
            short: localeShortDay,
            long: localelongDay,
            code: "Tue"
          });
          break;
        case localizedCalender.Wednesday:
          returnArr.push({
            id: 3,
            short: localeShortDay,
            long: localelongDay,
            code: "Wed"
          });
          break;
        case localizedCalender.Thursday:
          returnArr.push({
            id: 4,
            short: localeShortDay,
            long: localelongDay,
            code: "Thu"
          });
          break;
        case localizedCalender.Friday:
          returnArr.push({
            id: 5,
            short: localeShortDay,
            long: localelongDay,
            code: "Fri"
          });
          break;
        case localizedCalender.Saturday:
          returnArr.push({
            id: 6,
            short: localeShortDay,
            long: localelongDay,
            code: "Sat"
          });
          break;
        case localizedCalender.Sunday:
          returnArr.push({
            id: 7,
            short: localeShortDay,
            long: localelongDay,
            code: "Sun"
          });
          break;
        default:
          break;
      }
    }

    return returnArr;
  }

  getDaysArray(): DaysModel[] {
    let longWeekArr = this.getLongDaysOfWeek();
    let shortWeekArr = this.getShortDaysOfWeek();
    let returnArr: DaysModel[] = [];
    let localizedCalender: Calendar = this.captions.calendar;
    for (let i = 0; i < longWeekArr.length; i++) {
      const localelongDay = longWeekArr[i];
      const localeShortDay = shortWeekArr[i];
      switch (localelongDay) {
        case localizedCalender.Monday:
          returnArr.push({
            id: 1,
            short: localeShortDay,
            long: localelongDay,
            code: "Mon",
            longCode: 'Monday'
          });
          break;
        case localizedCalender.Tuesday:
          returnArr.push({
            id: 2,
            short: localeShortDay,
            long: localelongDay,
            code: "Tue",
            longCode: 'Tuesday'
          });
          break;
        case localizedCalender.Wednesday:
          returnArr.push({
            id: 3,
            short: localeShortDay,
            long: localelongDay,
            code: "Wed",
            longCode: 'Wednesday'
          });
          break;
        case localizedCalender.Thursday:
          returnArr.push({
            id: 4,
            short: localeShortDay,
            long: localelongDay,
            code: "Thu",
            longCode: 'Thursday'
          });
          break;
        case localizedCalender.Friday:
          returnArr.push({
            id: 5,
            short: localeShortDay,
            long: localelongDay,
            code: "Fri",
            longCode: 'Friday'
          });
          break;
        case localizedCalender.Saturday:
          returnArr.push({
            id: 6,
            short: localeShortDay,
            long: localelongDay,
            code: "Sat",
            longCode: 'Saturday'
          });
          break;
        case localizedCalender.Sunday:
          returnArr.push({
            id: 0,
            short: localeShortDay,
            long: localelongDay,
            code: "Sun",
            longCode: 'Sunday'
          });
          break;
        default:
          break;
      }
    }

    return returnArr;
  }
  /**
  * Returns date object with current date and given time.
  * @param string ISO time format (HH:mm or HH:mm A)*
  */
  TimeToDate(value: string): Date {
    return this.getDate(this.ConvertDateToISODate(this.getCurrentDate()) + "T" + value);
  }

  // Generate Time Array starts
  dayTimeArray(strt: Date, end: Date, incby, typ, isTimeRounded = false) {
    //isTimeRounded - Time given is rounded, like 9:00, 9:30.. Not like 8.59
    let adaytime = [];
    let nexttime;
    let incrbyhrs;
    if (typ == "hours") {
      incrbyhrs = incby;
    } else {
      incrbyhrs = incby / 60;
    }

    let drstrt = moment(strt);
    let drend = moment(end);
    let timespan = drend.diff(drstrt, "hours") / incrbyhrs;
    if (timespan == 0) timespan = drend.diff(drstrt, "hours", true) / incrbyhrs;
    if (incrbyhrs < 1) {
      if (!isTimeRounded) timespan = timespan + 1 / incrbyhrs - 1;
      else timespan = timespan - 1;
    }
    for (let i = 0; i <= timespan; i++) {
      if (i == 0) {
        adaytime.push(
          this.LocalizeTime(
            this.getDate(
              moment(strt)
                .startOf(typ)
                .format('YYYY-MM-DDTHH:mm:ss')
            )
          )
        );
        //this.minutesarr(strt, typ, incby);
      } else {
        let localizedDate: any;
        strt = moment(strt)
          .startOf(typ)
          .add(incby, typ)
          .toDate();
        localizedDate = moment(strt).format('YYYY-MM-DDTHH:mm:ss');
        //this.minutesarr(strt, typ, incby);
        adaytime.push(this.LocalizeTime(this.getDate(localizedDate), true));
      }
    }
    return adaytime;
  }

  /**
   * Generates Time Range between two times, in minutes.
   * @param startTime
   * @param endTime
   * @param increment incremented by time in minutes only.
   */
  public generateTimeRange(startTime: Date, endTime: Date, increment: number): string[] {
    let Type: any = "minutes";
    let rangeArr: string[] = [];
    let mStartTime: moment.MomentInput = moment(startTime);
    let mEndTime: moment.MomentInput = moment(endTime);
    let timeDiff: number = mEndTime.diff(mStartTime, Type, true);

    if (timeDiff != 0 && (timeDiff / increment > 0)) {

      let noOfIncrements = timeDiff / increment;
      let noOfIncrementsRounded = parseInt(noOfIncrements.toString().split(".")[0]);
      let _date: Date;
      for (let i = 0; i <= noOfIncrementsRounded; i++) {
        _date = moment(mStartTime).add((increment * i), Type).toDate();
        rangeArr.push(this.LocalizeTime(_date));
      }
    }
    return rangeArr;
  }

  ToDate(value: string, inputFormat: string): Date {
    return this.getDate(moment(value, inputFormat).format("YYYY-MM-DDTHH:mm"));
  }

  getTimeDifference(fromTime: string, endTime: string, type?: string): number {

    if (!fromTime || fromTime === "" || !endTime || endTime === "") return;

    let fromTimeAsDate: Date = moment(fromTime, this.timeFormat).toDate();
    let endTimeAsDate: Date = moment(endTime, this.timeFormat).toDate();

    var timeDiffInMilliSecs = endTimeAsDate.getTime() - fromTimeAsDate.getTime();

    if (type && type.toLowerCase() === "min") {
      return Math.round(timeDiffInMilliSecs / (60 * 1000));
    } else if (type && type.toLowerCase() === "sec") {
      return Math.round(timeDiffInMilliSecs / 1000);
    }
    return timeDiffInMilliSecs;
  }

  getDateDifference(date1: Date, date2: Date): number {
    const difference = Math.abs(date1.getTime() - date2.getTime());
    return Math.floor((difference) / (1000 * 60 * 60 * 24));
  }

  getDaysDifference(date1: Date, date2: Date): number {
    let moment1 = moment(date1).endOf('day');
    let moment2 = moment(date2).endOf('day');
    return Math.abs(moment.duration(moment1.diff(moment2)).asDays());
  }

  getEndTime(dateValue: Date) {
    return moment(dateValue).endOf('day');
  }

  AddMinutes(date: Date, minutes: number) {
    return this.getDate(date.getTime() + minutes * 60000);
  }

  AddMins(date: Date, minutes: number) {
    var newDateObj = moment(date)
      .add(minutes, "m")
      .toDate();
    return newDateObj;
  }

  SubMinutes(date: Date, minutes: number) {
    return this.getDate(date.getTime() - minutes * 60000);
  }

  SubMins(date: Date, minutes: number) {
    var newDateObj = moment(date)
      .subtract(minutes, "m")
      .toDate();
    return newDateObj;
  }

  AddDays(date: Date, days: number) {
    var tempDate = _.cloneDeep(date);
    tempDate.setDate(date.getDate() + days);
    return tempDate;
  }

  format24HrTime(date: any): string {
    if (typeof date == "string") {
      date = this.getDate(date);
    }

    var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    var minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    return hours + ":" + minutes;
  }

  dateAdd = {
    thisRef: this,
    Minutes: function (date: Date, minutes: number) {
      return this.thisRef.getDate(date.getTime() + minutes * 60000);
    },
    AddMins: function (date: Date, minutes: number) {
      var newDateObj = moment(date)
        .add(minutes, "m")
        .toDate();
      return newDateObj;
    },
    AddDays: function (date: Date, days: number) {
      var tempDate = _.cloneDeep(date);
      tempDate.setDate(date.getDate() + days);
      return tempDate;
    },
    AddMonths: function (date: Date, months: number) {
      return moment(date)
        .add(months, "M")
        .toDate();
    },
    AddYears: function (date: Date, years: number) {
      return moment(date)
        .add(years, "y")
        .toDate();
    }
  };
  getTime(dt: Date, format: number) {
    if (format == 12) {
      return this.formatAMPM(dt, false);
    } else {
      return this.format24HrTime(dt);
    }
  }

  replacePlaceholders(caption: string, placeholders: string[], values: string[] | number[]): string {
    caption = caption.replace(/[{}]/g, "");
    for (let i = 0; i < placeholders.length; i++) {
      caption = caption.replace(placeholders[i], values[i].toString());
    }
    return caption;
  }

  convertAMPMTimeStringTo24Time(input: string): string {
    const matches = input.toLowerCase().match(/(\d{1,2}):(\d{2}) ([ap]m)/);
    const hours = this.getHour(matches);  //(matches[3] === 'am' && parseInt(matches[1]) === 12) ? 0 : (parseInt(matches[1]) + (matches[3] === 'pm' ? 12 : 0));
    return (hours.toString().length === 1 ? ('0' + hours.toString()) : hours.toString()) + ':' + matches[2] + ':00';
  }

  getHour(matches): number {
    if (matches[3] == 'am' && parseInt(matches[1]) === 12) {
      return 0
    }
    else if (matches[3] == 'am' && parseInt(matches[1]) < 12) {
      return parseInt(matches[1])
    }
    else if (matches[3] === 'pm' && parseInt(matches[1]) === 12) {
      return 12
    }
    else {
      return 12 + parseInt(matches[1])
    }
  }


  /** Verified */

  GetFormattedDate(dt: Date) {
    if (typeof dt == "string") dt = this.getDate(dt);
    let month = "" + (dt.getMonth() + 1);
    let day = "" + dt.getDate();
    let year = dt.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("/");
  }

  GetFormattedDateDDMMYY(dt: Date) {
    return this.localizeDisplayDate(dt);
  }

  GetFormattedDateDDMMYYYY(dt: Date) {

    if (typeof dt == "string") dt = this.getDate(dt);
    let month = "" + (dt.getMonth() + 1);
    let day = "" + dt.getDate();
    let year = dt.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("/");
  }

  GetFullDate(dt: Date) {
    let date = dt.getDate();
    if (date < 10) {
      return "0" + date;
    } else {
      return date;
    }
  }

  formatAMPM(date: Date, isCapital = true, isHours2Digit = true) {
    if (typeof date == "string") {
      date = this.getDate(date);
    }

    let Am_string = isCapital ? "AM" : "am";
    let Pm_string = isCapital ? "PM" : "pm";
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? Pm_string : Am_string;
    hours = hours % 12;
    hours = hours ? hours : 12;
    let minutestr = minutes < 10 ? "0" + minutes : minutes;
    var strTime =
      (hours > 9 ? hours : isHours2Digit ? "0" + hours : hours) +
      ":" +
      minutestr +
      " " +
      ampm;
    return strTime;
  }
  LocalizeGender(value: string): string {
    switch (value.toLowerCase()) {
      case "male":
      case "m":
        return this.captions.common.Male;
      case "female":
      case "f":
        return this.captions.common.Female;
    }
    return "";
  }

  getDate(input: any): Date {

    if ((typeof input) === 'string') {
      // Including T in the ISO format if not present
      if (input.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/) || input.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
        input = input.replace(' ', 'T');
      }
      let dateString: string = input;
      // yyyy-MM-ddTHH:mm or yyyy-MM-ddTHH:mm:ss
      if (input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/) || input.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)) {
        var splitDateArray = input.split('-');  //Contains the yyyy, MM, ddTHH:mm
        var splitTimeArray = splitDateArray[2].split('T'); //contains the dd, HH:mm:ss
        var splitHourArray = splitTimeArray[1].split(':') // contains HH, mm
        // Appending timezone to support Safari browser
        dateString = `${input}${this.getTimezoneOffSet(Number(splitDateArray[0]), Number(splitDateArray[1]) - 1, Number(splitTimeArray[0]), Number(splitHourArray[0]))}`;
      }
      // yyyy-MM-dd
      else if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
        var splitDateArray = input.split('-');
        dateString = `${input}T00:00${this.getTimezoneOffSet(Number(splitDateArray[0]), Number(splitDateArray[1]) - 1, Number(splitDateArray[2]))}`;
      }
      // yyyy-MM-ddTHH:mm [am/pm]
      else if (input.match(/^\d{4}-\d{2}-\d{2}T\d{1,2}:\d{1,2} [ap][m]$/i)) {
        const inputDate = input.split('T')[0];
        const inputTime = this.convertAMPMTimeStringTo24Time(input.split('T')[1]);
        var splitDateArray = input.split('-');  //Contains the yyyy, MM, ddTHH:mm
        var splitTimeArray = splitDateArray[2].split('T');  //contains the dd, HH:mm:ss
        var splitHourArray = splitTimeArray[1].split(':') // contains HH, mm
        dateString = `${inputDate}T${inputTime}${this.getTimezoneOffSet(Number(splitDateArray[0]), Number(splitDateArray[1]) - 1, Number(splitTimeArray[0]), Number(splitHourArray[0]))}`;
      }
      var returnDate = new Date(dateString);
      return returnDate;
    }
    if (typeof input === 'number') {
      // Custom logic for number param goes here
    }
    return new Date(input);
  }

  // Wrapper for new Date()
  getCurrentDate(): Date {
    return new Date();
  }

  // Returns client's timezone offset (eg: +05:30)
  getTimezoneOffSet(year: number, monthIndex: number, day: number, hour = 0): string {
    var date = new Date(year, monthIndex, day, hour),
      timezoneOffset = date.getTimezoneOffset(),
      hours = ('00' + Math.floor(Math.abs(timezoneOffset / 60))).slice(-2),
      minutes = ('00' + Math.abs(timezoneOffset % 60)).slice(-2),
      string = (timezoneOffset >= 0 ? '-' : '+') + hours + ':' + minutes;
    return string;
  }

  getUTCDateTimeNow() {
    var currentDate = this.getCurrentDate();
    var utcDate = currentDate.getUTCDate();
    var utcMonth = currentDate.getUTCMonth();
    var utcYear = currentDate.getUTCFullYear();
    var utcHour = currentDate.getUTCHours();
    var utcMinute = currentDate.getUTCMinutes();
    var utcSecond = currentDate.getUTCSeconds();
    var utcMilliSecond = currentDate.getUTCMilliseconds();
    return new Date(utcYear, utcMonth, utcDate, utcHour, utcMinute, utcSecond, utcMilliSecond);
  }

  /**
  * Returns formatted date and day as "Wednesday, April 17, 2019"
  * @param Date
  */
  getLocalizedDayMonthDateYear(value: Date): string {
    return `${this.getLocalizedDay(value)}, ${moment(value).format("LL")}`;
  }


  // Generate Date Time Array starts
  dateTimeArray(strt: Date, end: Date, incby, typ, isTimeRounded = false) {
    const adaytime = [];
    let incrbyhrs;
    if (typ == 'hours') {
      incrbyhrs = incby;
    } else {
      incrbyhrs = incby / 60;
    }

    const drstrt = moment(strt);
    const drend = moment(end);
    let timespan = drend.diff(drstrt, 'hours') / incrbyhrs;
    if (timespan == 0) {
      timespan = drend.diff(drstrt, 'hours', true) / incrbyhrs;
    }
    if (incrbyhrs < 1) {
      if (!isTimeRounded) {
        timespan = timespan + 1 / incrbyhrs - 1;
      } else { timespan = timespan - 1; }
    }
    for (let i = 0; i < timespan; i++) { // = has been removed to set the given end time bug number(25645)
      if (i == 0) {
        adaytime.push(
          moment(strt)
            .startOf(typ)
            .format('YYYY-MM-DDTHH:mm:ss')
        );

      } else {
        let localizedDate: any;
        strt = moment(strt)
          .startOf(typ)
          .add(incby, typ)
          .toDate();
        localizedDate = moment(strt).format('YYYY-MM-DDTHH:mm:ss');

        adaytime.push(localizedDate);
      }
    }
    return adaytime;
  }

  getMaxCurrencyLength() {
    return DEFAULT_CURRENCY_LENGTH;
  }

  getTicks(date: Date = this.getCurrentDate()) {
    let day = date.getUTCDate();
    let month = date.getUTCMonth() + 1;
    let year = date.getUTCFullYear();
    let hour = date.getUTCHours();
    let minute = date.getUTCMinutes();
    let second = date.getUTCSeconds();
    let ms = date.getUTCMilliseconds();
    console.log(day + '  ' + month + ' ' + year + ' ' + hour + ' ' + minute + ' ' + second + ' ' + ms + ' ');

    return this.getDateToTicks(year, month, day) + this.getTimeToTicks(hour, minute, second) + (ms * 10000);
  }

  convertMonthToDays(year, month) {
    var add = 0;
    var result = 0;
    if ((year % 4 == 0) && ((year % 100 != 0) || ((year % 100 == 0) && (year % 400 == 0)))) add++;

    switch (month) {
      case 0: return 0;
      case 1: result = 31; break;
      case 2: result = 59; break;
      case 3: result = 90; break;
      case 4: result = 120; break;
      case 5: result = 151; break;
      case 6: result = 181; break;
      case 7: result = 212; break;
      case 8: result = 243; break;
      case 9: result = 273; break;
      case 10: result = 304; break;
      case 11: result = 334; break;
      case 12: result = 365; break;
    }
    if (month > 1) result += add;
    return result;
  }

  getDateToTicks(year, month, day) {
    var a = (year - 1) * 365;
    var b = (year - 1) / 4;
    var c = (year - 1) / 100;
    var d = (a + b - c);
    var e = (year - 1) / 400;
    var f = d + e;
    var monthDays = this.convertMonthToDays(year, month - 1);
    var g = parseInt((f + monthDays) + day);
    var h = g - 1;
    return h * 864000000000;
  }

  getTimeToTicks(hour, minute, second) {
    return (((hour * 3600) + minute * 60) + second) * 10000000;
  }

}
