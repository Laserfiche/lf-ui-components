// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, ChangeDetectorRef, Input, ViewChild, OnDestroy, ComponentRef, AfterViewInit, EventEmitter, Output, NgZone } from '@angular/core';
import { LfFieldAdhocContainerService as LfFieldAdhocContainerService } from './lf-field-adhoc-container.service';
import { AdhocFieldConnectorService } from './lf-field-adhoc-connector.service';
import { AdhocFieldInfo } from './lf-field-adhoc-container-types';
import { Subscription } from 'rxjs';
import { LfFieldAddRemoveComponent } from './lf-field-add-remove/lf-field-add-remove.component';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { FieldValue, FieldValues, LfFieldInfo } from '../field-components/utils/lf-field-types';
import { LfFieldComponent } from '../field-components/lf-field/lf-field.component';
import { LfFieldMultivalueComponent } from '../field-components/lf-field-multivalue/lf-field-multivalue.component';
import { LfFieldMetadataConnectorService } from '../lf-field-metadata-connector.service';
import { LfFieldContainerDirective } from '../lf-field-container.directive';
import { CoreUtils } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-field-adhoc-container-component',
  templateUrl: './lf-field-adhoc-container.component.html',
  styleUrls: ['./lf-field-adhoc-container.component.css'],
  providers: [AdhocFieldConnectorService]
})
export class LfFieldAdhocContainerComponent extends LfFieldContainerDirective implements OnDestroy, AfterViewInit {
  /** @internal */
  @ViewChild(LfFieldAddRemoveComponent) addRemoveComponent!: LfFieldAddRemoveComponent;
  @Output() dialogOpened = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  /** @internal */
  readonly ADD_REMOVE_FIELDS = this.localizationService.getStringLaserficheObservable('ADD_REMOVE_FIELDS');

  /** @internal */
  readonly NO_ADDITIONAL_FIELDS_ASSIGNED = this.localizationService.getStringLaserficheObservable('NO_ADDITIONAL_FIELDS_ASSIGNED');

  /** @internal */
  showAdhocModal: boolean = false;
  /** @internal */
  adhocFieldContainerService!: LfFieldAdhocContainerService;
  /** @internal */
  templateFields: number[] = [];
  /** @internal */
  private selectedFieldIds: Set<number> = new Set<number>();
  /** @internal */
  private templateFieldsSub: Subscription | undefined;

  /** @internal */
  constructor(
    /** @internal */
    private ref: ChangeDetectorRef,
    /** @internal */
    private adhocFieldConnectorService: AdhocFieldConnectorService,
    /** @internal */
    public metadataFieldConnectorService: LfFieldMetadataConnectorService,
    /** @internal */
    private zone: NgZone,
    /** @internal */
    private localizationService: AppLocalizationService
  ) {
    super(metadataFieldConnectorService);
  }

  /** @internal */
  ngAfterViewInit() {
    this.templateFieldsSub = this.metadataFieldConnectorService.getTemplateFields().subscribe(async (currentTemplateFields) => {
      this.templateFields = currentTemplateFields;
      await this.refreshFieldsAsync();
    });
  }

  /** @internal */
  ngOnDestroy() {
    this.templateFieldsSub?.unsubscribe();
    this.resetComponentValues();
  }

  @Input()
  getFieldValues = (): { [fieldName: string]: FieldValue } => {
    return this.zone.run(() => {
      const fieldValues: { [fieldName: string]: FieldValue } = {};
      this.componentRefs?.forEach((componentRef) => {
        const fieldValue = componentRef.instance.getFieldValue();
        const fieldName = fieldValue.fieldName ?? undefined;
        if (fieldName !== undefined) {
          fieldValues[fieldName] = fieldValue;
        } else {
          console.warn('FieldValue.fieldName is undefined, skipping.');
        }
      });
      return fieldValues;
    });
  };

  @Input()
  clearAsync = async (): Promise<void> => {
    await this.zone.run(async () => {
      this.resetComponentValues();
      this.metadataFieldConnectorService.clearAllFieldValues();
      await this.resetFieldDataAsync([]);
    });
  };

  @Input()
  initAsync = async (adhocFieldContainerService: LfFieldAdhocContainerService): Promise<void> => {
    this.zone.run(() => {
      this.resetComponentValues();
      this.adhocFieldContainerService = CoreUtils.validateDefined(adhocFieldContainerService, 'adhocFieldContainerService');
    });
  };

  @Input()
  resetFieldDataAsync = async (fields: { value: FieldValue; definition: LfFieldInfo }[]): Promise<void> => {
    await this.zone.run(async () => {
      this.loadSelectedFieldValues(fields);
      await this.refreshFieldsAsync();
      this.metadataFieldConnectorService.updatedAdhocFieldData();
    });
  };

  @Input()
  updateFieldValuesAsync = async (values: FieldValue[]): Promise<void> => {
    await this.zone.run(async () => {
      values.forEach((field) => {
        this.allFieldValues[field.fieldId] = field;
      });

      this.metadataFieldConnectorService.setAllFieldValues(this.allFieldValues);
      await this.refreshFieldsAsync();
      this.metadataFieldConnectorService.updatedAdhocFieldData();
    });
  };

  /** @internal */
  private resetComponentValues() {
    this.templateFields = [];
    this.metadataConnectorService.setAllFieldValues({});
    this.adhocFieldConnectorService.setSelectedFieldIds(new Set<number>());
  }

