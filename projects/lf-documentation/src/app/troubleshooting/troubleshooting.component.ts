// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { MatMenuModule } from '@angular/material/menu';
import { LfUserFeedbackComponent } from '../../../../ui-components/projects';

@Component({
  selector: 'app-troubleshooting',
  templateUrl: './troubleshooting.component.html',
  styleUrls: ['./troubleshooting.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, MatMenuModule, LfUserFeedbackComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TroubleshootingComponent {
  testuserid: string = 'test-user-id';
  testaccountid: string = 'test-account-id';

  constructor() {}
}
