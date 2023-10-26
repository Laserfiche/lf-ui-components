// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ExampleUsageBasicStepsDirective } from './example-usage-basic-steps.directive';

describe('ExampleUsageBasicStepsDirective', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleUsageBasicStepsDirective],
      providers: [RouterTestingModule]
    })
      .compileComponents();
  }));
});
