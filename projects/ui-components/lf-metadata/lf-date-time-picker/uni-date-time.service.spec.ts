// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { UniDateTimeService } from './uni-date-time.service';

describe('DateTimeService', () => {
  let service: UniDateTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UniDateTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
