import { MsGraphRoutes } from 'src/app/core/extensions/retail-route';
import { HttpMethod } from './http.model';

export interface GraphServiceParams {
    route: MsGraphRoutes | string;
    forceLogin?: boolean;
    isBeta?: boolean;
    version?: string;
    uriParams?: any;
    header?: any;
    body?: any;
    showError?: boolean;
}

export interface GraphUser {
    id?: string;
    userPrincipalName?: string;
    displayName?: string;
    mail?: string;
    accessToken?: string;
}

export interface SendEmailRequest {
    message: MailMessage;
    // saveToSentItems?: boolean
}

export interface MailMessage {
    subject: string;
    toRecipients: MailContact[];
    ccRecipients?: MailContact[];
    importance?: MailImportance;
    body?: MailBody;
    attachments?: MailAttachment[];
}

export interface MailBody {
    contentType: string;
    content: string;
}

export interface MailContact {
    emailAddress: EmailAddress;
}

export interface EmailAddress {
    address: string;
    name?: string;
}

export interface MailAttachment {
    '@odata.type'?: string;
    name: string;
    contentType: MimeType;
    contentBytes: any;
}

export enum MailImportance {
    LOW = 'Low',
    NORMAL = 'Normal',
    HIGH = 'High'
}

export enum MimeType {
    BIN = 'application/octet-stream',
    BMP = 'image/bmp',
    CSV = 'text/csv',
    DOC = 'application/msword',
    DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    GIF = 'image/gif',
    HTM = 'text/html',
    ICS = 'text/calendar',
    JPEG = 'image/jpeg',
    JSON = 'application/json',
    PNG = 'image/png',
    PDF = 'application/pdf',
    TXT = 'text/plain',
    ZIP = 'application/zip'
}
// Add the microsoft data types to the collection as you try to use them in application one by one
export enum ODataTypes {
    FILEATTACHMENT = '#microsoft.graph.fileAttachment'
}

export interface BatchRequest {
    requests: SNCGraphRequest[];
}

export interface SNCGraphRequest {
    id: string;
    method: HttpMethod;
    url: string;
    body?: any;
    headers: any;
}

export interface CalendarEvent {
    subject: string;
    body: MailBody;
    start: DateTimeTimeZone;
    end: DateTimeTimeZone;
    location?: Location;
    attendees?: Attendee[];
    isAllDay: boolean;
}

export interface DateTimeTimeZone {
    dateTime: string;
    timeZone: string;
}
export interface Location {
    // address: {@odata.type: microsoft.graph.physicalAddress};
    // coordinates: {@odata.type: microsoft.graph.outlookGeoCoordinates};
    displayName?: string;
    locationEmailAddress?: string;
    locationUri?: string;
    locationType?: string;
    uniqueId?: string;
    uniqueIdType?: string;
}

export interface Attendee {
    // status: {@odata.type: microsoft.graph.responseStatus};
    type: string;
    emailAddress: EmailAddress;
}

export interface SyncOutlookContact{
    contactId:number,
    outlookContactInfo:OutlookContact
}

export interface OutlookContact{
    id?: string;
    createdDateTime?: string;
    lastModifiedDateTime?: string;
    changeKey?: string;
    birthday: string;
    displayName?: string;
    givenName: string;
    initials?: string;
    middleName: string;
    nickName?: string;
    surname: string;
    title: string;    
    emailAddresses?: EmailAddress[]
    jobTitle: string;
    companyName: string;
    department?: string;
    businessPhones?: string[];
    homeAddress?: Address;
    businessAddress: Address|{};
    otherAddress?: Address;
    homePhones?: string[],
    mobilePhone?: string,
   
}

export interface Address{
    street: string;
    city: string;
    state: string;
    postalCode: string;
    countryOrRegion: string;
}

export enum HttpStatus{
    Updated=200,
    Created = 201,
    Ok=200,
    Deleted = 204,
    NotFound = 404,
    SyncStateNotFound=410
}