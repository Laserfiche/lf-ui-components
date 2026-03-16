// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfUserFeedbackComponent } from 'projects/ui-components/projects';

@Component({
  selector: 'app-lf-user-feedback-documentation',
  templateUrl: './lf-user-feedback-documentation.component.html',
  styleUrls: ['./lf-user-feedback-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [LfUserFeedbackComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfUserFeedbackDocumentationComponent {
  constructor() {}
}
