import { OnInit, Output, EventEmitter, Input, Directive, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LfFieldInfo, LfFieldValue } from '../../../utils/lf-field-types';
import { FormControl, ValidatorFn, FormGroup } from '@angular/forms';
import { LfFieldTokenData, LfFieldTokenService } from '../lf-field-token.service';
import { LfFieldValidationUtils } from '../lf-field-validation-utils';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';
import { isDynamicField } from '../../../utils/metadata-utils';
import { ValidationRule } from '@laserfiche/lf-ui-components/shared';
import { validateDefined } from '@laserfiche/lf-js-utils';
import { Observable, of } from 'rxjs';
import { concatMap, map, mergeMap, startWith } from 'rxjs/operators';

/** @internal */
@Directive()
export abstract class BaseFieldDirective implements OnInit {

  @Input() lf_field_info!: LfFieldInfo;
  @Input() lf_field_form_control!: FormControl;
  @Input() lf_field_value: LfFieldValue | undefined;
  @Input() parent_form: FormGroup | undefined;
  @Input() is_import_mode: boolean = false;
  @Output() fieldValueChange = new EventEmitter<LfFieldValue>();
  @ViewChild('tokenTarget') tokenTarget?: ElementRef;
  @Input() dynamic_field_value_options: string[] | undefined;

  showTokenTextBox: boolean = false;

  private readonly CHARACTER_COUNT_LABEL = this.localizationService.getStringObservable('CHARACTER_COUNT_LABEL');
  private readonly CHARACTER_COUNT_NOT_AVAILABLE = this.localizationService.getStringObservable('CHARACTER_COUNT_NOT_AVAILABLE');

  private readonly INVALID_FIELD_REQUIRED_FIELD_EMPTY = this.localizationService.getStringObservable('INVALID_FIELD_REQUIRED_FIELD_EMPTY');
  private STRING_FIELD_VALIDATOR_INVALID_MESSAGE_LENGTH_FORMATTER?: Observable<string>;

  get containsToken(): boolean {
    return this.tokenService.containsTokenForFieldType(this.lf_field_form_control.value, this.lf_field_info.fieldType, this.is_import_mode);
  }

  get lfFieldTokenData(): LfFieldTokenData {
    return {
      fieldType: this.lf_field_info?.fieldType
    };
  };

  get isDynamic(): boolean {
    return isDynamicField(this.lf_field_info);
  }

  readonly tokenCharacterCountHint = this.getTokenCharacterCountHint();

  readonly noTokenCharacterCountHint = this.getNoTokenCharacterCountHint();

  private getConcatenatedTokenLabel(firstVal: string): Observable<string> {
    return this.CHARACTER_COUNT_NOT_AVAILABLE.pipe(map(value => firstVal.concat(` ${value}`)));
  }

  private getTokenCharacterCountHint(): Observable<string> {
    return this.CHARACTER_COUNT_LABEL.pipe(
      mergeMap((value) => this.getConcatenatedTokenLabel(value))
    );
  }

  private getNoTokenCharacterCountHint(): Observable<string> {
    const obs = this.CHARACTER_COUNT_LABEL.pipe(mergeMap((value) => {
      const startValue = `${value}
      ${this.lf_field_form_control.value ? this.lf_field_form_control.value.length : 0}
      / ${this.lf_field_info?.length}`;
      return this.getFieldLengthRatio(value).pipe(startWith(startValue));
    }));
    return obs;
  }

  private getFieldLengthRatio(value: string): Observable<string> {
    return this.lf_field_form_control.valueChanges.pipe(map((thisVal) => {
      return `${value}
      ${thisVal ? this.lf_field_form_control.value.length : 0}
      / ${this.lf_field_info?.length}`;
    }));
  }

  constructor(
    public tokenService: LfFieldTokenService,
    public ref: ChangeDetectorRef,
    public localizationService: AppLocalizationService) { }

  fieldValidationErrorMsg!: Observable<string | undefined>;

