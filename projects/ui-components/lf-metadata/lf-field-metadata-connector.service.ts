import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { FieldValue, FieldValues } from './field-components/utils/lf-field-types';

/** @internal */
@Injectable({
  providedIn: 'root'
})
export class LfFieldMetadataConnectorService {

  private allFieldValues: FieldValues = {};
  private readonly templateFields = new BehaviorSubject<number[]>([]);
  private readonly adhocFieldsRefresh = new Subject<void>();
  private readonly adhocDialogOpened = new Subject<boolean>();

  constructor() { }

  setFieldValue(fieldValue: FieldValue) {
    this.allFieldValues[fieldValue.fieldId] = fieldValue;
  }

  setAllFieldValues(fieldValues: FieldValues) {
    this.allFieldValues = fieldValues;
  }

  getAllFieldValues(): FieldValues {
    return this.allFieldValues;
  }

  clearAllFieldValues(): void {
    this.allFieldValues = {};
    this.selectTemplateFields([]);
  }

  selectTemplateFields(newFields: number[]) {
    this.templateFields.next(newFields);
  }

  getTemplateFields(): Observable<number[]> {
    return this.templateFields;
  }

  adhocFieldDataUpdated(): Observable<void>{
    return this.adhocFieldsRefresh;
  }

  updatedAdhocFieldData() {
    this.adhocFieldsRefresh.next();
  }

  setAddRemoveContainerToggled(open: boolean) {
    this.adhocDialogOpened.next(open);
  }

  getAddRemoveContainerToggled() {
    return this.adhocDialogOpened;
  }
}