  /** @internal */
  async renderFieldsAsync(fieldInfos: (LfFieldInfo | AdhocFieldInfo)[]): Promise<void> {
    const vf = this.lfFieldView.viewContainerRef;
    vf.clear();
    this.componentRefs = [];
    this.groupComponentRefs = [];

    for (const fieldInfo of fieldInfos) {
      const values = this.getValuesById(fieldInfo.id) ?? [];
      if (fieldInfo.isMultiValue) {
        const multivalueComponentRef = vf.createComponent(LfFieldMultivalueComponent);
        this.componentRefs.push(multivalueComponentRef);
        await this.initializeMultivalueComponentAsync(multivalueComponentRef, fieldInfo, values);
      }
      else {
        const fieldComponentRef = vf.createComponent(LfFieldComponent);
        this.componentRefs.push(fieldComponentRef);
        await this.initializeFieldComponentAsync(fieldComponentRef, fieldInfo, (values?.length > 0) ? values[0] : '');
      }
    }
  }

  /** @internal */
  async fieldComponentInitAsync(fieldComponentRef: ComponentRef<LfFieldComponent>, fieldInfo: LfFieldInfo, value: string) {
    await fieldComponentRef.instance.initAsync(fieldInfo, value);
  }

  /** @internal */
  async multivalueComponentInitAsync(multivalueFieldComponentRef: ComponentRef<LfFieldMultivalueComponent>, fieldInfo: LfFieldInfo, values: string[]) {
    await multivalueFieldComponentRef.instance.initAsync(fieldInfo, values);
  }

  /** @internal */
  private loadSelectedFieldValues(fields: { value: FieldValue; definition: LfFieldInfo }[]): void {
    this.getInitialSelectedOptions(fields);
    this.adhocFieldConnectorService.setSelectedFieldIds(this.selectedFieldIds);
  }

  /** @internal */
  getMappedFieldValues(fieldValues: FieldValue[]): FieldValues {
    const mappedFields: FieldValues = {};
    fieldValues.forEach((fieldValue) => {
      mappedFields[fieldValue.fieldId] = fieldValue;
    });
    return mappedFields;
  }

  /** @internal */
  getFieldIds(fieldValues: FieldValue[]): Set<number> {
    const fieldsSet = new Set<number>();
    fieldValues.forEach((fieldValue) => {
      fieldsSet.add(fieldValue.fieldId);
    });
    return fieldsSet;
  }


  /** @internal */
  private getInitialSelectedOptions(fields: { value: FieldValue; definition: LfFieldInfo }[]): void {
    const mappedFields = fields ?? [];

    const fieldInfos: LfFieldInfo[] = [];
    const fieldValues: FieldValue[] = [];
    mappedFields.forEach((field) => {
      if (field.value && field.definition) {
        fieldInfos.push(field.definition);
        fieldValues.push(field.value);
      }
      else {
        // skip field
      }
    });

    this.allFieldInfos = fieldInfos;
    this.allFieldValues = this.getMappedFieldValues(fieldValues);
    this.adhocFieldConnectorService.setAllFieldInfos(this.allFieldInfos);
    this.selectedFieldIds = this.getFieldIds(fieldValues);
    this.metadataFieldConnectorService.setAllFieldValues(this.allFieldValues);
  }

  /** @internal */
  fieldsEmpty() {
    const isEmpty = !this.componentRefs || this.componentRefs?.length === 0;
    return isEmpty;
  }

  /** @internal */
  async addRemoveFieldsAsync(): Promise<void> {
    this.toggleAdhocModal(true);
    await this.addRemoveComponent.initAsync(this.adhocFieldContainerService);
    const fieldDefinitions = this.adhocFieldConnectorService.getAllFieldInfos();
    this.updateTemplateFields(fieldDefinitions);
    await this.addRemoveComponent.updateSortedFieldInfos();
  }

  /** @internal */
  async onClickBackAsync(): Promise<void> {
    this.toggleAdhocModal(false);
    await this.refreshFieldsAsync();
  }

  /** @internal */
  private toggleAdhocModal(open: boolean) {
    this.showAdhocModal = open;
    this.metadataConnectorService.setAddRemoveContainerToggled(open);
    if (open) {
      this.dialogOpened.emit();
    }
    else {
      this.dialogClosed.emit();
    }
  }

  /** @internal */
  async refreshFieldsAsync(): Promise<void> {
    const fieldValues = this.metadataFieldConnectorService.getAllFieldValues() ?? {};
    this.allFieldValues = { ...this.allFieldValues, ...fieldValues };
    this.selectedFieldIds = this.adhocFieldConnectorService.getSelectedFieldIds();
    const fieldInfosToRender = this.getSelectedFieldInfos();
    await this.renderFieldsAsync(fieldInfosToRender);
  }

  /** @internal */
  getSelectedFieldInfos(): LfFieldInfo[] {
    this.allFieldInfos = this.adhocFieldConnectorService.getAllFieldInfos();
    this.updateTemplateFields(this.allFieldInfos);
    const fieldInfos: LfFieldInfo[] = this.allFieldInfos?.filter((fieldInfo) =>
      (this.selectedFieldIds.has(fieldInfo.id) && !(fieldInfo as AdhocFieldInfo).inTemplateSelected)
    );
    return fieldInfos ?? [];
  }

  /** @internal */
  private updateTemplateFields(fieldInfos: AdhocFieldInfo[]) {
    fieldInfos?.forEach((fieldInfo) => {
      if (this.templateFields?.includes(fieldInfo.id)) {
        fieldInfo.inTemplateSelected = true;
      }
      else {
        fieldInfo.inTemplateSelected = false;
      }
    });
  }


  /** @internal */
  async onFieldValueChangedAsync(values: string[], fieldInfo: LfFieldInfo): Promise<void> {
    this.fieldValuesChanged.emit(this.isValid());
    this.setFieldValue(fieldInfo.id, values);
  }
}
