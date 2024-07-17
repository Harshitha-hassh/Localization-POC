

export const SNC = 'SALES&CATERING';
export const RETAIL = 'RETAIL';
export const GOLF = 'GOLF';
export const COMPRESSION_LIMIT = 500;

export const BATCH_BEO = 0;
export const BATCH_BEO_CHECK = 1;
export const SINGLE_BEO = 2;
export const SINGLE_BEO_CHECK = 3;

// ALLOWED_IMAGE_SIZE is the max file size allowed.
// Size in MB
export const ALLOWED_IMAGE_SIZE = 2;
export const CODE_MAXLENGTH = 8;
export const FUNCTIONROOMSETUP_CODE_MAXLENGTH = 8;
export const CODE_MINLENGTH = 1;
export const NAME_MAXLENGTH = 50;
export const FUNCTIONROOMSETUP_NAME_MAXLENGTH = 50;
export const NAME_MINLENGTH = 1;
export const POLICY_MINLENGTH = 2;
export const POLICY_MAXLENGTH = 255;
export const FIRSTNAME_MAXLENGTH = 25;
export const FIRSTNAME_MINLENGTH = 2;
export const LASTNAME_MAXLENGTH = 25;
export const LASTNAME_MINLENGTH = 2;
export const TITLE_MAXLENGTH = 25;
export const TITLE_MINLENGTH = 2;
export const LISTORDER_MAXLENGTH = 5;
export const LISTORDER_MAXVALUE = 99999;
/**
 * Text length to start the API search
 */
export const SEARCH_TEXT_LENGTH = 1;

export const ALLOWED_URL: Array<any> = [false, 'report'];

// Contact Module Constants

export const SEARCH_TEXT_MAXLENGTH = 100;
export const INPUT_MAXLENGTH = 50;
export const INPUT_MINLENGTH = 2;
export const PAGERNUMBER_MAXLENGHTH = 20;
export const POSTALCODE_MAXLENGTH = 10;
export const TITLEOFSALESCALL_MAXLENGTH = 255;
export const COMMENTS_MAXLENGTH = 500;
export const BOOKING_COMMENTS_MINLENGTH = 3;
export const BOOKING_COMMENTS_MAXLENGTH = 500;
export const BOOKING_CONTACTS_SEARCH_MINLENGTH = 1;
export const BOOKING_CONTACTS_SEARCH_MAXLENGTH = 50;
export const ACCOUNT_NUMBER_MAXLENGTH = 20;
export const ACCOUNT_NUMBER_MINLENGTH = 3;
export const ACCOUNT_NAME_MINLENGTH = 3;
export const ACCOUNT_NAME_MAXLENGTH = 100;
export const WEBSITE_MAXLENGTH = 200;
export const PHONE_LENGTH = 10;

// Competitor Module Constants
export const COMPETITOR_DESTINATION_CODE_MAX_LENGTH = 20;
export const COMPETITOR_DESTINATION_NAME_MAX_LENGTH = 50;
export const COMPETITOR_NUMBER_OF_ROOMS_MAX_LENGTH = 12;
export const COMPETITOR_MEETING_SPACE_MAX_LENGTH = 12;
export const COMPETITOR_EXHIBIT_SPACE_MAX_LENGTH = 12;
export const COMPETITOR_COMMENTS_MAX_LENGTH = 500;
export const COMPETITOR_SEARCH_TEXT_LENGTH = 1;
export const COMPETITOR_MANAGE_SEARCH_TEXT_MAXLENGTH = 50;

// /Block Room
export const RATE_TEXT_MAXLENGTH = 12;

// Account Module Constants
export const ACCOUNT_SEARCH_TEXT_MAXLENGTH = 50;

// Function room group constants
export const FUNCTIONROOMGROUP_CODE_MINLENGTH = 1;
export const FUNCTIONROOMGROUP_CODE_MAXLENGTH = 8;
export const FUNCTIONROOMGROUP_NAME_MINLENGTH = 1;
export const FUNCTIONROOMGROUP_NAME_MAXLENGTH = 12;
// setTings Module Constants

export const SETTINGS_SEARCH_TEXT_MAXLENGTH = 30;



// Holiday/Hot date constants
export const HOLIDAY_CODE_MINLENGTH = 3;
export const HOLIDAY_CODE_MAXLENGTH = 8;
export const HOLIDAY_NAME_MINLENGTH = 3;
export const HOLIDAY_NAME_MAXLENGTH = 50;
export const HOLIDAY_NUMBER_OF_NIGHTS_MAXLENGTH = 3;

// Booking Info Constants
export const BOOKINGINFO_MEETING_NAME_MAXLENGTH = 155;
export const BOOKINGINFO_MEETING_NAME_MINLENGTH = 3;
export const BOOKINGINFO_BOOKINGID_MAXLENGTH = 15;
export const BOOKINGINFO_BOOKINGID_MINLENGTH = 3;

