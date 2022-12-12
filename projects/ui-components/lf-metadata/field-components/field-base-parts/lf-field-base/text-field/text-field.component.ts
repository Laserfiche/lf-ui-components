import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BaseFieldDirective } from '../base-field/base-field.directive';
import { ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { LfFieldTokenService } from '../lf-field-token.service';
import { AppLocalizationService, ValidationRule } from './../../../../../shared/lf-shared-public-api';
import { Observable } from 'rxjs';

@Component({
  selector: 'lf-text-field-component',
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.css', './../lf-field-base/lf-field-base.component.css'],
  providers: [
    { provide: BaseFieldDirective, useExisting: TextFieldComponent },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
  ]
})
export class TextFieldComponent extends BaseFieldDirective implements OnInit {
  getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined {
    return undefined;
  }

  focusState: boolean | undefined;
  get isShortField(): boolean {
    return (!this.lf_field_info.length || this.lf_field_info.length <= 40);
  }

  constructor(
    public tokenService: LfFieldTokenService,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService) {
    super(tokenService, ref, localizationService);
  }

  serializeFieldFormControlValue(): string {
    return this.getLfFieldFormControlValue()?.trim();
  }

  deserializeLfFieldValue(): string {
    return this.lf_field_value?.trim() ?? '';
  }

  getAdditionalValidatorsForFieldType(): ValidatorFn[] {
    return [];
  }

  createNewFieldValueWithToken(token: string): string {
    let newValue: string = '';
    if (this.tokenTarget) {
      const originalFieldVal: string = this.tokenTarget.nativeElement.value;
      const selectionStart: number = this.tokenTarget.nativeElement.selectionStart;
      const selectionEnd: number = this.tokenTarget.nativeElement.selectionEnd;
      const formattedToken: string = `%(${token})`;
      const textBeforeToken: string = originalFieldVal.substring(0, selectionStart);
      const textAfterToken: string = originalFieldVal.substring(selectionEnd);
      newValue = textBeforeToken + formattedToken + textAfterToken;
    }
    return newValue;
  }

  onFocusIn() {
    this.focusState = true;
    this.ref.detectChanges();
  }

  onFocusOut() {
    this.focusState = false;
    this.ref.detectChanges();
  }

  onEveryInputChange() {
    this.ref.detectChanges();
    if (this.containsToken) {
      this.lf_field_form_control.clearValidators();
    }
    else {
      this.resetToDefaultValidators();
    }
    this.lf_field_form_control.updateValueAndValidity();
    super.onValueChanged(false);
  }

  protected override fieldOnValueChanged(): void {
    const currentValue = this.lf_field_form_control.value;
    this.lf_field_form_control.setValue(currentValue ?? '');
  }

  onTextValueChanged() {
    if (this.containsToken) {
      this.lf_field_form_control.clearValidators();
    }
    else {
      this.resetToDefaultValidators();
    }
    this.lf_field_form_control.updateValueAndValidity();
    super.onValueChanged();
  }

  onTextTokenChosen(token: string) {
    const newFieldVal: string = this.createNewFieldValueWithToken(token);
    if (this.tokenService.containsTokenForFieldType(newFieldVal, this.lf_field_info.fieldType, this.is_import_mode)) {
      this.lf_field_form_control.clearValidators();
      this.lf_field_form_control.updateValueAndValidity();
    }
    this.onTokenChosen(token);
  }
}
