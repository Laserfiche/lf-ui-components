import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldMultivalueComponent } from './lf-field-multivalue.component';
import { LfFieldInfo, LfFieldValue } from '../../field-components/utils/lf-field-types';
import { FieldType } from '@laserfiche/laserfiche-ui-components/shared';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LfFieldBaseModule } from '../field-base-parts/lf-field-base/lf-field-base.module';

describe('LfFieldMultivalueComponent', () => {
  let component: LfFieldMultivalueComponent;
  let fixture: ComponentFixture<LfFieldMultivalueComponent>;

  const info: LfFieldInfo = {
    name: 'element text 1',
    id: 22,
    description: 'description',
    fieldType: FieldType.ShortInteger,
    length: 10,
    isMultiValue: true,
    isRequired: true
  };
  const values: LfFieldValue[] = ['1', '2', '3'];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LfFieldMultivalueComponent],
      imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LfFieldBaseModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldMultivalueComponent);
    component = fixture.componentInstance;
    component.multiValueFieldParentForm = new FormGroup({
      fieldArray: new FormArray([
        new FormControl('some value 1'),
        new FormControl('some value 2'),
        new FormControl('some value 3'),
        new FormControl('some value 4')])
    });
    component.lfFieldValues = values;
    component.lfFieldInfo = info;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('forceValidation should return true if all values are valid', async () => {
    expect(component.forceValidation()).toBeTrue();
  });

  it('getFieldValue should return FieldValue with cleaned up values', async () => {
    expect(component.getFieldValue()).toEqual({
      fieldName: 'element text 1',
      fieldId: 22,
      fieldType: FieldType.ShortInteger,
      values: [
        { value: '1', position: '1' },
        { value: '2', position: '2' },
        { value: '3', position: '3' }
      ]
    });
  });
});