// menu constants
export const MENU_ITEM_NAME_MIN_LENGTH = 3;
export const MENU_ITEM_CODE_MAX_LENGTH = 8;
export const MENU_ITEM_DECIMAL_MAXLENGTH = 15;
export const QUANTITY_MAXVALUE = 999999999999999;

export const MAX_LENGTH_5 = 5;
export const MAX_LENGTH_10 = 10;
export const MAX_LENGTH_12 = 12;
export const MAX_LENGTH_25 = 25;
export const MAX_LENGTH_50 = 50;
export const MAX_LENGTH_100 = 100;
export const MAX_LENGTH_10000000 = 10000000;
export const MIN_LENGTH_0 = 0;
export const MIN_LENGTH_1 = 1;
export const LENGTH_3 = 3;
export const LENGTH_50 = 50;
export const LENGTH_DEC_100 = 100;

export const SELECT_DEFAULT_VALUE = 0;

// Function Type Constants
export const FUNCTION_TYPE_CODE_MAXLENGTH = 8;
export const FUNCTION_TYPE_CODE_MINLENGTH = 1;
export const FUNCTION_TYPE_NAME_MINLENGTH = 1;
export const FUNCTION_TYPE_NAME_MAXLENGTH = 50;
export const FUNCTION_TYPE_DECIMAL_MAXLENGTH = 10;

// comment template constants
export const COMMENT_TEMPLATE_CODE_MAXLENGTH = 8;
export const COMMENT_TEMPLATE_CODE_MINLENGTH = 1;
export const COMMENT_TEMPLATE_LISTORDER_MAXLENGTH = 5;
export const COMMENT_TEMPLATE_LISTORDER_MINLENGTH = 1;
export const COMMENT_TEMPLATE_COMMENTS_MAXLENGTH = 500;

// Function Room Setup
export const FUNCTION_ROOM_SETUP_MAX_OCCUPANCY = 1000;

// Sleeping Room Constants
export const SLEEPING_ROOM_CODE_MAXLENGTH = 8;
export const SLEEPING_ROOM_CODE_MINLENGTH = 1;
export const SLEEPING_ROOM_NAME_MINLENGTH = 1;
export const SLEEPING_ROOM_NAME_MAXLENGTH = 50;
export const SLEEPING_ROOM_NAME_ROOMLENGTH = 1000;

export enum ErrorCodes {
    // Contacts Screen
    CONTACT_LINKED_TO_SALESCALL = 411720,
    PRIMARY_CONTACT_CANNOT_BE_DELETED = 411719,

    // Accountcombine && Merge Screen
    TO_ACCOUNT_FROM_ACCOUNT_CANNOT_BE_SAME = 422217,
    TO_CONTACT_FROM_CONTACT_CANNOT_BE_SAME = 411733,
    PRIMARY_CONTACT_CANNOT_BE_MERGED = 411732

}

export enum YearTypes {
    AllYear = 'ALL YEARS',
    ThisYear = 'THIS YEAR',
    LastYear = 'LAST YEAR'
}


// Letter Setup Constants
export const LETTER_CODE_MINLENGTH = 1;
export const LETTER_CODE_MAXLENGTH = 8;
export const LETTER_NAME_MINLENGTH = 1;
export const LETTER_NAME_MAXLENGTH = 50;

// Task Setup Constants
export const TASK_CODE_MINLENGTH = 3;
export const TASK_CODE_MAXLENGTH = 8;
export const TASK_NAME_MINLENGTH = 3;
export const TASK_NAME_MAXLENGTH = 50;
export const TASK_OFFSET_MINLENGTH = 1;
export const TASK_OFFSET_MAXLENGTH = 3;
export const TASK_OFFSET_MINVALUE = -999;
export const TASK_OFFSET_MAXVALUE = 999;
export const TASK_LISTORDER_MINLENGTH = 1;
export const TASK_LISTORDER_MAXLENGTH = 8;

// Task Integration Constants

export const TASK_DESC_MAXLENGTH = 500;
export const NOTES_DESC_MAXLENGTH = 500;
export const COMPLETE_ERR_CODE = 442217;
export const UPDATE_ERR_CODE = 442216;
export const DELETE_ERR_CODE = 442215;

// ITEM SETUP CONSTANTS

