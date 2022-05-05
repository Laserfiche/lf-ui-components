import { Component, OnInit } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { ValidationRule } from '@laserfiche/lf-ui-components/shared';
import { Observable } from 'rxjs';

@Component({
  selector: 'lf-list-field-component',
  templateUrl: './list-field.component.html',
  styleUrls: ['./list-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: ListFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class ListFieldComponent extends BaseFieldDirective implements OnInit {
  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    return undefined;
  }

  serializeFieldFormControlValue(): string {
    return this.getLfFieldFormControlValue(); // TODO: undo locale stuff before saving
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value ?? ''; // TODO: get locale and do stuff
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  protected override fieldOnValueChanged(): void {
    const currentValue = this.lf_field_form_control.value;
    this.lf_field_form_control.setValue(currentValue ?? '');
  }
}