  async ngOnInit(): Promise<void> {
    this.lf_field_info = validateDefined(this.lf_field_info, 'LfFieldInfo');
    this.lf_field_form_control = validateDefined(this.lf_field_form_control, 'lfFieldFormControl');
    this.setLfFieldFormControlValue(this.lf_field_value);

    console.log('field length', this.lf_field_info.name, this.lf_field_info.length);
    this.STRING_FIELD_VALIDATOR_INVALID_MESSAGE_LENGTH_FORMATTER = this.localizationService.getStringObservable('STRING_FIELD_VALIDATOR_INVALID_MESSAGE_LENGTH_FORMATTER', [this.lf_field_info?.length?.toString() ?? '0']);

    this.fieldValidationErrorMsg = this.lf_field_form_control.valueChanges.pipe(mergeMap((value) => {
      const validationRuleName = this.getBrokenValidationRule();
      return this.getValidationErrorMsg(validationRuleName) ?? of(undefined);
    }));

    if (this.tokenService.containsTokenForFieldType(this.lf_field_value ?? '', this.lf_field_info.fieldType, this.is_import_mode)) {
      this.showTokenTextBox = true;
    }
    else {
      this.resetToDefaultValidators();
    }
  }

  abstract deserializeLfFieldValue(): string;

  abstract serializeFieldFormControlValue(): string;

  abstract getAdditionalValidatorsForFieldType(): ValidatorFn[];

  abstract getValidationTextForFieldType(validationRuleName: ValidationRule): Observable<string> | undefined;

  protected fieldOnValueChanged(): void {
    // do nothing
    // derived classes will implement
  }

  getLfFieldFormControlValue(): string {
    return this.lf_field_form_control.value;
  }

  setLfFieldFormControlValue(newValue: string | undefined) {
    this.lf_field_value = newValue;
    const deserializedValue: string = this.lf_field_value ? this.deserializeLfFieldValue() : '';
    this.lf_field_form_control.setValue(deserializedValue);
  }

  onValueChanged(emitEvent: boolean = true) {
    if (this.lf_field_form_control.valid) {
      const currentValue = this.serializeFieldFormControlValue();
      this.lf_field_value = currentValue;
    }
    else {
      this.lf_field_value = '';
      this.fieldOnValueChanged();
    }
    if (emitEvent) {
      this.fieldValueChange.emit(this.lf_field_value);
    }
  }

  getBrokenValidationRule(): ValidationRule | undefined {
    for (const validationRuleName of LfFieldValidationUtils.validationRulesInPriorityOrder) {
      if (this.lf_field_form_control?.hasError(validationRuleName)) {
        return validationRuleName;
      }
    }
    return undefined;
  }

  onDateOrTimeTokenValueChanged() {
    this.onFocusOutTokenInput();
    this.onValueChanged();
  }

  onFocusOutTokenInput() {
    if (this.containsToken) {
      this.showTokenTextBox = true;
      this.setLfFieldFormControlValue(this.lf_field_value);
    }
    else {
      this.showTokenTextBox = false;
      this.setLfFieldFormControlValue('');
      this.resetToDefaultValidators();
    }
  }

  onDateOrTimeChanged(emitEvent: boolean = true) {
    this.ref.detectChanges();
    this.lf_field_form_control.updateValueAndValidity();
    this.showTokenTextBox = false;
    this.onValueChanged(emitEvent);
  }

  private getValidationErrorMsg(validationRuleName: ValidationRule | undefined): Observable<string> | undefined {
    if (validationRuleName === undefined) {
      return undefined;
    }
    else {
      switch (validationRuleName) {
        case ValidationRule.REQUIRED:
          return this.INVALID_FIELD_REQUIRED_FIELD_EMPTY;
        case ValidationRule.MAX_LENGTH:
          return this.STRING_FIELD_VALIDATOR_INVALID_MESSAGE_LENGTH_FORMATTER;
        case ValidationRule.PATTERN:
          return this.lf_field_info.constraintError ? of(this.lf_field_info.constraintError) : undefined;

      }
      return this.getValidationTextForFieldType(validationRuleName);
    }
  }

  onTokenChosen(token: string) {
    if (this.tokenTarget) {
      const newFieldVal: string = this.createNewFieldValueWithToken(token);
      this.showTokenTextBox = true;
      this.ref.detectChanges();
      this.setLfFieldFormControlValue(newFieldVal);
      this.fieldValueChange.emit(newFieldVal);
    }
  }
  createNewFieldValueWithToken(token: string): string {
    return `%(${token})`;
  }

  resetToDefaultValidators() {
    const defaultValidators = LfFieldValidationUtils.getDefaultValidators(this.lf_field_info);
    const additionalValidators = this.getAdditionalValidatorsForFieldType();
    this.lf_field_form_control.setValidators(defaultValidators.concat(additionalValidators));
  }
}