export const ITEM_SETUP_CODE_MINLENGTH = 1;
export const ITEM_SETUP_CODE_MAXLENGTH = 8;
export const ITEM_SETUP_ITEMNAME_MINLENGTH = 1;
export const ITEM_SETUP_ITEMNAME_MAXLENGTH = 50;
export const ITEM_SETUP_LISTORDER_MAXLENGTH = 5;
export const ITEM_SETUP_CATEGORY_MAXLENGTH = 50;
export const ITEM_SETUP_LOCATION_MAXLENGTH = 50;
export const ITEM_SETUP_QUANTITY_MAXLENGTH = 15;
export const ITEM_SETUP_PRICE_DECIMAL_MAXLENGTH = 12;
export const ITEM_SETUP_COST_DECIMAL_MAXLENGTH = 12;
export const ITEM_SETUP_GRATUITY_DECIMAL_MAXLENGTH = 3;
export const ITEM_SETUP_SERVICECHARGE_DECIMAL_MAXLENGTH = 3;
export const ITEM_SETUP_REPORTBEO_MAXLENGTH = 255;
export const ITEM_SETUP_COMMENTS_MAXLENGTH = 255;

// VENDOR AND ROOM TYPES
export const ITEM_SETUP_VENDORNAME_MAXLENGTH = 50;
export const ITEM_SETUP_POSTAL_MAXLENGTH = 10;
export const ITEM_SETUP_CITY_MAXLENGTH = 50;
export const ITEM_SETUP_STATE_MAXLENGTH = 50;
export const ITEM_SETUP_COUNTRY_MAXLENGTH = 50;

// ACCOUNT INQUIRY NUMBER OF NIGHTS
export const NUMBER_OF_NIGHTS_MAXLENGTH = 3;

// export const MENU_ITEM_CODE_MAX_LENGTH = 8;


// Function Room Template Validation Constants
export const FUNCTION_COMPONENT_CODE_MAX_LENGTH = 8;
export const FUNCTION_COMPONENT_NAME_MAX_LENGTH = 50;
export const FUNCTION_NAME_MAX_LENGTH = 50;


// search debounce

export const SEARCH_DEBOUNCE_TIME = 500;

// BEO Template

export const BEO_TEMPLATE_NUMBER_MINLENGTH = 1;
export const BEO_TEMPLATE_NUMBER_MAXLENGTH = 8;
export const BEO_TEMPLATE_NAME_MINLENGTH = 1;
export const BEO_TEMPLATE_NAME_MAXLENGTH = 50;
export const BEO_TEMPLATE_LISTORDER_MAXLENGTH = 5;

// Revenue setup
export const PERCENTAGE_MAXVALUE = 100;
export const PERCENTAGE_MAXLENGTH = 3;
// Budget
export const BUDGET_DECIMAL_MAXLENGTH = 12;
export const BUDGET_NUMBER_MAXVALUE = 1000;

// Bookings-BEO Search list

export const BEO_NUMBER_MINLENGTH = 1;
export const BEO_NUMBER_MAXLENGTH = 10;
export const MEETING_NAME_MINLENGTH = 1;
export const MEETING_NAME_MAXLENGTH = 50;
export const BEO_ACCOUNT_NAME_MINLENGTH = 1;
export const BEO_ACCOUNT_NAME_MAXLENGTH = 50;
export const CONTACT_NAME_MINLENGTH = 1;
export const CONTACT_NAME_MAXLENGTH = 50;
export const SEARCH_ACCOUNT_MAXLENGTH = 25;


// Booking - Room Block
export const MIN_NUMBER_OF_NIGHTS = 1;
export const MAX_NUMBER_OF_NIGHTS = 365;
export const MIN_NUMBER_OF_ROOMS = 0;
export const MAX_NUMBER_OF_ROOMS = 1000;


//booking function 

export const BOOKING_FUNCTION_NAME_MAX_LENGTH = 100;

//UserDefinedField

export const USERDEFINEDFIELD_LISTORDER_ERRORCODE = 442213;
export const USERDEFINEDFIELD_LISTORDER_LIMIT_ERRORCODE = 442214;

//UserDefinedField Vaildators
export const USERDEFINEDFIELD_LISTORDER_MINVALUE= 1;
export const USERDEFINEDFIELD_LISTORDER_MAXVALUE= 99999;
export const USERDEFINEDFIELD_LABELFEILD_MINLENGTH= 1;
export const USERDEFINEDFIELD_LABELFEILD_MAXLENGTH= 100;
export const USERDEFINEDFIELD_TEXTFEILD_MINLENGTH= 1;
export const USERDEFINEDFIELD_TEXTFEILD_MAXLENGTH= 100;
export const USERDEFINEDFIELD_COMMENTFEILD_MINLENGTH= 1;
export const USERDEFINEDFIELD_COMMENTFEILD_MAXLENGTH= 500;
export const USERDEFINEDFIELD_DDFEILD_MINLENGTH= 1;
export const USERDEFINEDFIELD_DDFEILD_MAXLENGTH= 100;

//discount
export const PRICE_MAXVALUE = 999999999999;

//booking wash %
export const WASH_MAXVALUE = 100;
export const WASH_MINVALUE = 0;
export const BEO_SEARCH_MAX_LENGTH = 120

export enum DialogCloseOption {
    Success = 1,
    Cancel,
    Close
  }
export const defaultThemeColorSwitch = 'THEME_COLOR';