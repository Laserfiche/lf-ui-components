import { waitForAsync, TestBed } from '@angular/core/testing';
import { LfFieldTokenService } from '../lf-field-token.service';

import { BaseFieldDirective } from './base-field.directive';

describe('BaseField', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BaseFieldDirective],
      providers: [LfFieldTokenService]
    })
      .compileComponents();
  }));
});
