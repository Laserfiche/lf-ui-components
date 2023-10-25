// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { LfUserFeedbackService } from './lf-user-feedback.service';

describe('LfUserFeedbackService', () => {
  let service: LfUserFeedbackService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfUserFeedbackService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
