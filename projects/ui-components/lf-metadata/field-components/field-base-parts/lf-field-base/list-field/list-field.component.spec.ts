import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListFieldComponent } from './list-field.component';

import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LfFieldInfo } from '../../../utils/lf-field-types';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ListFieldComponent', () => {
  let component: ListFieldComponent;
  let fixture: ComponentFixture<ListFieldComponent>;

  const listInfo: LfFieldInfo = {
    name: 'List Name',
    id: 1,
    description: 'List Description',
    fieldType: FieldType.List,
    isRequired: true,
    displayName: 'List Name'
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListFieldComponent ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  }));

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
});
