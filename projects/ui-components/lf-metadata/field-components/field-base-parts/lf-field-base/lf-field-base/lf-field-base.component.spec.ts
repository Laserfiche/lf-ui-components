// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfTokenService } from '../../lf-token-picker/lf-token.service';
import { LfFieldBaseComponent } from './lf-field-base.component';
import { FormControl, FormGroup } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';

describe('LfFieldBaseComponent', () => {
  let component: LfFieldBaseComponent;
  let fixture: ComponentFixture<LfFieldBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LfFieldBaseComponent],
      providers: [LfTokenService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldBaseComponent);
    component = fixture.componentInstance;
    // Provide a mock LfFieldInfo since it's a required input
    const mockFieldInfo: LfFieldInfo = {
      name: 'test-field',
      id: 1,
      displayName: 'Test Field',
      fieldType: FieldType.String,
      length: 100,
      isRequired: false,
      isMultiValue: false,
    };
    component.lfFieldInfo = mockFieldInfo;
    // Also provide mock FormControl and parentForm
    component.lfFieldFormControl = new FormControl('');
    component.parentForm = new FormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
