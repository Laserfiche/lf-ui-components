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
