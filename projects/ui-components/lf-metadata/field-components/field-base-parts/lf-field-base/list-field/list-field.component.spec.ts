// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFieldComponent } from './list-field.component';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo, TemplateFieldInfo } from '../../../utils/lf-field-types';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';

describe('ListFieldComponent', () => {
  let component: ListFieldComponent;
  let fixture: ComponentFixture<ListFieldComponent>;

  const listInfo: LfFieldInfo = {
    name: 'List Name',
    id: 1,
    description: 'List Description',
    fieldType: FieldType.List,
    isRequired: true,
    displayName: 'List Name',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ListFieldComponent,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListFieldComponent);
    component = fixture.componentInstance;
    component.lf_field_info = listInfo;
    component.lf_field_form_control = new FormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function getRenderedOptionValues(): string[] {
    const matSelect = fixture.debugElement.query(By.directive(MatSelect)).componentInstance as MatSelect;
    return matSelect.options.toArray()
      .map((o) => o.value)
      .filter((v) => v !== undefined && v !== null);
  }

  describe('list-field dropdown options', () => {
    it('shows static listValues for a non-dynamic list field', () => {
      component.lf_field_info = { ...listInfo, listValues: ['Option A', 'Option B'] };
      fixture.detectChanges();

      expect(getRenderedOptionValues()).toEqual(['Option A', 'Option B']);
    });

    it('shows dynamic options for a dynamic list field', () => {
      const dynamicField: TemplateFieldInfo = {
        ...listInfo,
        listValues: ['Static A', 'Static B'],
        rule: { ancestors: [] },
      };
      component.lf_field_info = dynamicField;
      component.dynamic_field_value_options = ['Dynamic X', 'Dynamic Y'];
      fixture.detectChanges();

      expect(getRenderedOptionValues()).toEqual(['Dynamic X', 'Dynamic Y']);
    });

    it('does not show static listValues when the field is dynamic', () => {
      const dynamicField: TemplateFieldInfo = {
        ...listInfo,
        listValues: ['Static A', 'Static B'],
        rule: { ancestors: [] },
      };
      component.lf_field_info = dynamicField;
      component.dynamic_field_value_options = ['Dynamic X', 'Dynamic Y'];
      fixture.detectChanges();

      const texts = getRenderedOptionValues();
      expect(texts).not.toContain('Static A');
      expect(texts).not.toContain('Static B');
    });
  });
});
