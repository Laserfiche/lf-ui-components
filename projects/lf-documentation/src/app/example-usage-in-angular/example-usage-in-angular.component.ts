// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component } from '@angular/core';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';

@Component({
  selector: 'app-example-usage-in-angular',
  templateUrl: './example-usage-in-angular.component.html',
  styleUrls: ['./example-usage-in-angular.component.css', '../app.component.css']
})
export class ExampleUsageInAngularComponent extends ExampleUsageBasicStepsDirective { }
