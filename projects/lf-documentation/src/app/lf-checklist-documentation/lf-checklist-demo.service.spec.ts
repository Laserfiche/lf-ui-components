// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';

import { LfChecklistDemoService } from './lf-checklist-demo.service';

describe('LfChecklistDemoService', () => {
  let service: LfChecklistDemoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfChecklistDemoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
