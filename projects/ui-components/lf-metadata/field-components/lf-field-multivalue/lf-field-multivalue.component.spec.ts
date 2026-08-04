// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldMultivalueComponent } from './lf-field-multivalue.component';
import { LfFieldInfo, LfFieldValue } from '../../field-components/utils/lf-field-types';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LfFieldBaseComponent } from '../field-base-parts/lf-field-base/lf-field-base/lf-field-base.component';

describe('LfFieldMultivalueComponent', () => {
  let component: LfFieldMultivalueComponent;
  let fixture: ComponentFixture<LfFieldMultivalueComponent>;

  let dateTimeComponent: LfFieldMultivalueComponent;
  let dateTimeFixture: ComponentFixture<LfFieldMultivalueComponent>;

  const info: LfFieldInfo = {
    name: 'element text 1',
    id: 22,
    description: 'description',
    fieldType: FieldType.ShortInteger,
    length: 10,
    isMultiValue: true,
    isRequired: true,
    displayName: 'element text 1',
  };
  const values: LfFieldValue[] = ['1', '2', '3'];

  const dateTimeInfo: LfFieldInfo = {
    name: 'DateTime Multi',
    id: 99,
    fieldType: FieldType.DateTime,
    isMultiValue: true,
    displayName: 'DateTime Multi',
  };

  function getRowInput(dtFixture: ComponentFixture<LfFieldMultivalueComponent>, rowIndex: number): HTMLInputElement {
    const rows: NodeListOf<HTMLElement> = dtFixture.nativeElement.querySelectorAll('.single-field-container');
    return rows[rowIndex].querySelector('.flatpickr-input') as HTMLInputElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LfFieldMultivalueComponent,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LfFieldBaseComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldMultivalueComponent);
    component = fixture.componentInstance;
    component.multiValueFieldParentForm = new FormGroup({
      fieldArray: new FormArray([
        new FormControl('some value 1'),
        new FormControl('some value 2'),
        new FormControl('some value 3'),
        new FormControl('some value 4'),
      ]),
    });
    component.lfFieldValues = values;
    component.lfFieldInfo = info;
    fixture.detectChanges();
  });

  beforeEach(async () => {
    dateTimeFixture = TestBed.createComponent(LfFieldMultivalueComponent);
    dateTimeComponent = dateTimeFixture.componentInstance;
    await dateTimeComponent.initAsync(dateTimeInfo, []);
    dateTimeFixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forceValidation should return true if all values are valid', async () => {
    expect(component.forceValidation()).toBe(true);
  });

  it('getFieldValue should return FieldValue with cleaned up values', async () => {
    expect(component.getFieldValue()).toEqual({
      fieldName: 'element text 1',
      fieldId: 22,
      fieldType: FieldType.ShortInteger,
      values: [
        { value: '1', position: '1' },
        { value: '2', position: '2' },
        { value: '3', position: '3' },
      ],
    });
  });

  it('should leave the newly-added row blank after committing a value in the previous row (DateTime multi-value)', async () => {
    const row0Input = getRowInput(dateTimeFixture, 0);
    row0Input.focus();
    dateTimeFixture.detectChanges();

    row0Input.value = '1/1/2024 10:00:00 AM';
    row0Input.dispatchEvent(new Event('input', { bubbles: true }));
    row0Input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, composed: true })
    );
    dateTimeFixture.detectChanges();

    row0Input.blur();
    dateTimeFixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
    dateTimeFixture.detectChanges();

    expect(dateTimeComponent.lfFieldValues).toEqual(['2024-01-01T10:00:00', '']);
    expect(getRowInput(dateTimeFixture, 0).value).toBe('1/1/2024 10:00:00 AM');
    expect(getRowInput(dateTimeFixture, 1).value).toBe('');
  });
});
