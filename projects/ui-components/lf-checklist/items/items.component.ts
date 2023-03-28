import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { AppLocalizationService, ValidationUtils } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable } from 'rxjs';
import { ChecklistItem } from './checklist-item';

/**
 * @internal
 */
@Component({
  selector: 'lf-items-component',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css', './../lf-checklist/lf-checklist.component.css']
})
export class ItemsComponent implements OnInit {

  @Input() items: ChecklistItem[] = [];
  @Output() itemsChanged: EventEmitter<void> = new EventEmitter<void>();
  labelPosition: string = 'before';
  checklistParentForm: FormGroup;

  /** @internal */
  readonly LOCALIZED_STRINGS: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['REQUIRED', this.localizationService.getStringLaserficheObservable('REQUIRED')]
  ]);

  constructor(private fb: FormBuilder, private ref: ChangeDetectorRef, private localizationService: AppLocalizationService) {
    this.checklistParentForm = this.fb.group({
      fieldArray: new FormArray([])
    });
  }

  ngOnInit(): void {
    this.refreshChecklistItems();
  }

  @Input()
  refreshChecklistItems = () => {
    this.syncFormControlDataToFieldValues();
    this.ref.detectChanges();
  };

  forceValidation: () => boolean = () => {
    let isValid = true;
    this.items.forEach((val, index) => {
      if (val.editable && val.checked) {
        // don't return invalid if not editable, since user can't fix it
        const control = this.getSingleField(index);
        this.triggerValidation(control);
        const controlValid = control.valid;
        if (!controlValid) {
          isValid = false;
        }
      }
    });
    return isValid;
  };

  onItemCheckboxChanged(index: number) {
    const field = this.getSingleField(index);
    const item = this.items[index];
    item.name = field.value;
    if (!item.checked) {
      field.clearValidators();
    }
    else {
      this.addValidators(item, field);
    }
    this.triggerValidation(field);
    this.itemsChanged.emit();
  }

  private addValidators(item: ChecklistItem, field: FormControl) {
    const constraint = item.constraint;
    const required = item.isRequired;
    const validators: ValidatorFn[] = [];
    if (constraint) {
      validators.push(ValidationUtils.generalRegexValidator(new RegExp(constraint)));
    }
    if (required) {
      const requiredRegexValidator = ValidationUtils.requiredValidator();
      validators.push(requiredRegexValidator);
    }
    field.setValidators(validators);
  }

  private triggerValidation(field: FormControl) {
    field.markAsDirty();
    field.updateValueAndValidity();
  }

  onItemValueChanged(index: number) {
    const field = this.getSingleField(index);
    this.items[index].name = field.value;
    this.itemsChanged.emit();
  }

  getIcons(item: ChecklistItem): string[] {
    // TODO add error icon if there is an error on node
    if (typeof (item.icon) === 'string') {
      return [item.icon];
    }
    else {
      return item.icon;
    }
  }

  private getArray(): FormArray {
    return this.checklistParentForm.get('fieldArray') as FormArray;
  }

  getSingleField(index: number): FormControl {
    return this.getArray().controls[index] as FormControl;
  }

  syncFormControlDataToFieldValues() {
    this.getArray().clear();
    if (this.items) {
      this.items.forEach(item => {
        const formControl = new FormControl(item.name);
        if (item.editable && item.checked) {
          this.addValidators(item, formControl);
        }
        if (!item.editable) {
          formControl.disable();
        }
        this.getArray().push(formControl);
      });
    }
  }

  doNothing(event: KeyboardEvent) {
    event.preventDefault();
  }
}
