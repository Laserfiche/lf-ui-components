// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-troubleshooting',
  templateUrl: './troubleshooting.component.html',
  styleUrls: ['./troubleshooting.component.css', './../app.component.css']
})
export class TroubleshootingComponent {
  testuserid: string = 'test-user-id';
  testaccountid: string = 'test-account-id';

  constructor() { }

}
