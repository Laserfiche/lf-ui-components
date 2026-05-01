// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { ExampleUsageBasicStepsDirective } from './example-usage-basic-steps.directive';

describe('ExampleUsageBasicStepsDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleUsageBasicStepsDirective],
    }).compileComponents();
  });

  it('should create', () => {
    expect(ExampleUsageBasicStepsDirective).toBeTruthy();
  });
});
