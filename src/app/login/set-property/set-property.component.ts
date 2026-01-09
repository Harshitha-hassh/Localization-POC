import { Component, Inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { JWT_TOKEN, USERS_SESSSIONS_INFO } from "src/app/app-constants";
import { PropertyInformationDataService } from "src/app/common/dataservices/authentication/property-information.data.service";
import { UserProperty } from "src/app/common/Models/common.models";
import { PropertyService } from "src/app/common/services/property.service";
import { RetailRoutes } from "src/app/core/extensions/retail-route";
import { RetailStandaloneLocalization } from "src/app/core/localization/retailStandalone-localization";
import { Utilities } from "src/app/core/utilities";
import { TenantManagementCommunication } from "src/app/shared/communication/services/tenantmanagement.service";
import { DialogCloseOption } from "src/app/shared/enums/constants";
import { SetPropertyBusiness } from "./set-property.business";

@Component({
  standalone: false,
  selector: "app-progress-bar",
  templateUrl: "./progress-bar.html",
  styleUrls: ["./set-property.component.scss"],
})
export class ProgressBarComponent {
  DialogCloseOptionEnum = DialogCloseOption;
  captions: any;

  constructor(
    public dialogRef: MatDialogRef<ProgressBarComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private localization: RetailStandaloneLocalization
  ) {
    this.captions = this.localization.captions;
  }

  closeDialog(res) {
    this.dialogRef.close(res);
  }
}

@Component({
  standalone: false,
  selector: "app-set-property",
  templateUrl: "./set-property.component.html",
  styleUrls: ["./set-property.component.scss"],
  providers: [SetPropertyBusiness, PropertyInformationDataService],
})
export class SetPropertyComponent implements OnInit {
  token: string;
  propertyId: number;
  userDetails: any;
  selectedPropertyDetails: any;
  propertyName: string;
  routeParam: string;
  state$: any;
  captions: any;

  constructor(
    private localization: RetailStandaloneLocalization,
    private dialog: MatDialog,
    private setPropertyBusiness: SetPropertyBusiness,
    private propertyService: PropertyService,
    private utils: Utilities,
    private router: Router,
    private route: ActivatedRoute,
    public tenantService: TenantManagementCommunication
  ) {
    const currentNavigation = this.router.getCurrentNavigation();
    const tempState = this.getTempoaryState();
    if (currentNavigation || tempState) {
      this.state$ = currentNavigation.extras.state || tempState;
      this.setTempoaryState(this.state$);
      this.token = this.state$.token;
      this.propertyId = Number(this.state$.propertyId);
      this.propertyName = this.state$.propertyName;
      this.routeParam = this.state$.routeParam || "/home";
    } else {
      this.route.queryParams.subscribe((params) => {
        this.token = params.token;
        this.propertyId = Number(params.propertyId);
        this.propertyName = params.propertyName;
        this.routeParam = params.routeParam || "/home";
      });
    }
    this.routeParam = this.routeParam.replace("/Retail","");
  }

  async ngOnInit() {
    this.captions = this.localization.captions;
    this.dialog.open(ProgressBarComponent, {
      width: "40%",
      height: "40%",
      disableClose: true,
      data: {
        propertyName: this.propertyName,
      },
    });
    if (this.token) {
      this.userDetails = await this.setPropertyBusiness.GetLoginDetailsByToken(
        this.token
      );
    } else {
      this.userDetails = this.GetUserSessionsInfo();
    }
    sessionStorage.setItem(JWT_TOKEN, this.userDetails.token);
    localStorage.setItem(JWT_TOKEN, this.userDetails.token);
    const propertyDetails: UserProperty = this.userDetails.userProperties.find(
      (item) => item.propertyId === this.propertyId
    );
    this.selectedPropertyDetails = {
      id: propertyDetails.propertyCode,
      name: propertyDetails.propertyName,
    };
    this.propertyService.SetUserInfo(this.userDetails);
    let usersessionId = "";
    if (propertyDetails.sessionId !== null) {
      usersessionId = propertyDetails.sessionId;
    } else {
      const utcDate: Date = this.localization.getUTCDateTimeNow();
      const token = sessionStorage.getItem("_jwt");
      let sessionData = {
        id: 0,
        userId: Number(propertyDetails["userId"]),
        startTime: this.localization.ConvertDateToISODateTime(utcDate),
        propertyId: Number(propertyDetails["propertyId"]),
        productId: Number(propertyDetails["productId"]),
        timeZone: this.utils.GetClientTimeZone(),
        token: token,
      };

      let response = await this.CreateSession(sessionData);
      usersessionId = response;
    }

    await this.propertyService.UpdateUserSessionInfo(
      this.selectedPropertyDetails,
      this.userDetails,
      usersessionId
    );
    this.propertyService.changeTitle();
    setTimeout(() => {
      this.dialog.closeAll();
      this.router.navigate([this.routeParam], {
        state: { applyFilter: true },
      });
    }, 5000);
  }

  private setTempoaryState(value) {
    localStorage.setItem("tempState", JSON.stringify(value));
    sessionStorage.setItem("tempState", JSON.stringify(value));
  }

  private getTempoaryState() {
    const tempState = sessionStorage.getItem("tempState");
    if (tempState) {
      return JSON.parse(tempState);
    }
    return null;
  }

  public GetUserSessionsInfo(): any {
    let userSessions: any;
    const sessionDetails = this.getUserSessionsInfoItem(USERS_SESSSIONS_INFO);
    if (sessionDetails) {
      userSessions = JSON.parse(sessionDetails);
    }
    return userSessions;
  }

  private getUserSessionsInfoItem(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  async CreateSession(sessionData) {
    const serviceParams = {
      route: RetailRoutes.CreateSession,
      uriParams: "",
      header: "",
      body: sessionData,
      showError: true,
      baseResponse: true,
    };
    return await this.tenantService.postPromise<string>(serviceParams);
  }
}
