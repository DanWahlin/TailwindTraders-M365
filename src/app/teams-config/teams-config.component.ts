import { Component, OnInit } from '@angular/core';
import * as microsoftTeams from '@microsoft/teams-js';

@Component({
  selector: 'cm-teams-config',
  templateUrl: './teams-config.component.html',
  styleUrls: ['./teams-config.component.css']
})
export class TeamsConfigComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    microsoftTeams.settings.registerOnSaveHandler((saveEvent) => {

      const tabUrl = window.location.protocol + '//' + window.location.host + '/ssoDemo';

      // Let the Microsoft Teams platform know what you want to load based on
      // what the user configured on this page
      microsoftTeams.settings.setSettings({
          contentUrl: tabUrl, // Mandatory parameter
          entityId: tabUrl    // Mandatory parameter
      });

      // Tells Microsoft Teams platform that we are done saving our settings. Microsoft Teams waits
      // for the app to call this API before it dismisses the dialog. If the wait times out, you will
      // see an error indicating that the configuration settings could not be saved.
      saveEvent.notifySuccess();
  });

  microsoftTeams.settings.setValidityState(true);
  }

}
