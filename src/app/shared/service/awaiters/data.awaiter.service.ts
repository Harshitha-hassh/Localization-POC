import { Injectable } from "@angular/core";
import { RetailDataAwaiters } from "../../../retail/shared/events/awaiters/retail.data.awaiters";
import { MatDialog } from "@angular/material";
import { Localization } from "../../../core/localization/Localization";
import * as _ from "lodash";
import { RouteLoaderService } from 'src/app/core/services/route-loader.service';

@Injectable({
    providedIn: "root"
})
export class DataAwaiterService {
    constructor(
        private dialog: MatDialog,
        private localization: Localization,
        private routeLoaderService: RouteLoaderService
    ) {
        debugger;
        this.setAwaiters();
    }

    private setAwaiters(): void {
        debugger;
       // RetailDataAwaiters.GetChildMenu = this.getChildMenu.bind(this);
    }

    getChildMenu(url, menutype?){
       return this.routeLoaderService.GetChildMenu(url, menutype);
    }
}
