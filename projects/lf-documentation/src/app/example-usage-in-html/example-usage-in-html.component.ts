// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component } from '@angular/core';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';

@Component({
  selector: 'app-example-usage-in-html',
  templateUrl: './example-usage-in-html.component.html',
  styleUrls: ['./example-usage-in-html.component.css', '../app.component.css']
})
export class ExampleUsageInHtmlComponent extends ExampleUsageBasicStepsDirective { }
