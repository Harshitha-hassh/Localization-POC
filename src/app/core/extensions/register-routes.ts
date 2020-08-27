import { RetailRoutes, RetailApiHosts, MsalConfiguration } from './retail-route';

declare let $: any;
declare global {

    export const RetailApiHost: typeof RetailApiHosts;
    export const RetailApiRoute: typeof RetailRoutes;
    export const RetailMenus: typeof Array;
    export const MsalConfig: MsalConfiguration;
    export interface Window {
        RetailApiHost: typeof RetailApiHosts;
        RetailApiRoute: typeof RetailRoutes;
        RetailMenus: typeof Array;
        MsalConfig: MsalConfiguration;
    }

}

function loadHosts(): typeof RetailApiHosts {
    let apiHosts: typeof RetailApiHosts;
    apiHosts = readHosts();
    return apiHosts;
}

function readHosts() {
    let apiHosts: typeof RetailApiHosts;
    const RetailHostUrl = '../../../assets/json/hosts/retail-hosts.json';
    const hostLoadErrMsg = 'Error in loading retail-hosts.json - ' + RetailHostUrl;
    $.ajax({
        url: RetailHostUrl,
        async: false,
        success(result) {
            try {
                if (typeof result == 'object') {
                    apiHosts = result.RetailApiHosts;
                } else {
                    console.error(hostLoadErrMsg);
                }
            } catch (e) { console.error(hostLoadErrMsg); }
        },
        error(err) {
            console.error(hostLoadErrMsg + ' Exception: ' + err)
                ;
        }
    });
    return apiHosts;
}
function readMsalConfig() {
    let msalConfig: MsalConfiguration;
    const RetailHostUrl = '../../../assets/json/hosts/retail-hosts.json';
    const hostLoadErrMsg = 'Error in loading retail-hosts.json - ' + RetailHostUrl;
    $.ajax({
        url: RetailHostUrl,
        async: false,
        success(result) {
            try {
                if (typeof result == 'object') {
                    msalConfig = result.MsalConfiguration;
                } else {
                    console.error(hostLoadErrMsg);
                }
            } catch (e) { console.error(hostLoadErrMsg); }
        },
        error(error) {
            console.error(hostLoadErrMsg + ' Exception: ' + error);
        }
    });
    return msalConfig;
}
function readMenus() {
    let menus;
    const menuUrl = '../../../assets/json/menu.json';

    $.ajax({
        url: menuUrl,
        async: false,
        success(response) {
            menus = response.result;
        },
        error(error) {
            console.error(' Exception: ' + error)
                ;
        }
    });
    return menus;
}
function loadMsalConfig() {
    let msalConfig: MsalConfiguration;
    msalConfig = readMsalConfig();
    return msalConfig;
}
/* Register Routes and API */
Window.prototype.RetailApiHost = loadHosts();
Window.prototype.RetailApiRoute = RetailRoutes;
Window.prototype.RetailMenus = readMenus();
Window.prototype.MsalConfig = loadMsalConfig();
