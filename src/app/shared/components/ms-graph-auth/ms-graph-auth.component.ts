import { Component, OnInit } from '@angular/core';
import { MsGraphApiCommunication } from '../../communication/services/ms-graph.service';

@Component({
  selector: 'app-ms-graph-auth',
  templateUrl: './ms-graph-auth.component.html',
  styleUrls: ['./ms-graph-auth.component.scss'],
  providers: [MsGraphApiCommunication]
})
export class MsGraphAuthComponent implements OnInit {
  authenticated: boolean;
  loggedInAsToolTip = '';
  gClient: MsGraphApiCommunication;

  constructor(private graphClient: MsGraphApiCommunication) {
    this.gClient = this.graphClient;
  }

  ngOnInit() {
    this.isAuthenticated();
    this.gClient.currentUser.subscribe(userName => this.loggedInAsToolTip = userName);
  }

  isAuthenticated() {
    this.gClient.isAuthenticated().then(result => {
      if (result !== undefined) {
        this.authenticated = result;
      } else {
        this.authenticated = false;
      }
    });
  }

  async signInSignOut(): Promise<void> {
    if (this.authenticated) {
      this.authenticated = await this.gClient.signOutOfGraph();
    } else {
      this.authenticated = await this.gClient.signInToGraph();
    }
  }

}
