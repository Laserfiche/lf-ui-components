import {
  Component,
  ComponentFactoryResolver,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  ComponentRef,
  ViewContainerRef,
  ComponentFactory,
  AfterViewInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { Observable, Subscription } from 'rxjs';
import { LfFieldMetadataConnectorService } from '../lf-field-metadata-connector.service';
import { LfFieldContainerDirective } from '../lf-field-container.directive';
import { LfFieldTemplateContainerService } from './lf-field-template-container.service';
import { LfFieldTemplateProviders } from './lf-field-template-container-types';
import {
  FieldValue,
  FieldValues,
  LfFieldInfo,
  TemplateFieldInfo,
  TemplateInfo,
  TemplateValue,
} from '../field-components/utils/lf-field-types';
import { LfFieldComponent } from '../field-components/lf-field/lf-field.component';
import { LfFieldMultivalueComponent } from '../field-components/lf-field-multivalue/lf-field-multivalue.component';
import { LfFieldGroupComponent } from '../field-components/lf-field-group/lf-field-group.component';
import { FieldDefinition } from '../field-components/utils/lf-field-internal-types';
import { isDynamicField } from '../field-components/utils/metadata-utils';
import { AppLocalizationService, FieldType } from '@laserfiche/lf-ui-components/shared';
import { CoreUtils } from '@laserfiche/lf-js-utils';

/**
 * @internal
 */
 export enum DropDownLabelState {
  DEFAULT = 'default',
  LOADING = 'isLoading',
  HAS_ERROR = 'hasError',
}

/**
 * @internal
 */
 export enum TemplateState {
  DEFAULT = 'default',
  LOADING = 'isLoading',
  HAS_ERROR = 'hasError',
  SHOW_TEMPLATE = 'showTemplate'
}

@Component({
  selector: 'lf-field-template-container-component',
  templateUrl: './lf-field-template-container.component.html',
  styleUrls: ['./lf-field-template-container.component.css'],
})
export class LfFieldTemplateContainerComponent extends LfFieldContainerDirective implements AfterViewInit, OnDestroy {
  @Output() templateSelectedChange = new EventEmitter<number>();

  /** @internal */
  hideTemplate: boolean = false;
  /** @internal */
  availableTemplates: TemplateInfo[] = [];
  /** @internal */
  loadedTemplates: boolean = false;
  /** @internal */
  templateFieldContainerService!: LfFieldTemplateContainerService;
  /** @internal */
  templateErrorMessage: Observable<string> | undefined;
  /** @internal */
  readonly emptyTemplateName: Observable<string> = this.localizationService.getStringObservable('NO_TEMPLATE_ASSIGNED');
  /** @internal */
  templateSelected: TemplateInfo | undefined;
  /** @internal */
  dynamicOptions: Map<number, string[][]> = new Map<number, string[][]>();
  /** @internal */
  private adhocFieldsSub: Subscription | undefined;
  /** @internal */
  private adhocDialogOpenedSub: Subscription | undefined;
  /** @internal */
  readonly AN_ERROR_OCCURED = this.localizationService.getStringObservable('AN_ERROR_OCCURED');
  /** @internal */
  dropdownLabelState: DropDownLabelState = DropDownLabelState.DEFAULT;
  /** @internal */
  templateState: TemplateState = TemplateState.DEFAULT;
  /** @internal */
  private readonly TEMPLATE_HAS_FAILED_TO_LOAD =
    this.localizationService.getStringObservable('TEMPLATE_HAS_FAILED_TO_LOAD');

  /** @internal */
  constructor(
    /** @internal */
    public resolver: ComponentFactoryResolver,
    /** @internal */
    public metadataConnectorService: LfFieldMetadataConnectorService,
    /** @internal */
    private zone: NgZone,
    /** @internal */
    private localizationService: AppLocalizationService,
    /** @internal */
    private ref: ChangeDetectorRef
  ) {
    super(resolver, metadataConnectorService);
  }

  /** @internal */
  ngAfterViewInit() {
    this.adhocFieldsSub = this.metadataConnectorService.adhocFieldDataUpdated().subscribe(async () => {
      if (this.templateFieldContainerService) {
        await this.updateTemplateFieldsAsync();
      }
    });
    this.adhocDialogOpenedSub = this.metadataConnectorService
      .getAddRemoveContainerToggled()
      .subscribe(async (addRemovedOpened) => {
        this.hideTemplate = addRemovedOpened;
      });
  }

  /** @internal */
  ngOnDestroy(): void {
    this.adhocFieldsSub?.unsubscribe();
    this.adhocDialogOpenedSub?.unsubscribe();
    this.resetComponentValues();
  }

  @Input()
  initAsync = async (providers: LfFieldTemplateProviders, templateIdentifier?: number | string): Promise<void> => {
    await this.zone.run(async () => {
      this.resetComponentValues();
      this.templateFieldContainerService = CoreUtils.validateDefined(
        providers.templateFieldContainerService,
        'templateFieldContainerService'
      );
      await this.selectTemplateAsync(templateIdentifier);
      await this.updateTemplateFieldsAsync();
      this.ref.detectChanges();
    });
  };

  @Input()
  clearAsync = async (): Promise<void> => {
    await this.zone.run(async () => {
      this.resetComponentValues();
      this.metadataConnectorService.clearAllFieldValues();
      if (this.templateState === TemplateState.SHOW_TEMPLATE) {
        await this.renderFieldsAsync(this.allFieldInfos);
      }
    });
  };

  @Input()
  getTemplateValue: () => TemplateValue | undefined = () => {
    return this.zone.run(() => {
      if (!this.templateSelected) {
        return undefined;
      }

      const fieldValues: { [key: string]: FieldValue } = {};
      this.componentRefs?.forEach((componentRef) => {
        const fieldValue = componentRef.instance.getFieldValue();
        // TODO: should key by id, not name?
        fieldValues[fieldValue.fieldName as string] = fieldValue;
      });
      this.groupComponentRefs?.forEach((componentRef) => {
        const mappedFieldValues = componentRef.instance.getFieldValues();
        mappedFieldValues.forEach((fieldValue) => {
          // TODO: should key by id, not name?
          fieldValues[fieldValue.fieldName as string] = fieldValue;
        });
      });
      return { name: this.templateSelected.name as string, id: this.templateSelected.id, fieldValues };
    });
  };

  /** @internal */
  get isDropdownError(): boolean {
    return this.dropdownLabelState === DropDownLabelState.HAS_ERROR;
  }

  /** @internal */
  get isDropdownLoading(): boolean {
    return this.dropdownLabelState === DropDownLabelState.LOADING;
  }

  /** @internal */
  get isDropdownDefault(): boolean {
    return this.dropdownLabelState === DropDownLabelState.DEFAULT;
  }

  /** @internal */
  get isTemplateLoading(): boolean {
    return this.templateState === TemplateState.LOADING;
  }

  /** @internal */
  get isTemplateError(): boolean {
    return this.templateState === TemplateState.HAS_ERROR;
  }

  /** @internal */
  get isTemplateDefault(): boolean {
    return this.templateState === TemplateState.DEFAULT;
  }

  /** @internal */
  private resetComponentValues() {
    this.templateSelected = undefined;
    this.allFieldInfos = [];
    this.templateErrorMessage = undefined;
    this.loadedTemplates = false;
    this.availableTemplates = [];
    this.allFieldValues = {};
    this.metadataConnectorService.setAllFieldValues({});
  }

  /** @internal */
  async renderFieldsAsync(fieldInfos: (TemplateFieldInfo | LfFieldInfo)[]): Promise<void> {
    const vf = this.lfFieldView.viewContainerRef;
    vf.clear();
    this.componentRefs = [];
    this.groupComponentRefs = [];

    const fieldFactory = this.resolver.resolveComponentFactory(LfFieldComponent);
    const multivalueFieldFactory = this.resolver.resolveComponentFactory(LfFieldMultivalueComponent);
    const fieldGroupFactory = this.resolver.resolveComponentFactory(LfFieldGroupComponent);

    const fieldGroups: Map<number, FieldDefinition[]> = new Map<number, FieldDefinition[]>();
    for (const fieldInfo of fieldInfos) {
      const values = this.getValuesById(fieldInfo.id) ?? [];
      const templateFieldInfo: TemplateFieldInfo = fieldInfo as TemplateFieldInfo;
      if (templateFieldInfo?.groupId && fieldInfo.isMultiValue) {
        const groupCurrentFieldDefinitions = fieldGroups.get(templateFieldInfo.groupId);
        const newDef: FieldDefinition = {
          fieldInfo: templateFieldInfo,
          fieldValues: values.length > 0 ? values : [''],
        };
        if (groupCurrentFieldDefinitions) {
          this.addDefinitionToExistingGroup(groupCurrentFieldDefinitions, newDef);
        } else {
          this.createAndAddNewGroupRef(vf, fieldGroupFactory, templateFieldInfo.groupId, fieldGroups, newDef);
        }
      } else if (fieldInfo.isMultiValue) {
        const multivalueComponentRef = vf.createComponent(multivalueFieldFactory);
        this.componentRefs.push(multivalueComponentRef);
        await this.initializeMultivalueComponentAsync(multivalueComponentRef, fieldInfo, values);
      } else {
        const fieldComponentRef = vf.createComponent(fieldFactory);
        this.componentRefs.push(fieldComponentRef);
        await this.initializeFieldComponentAsync(fieldComponentRef, fieldInfo, values?.length > 0 ? values[0] : '');
      }
    }
    for (const mapItem of fieldGroups) {
      await this.initializeFieldGroupAsync(mapItem);
    }
  }

  /** @internal */
  private async initializeFieldGroupAsync(mapItem: [number, FieldDefinition[]]) {
    const groupId = mapItem[0];
    const group = mapItem[1];
    const fieldGroupComponentRef = this.groupComponentRefs?.find((component) => component.instance.groupId === groupId);
    if (fieldGroupComponentRef) {
      await this.initializeFieldGroupComponentAsync(fieldGroupComponentRef, group);
    } else {
      console.warn('Unable to initialize fieldGroup', groupId);
    }
  }

  /** @internal */
  private addDefinitionToExistingGroup(groupCurrentFieldDefinitions: FieldDefinition[], newDef: FieldDefinition) {
    groupCurrentFieldDefinitions.push(newDef);
  }

  /** @internal */
  private createAndAddNewGroupRef(
    vf: ViewContainerRef,
    fieldGroupFactory: ComponentFactory<LfFieldGroupComponent>,
    groupId: number,
    fieldGroups: Map<number, FieldDefinition[]>,
    newDef: FieldDefinition
  ) {
    const fieldGroupComponentRef = vf.createComponent(fieldGroupFactory);
    fieldGroupComponentRef.instance.groupId = groupId;
    this.groupComponentRefs.push(fieldGroupComponentRef);
    fieldGroups.set(groupId, [newDef]);
  }

  /** @internal */
  private async initializeFieldGroupComponentAsync(
    fieldGroupComponentRef: ComponentRef<LfFieldGroupComponent>,
    group: FieldDefinition[]
  ) {
    const firstLength = group[0]?.fieldValues?.length ?? 1;
    const sameSizeGroups = group.every((def) => (def.fieldValues?.length ?? 1) === firstLength);
    if (sameSizeGroups) {
      await fieldGroupComponentRef.instance.initAsync(group, this.dynamicOptions);
      fieldGroupComponentRef.instance.fieldValuesChanged.subscribe(
        async (fieldChange: { fieldValue: FieldValue; indicesChanged: number[] }) => {
          const fieldValue = fieldChange.fieldValue;
          const id = fieldValue.fieldId;
          const vals: string[] = fieldValue.values ? fieldValue.values?.map((value) => value['value'] ?? '') : [''];
          const fieldInfo = this.allFieldInfos.find((fieldInfo) => fieldInfo.id === id) as TemplateFieldInfo;
          await this.onFieldValueChangedAsync(vals, fieldInfo, fieldChange.indicesChanged);
        }
      );
    }
  }

  /** @internal */
  async fieldComponentInitAsync(
    fieldComponentRef: ComponentRef<LfFieldComponent>,
    fieldInfo: LfFieldInfo,
    value: string
  ) {
    const optionsForFieldInfo = this.dynamicOptions.get(fieldInfo.id);
    await fieldComponentRef.instance.initAsync(
      fieldInfo,
      value,
      optionsForFieldInfo ? optionsForFieldInfo[0] : undefined
    );
  }

  /** @internal */
  async multivalueComponentInitAsync(
    multivalueFieldComponentRef: ComponentRef<LfFieldMultivalueComponent>,
    fieldInfo: LfFieldInfo,
    values: string[]
  ) {
    await multivalueFieldComponentRef.instance.initAsync(fieldInfo, values, this.dynamicOptions.get(fieldInfo.id));
  }

  /** @internal */
  compareTemplateInfoFunc(object1: TemplateInfo, object2: TemplateInfo) {
    return object1 && object2 && object1.id == object2.id;
  }

  /** @internal */
  async onToggleDropdownAsync(open: boolean): Promise<void> {
    this.templateErrorMessage = undefined;
    if (open) {
      try {
        this.availableTemplates = [];
        this.dropdownLabelState = DropDownLabelState.LOADING;
        this.availableTemplates = await this.templateFieldContainerService.getAvailableTemplatesAsync();
        this.dropdownLabelState = DropDownLabelState.DEFAULT;
        this.loadedTemplates = true;
        if (this.availableTemplates.length === 0) {
          this.templateState = TemplateState.DEFAULT;
        }
      }
      catch (err) {
        if (this.availableTemplates.length === 0) {
          this.dropdownLabelState = DropDownLabelState.HAS_ERROR;
          this.templateSelected = undefined;
          this.templateState = TemplateState.DEFAULT;
          this.ref.detectChanges();
        }
        console.error('getAvailableTemplatesAsync', err);
      }
    }
  }

  /** @internal */
  async onTemplateChangedAsync(event: MatSelectChange): Promise<void> {
    this.templateSelected = (event.value as TemplateInfo) ?? undefined;
    await this.updateTemplateFieldsAsync();
    this.templateSelectedChange.emit(this.templateSelected?.id);
  }

  /** @internal */
  private async selectTemplateAsync(id: number | string | undefined): Promise<void> {
    if (id === undefined) {
      this.templateSelected = undefined;
    } else {
      try {
        this.dropdownLabelState = DropDownLabelState.LOADING;
        this.templateState = TemplateState.LOADING;
        this.templateSelected = (await this.templateFieldContainerService.getTemplateDefinitionAsync(id)) as TemplateInfo;
        if (!this.loadedTemplates && this.templateSelected) {
          this.availableTemplates = [this.templateSelected];
        }
        this.dropdownLabelState = DropDownLabelState.DEFAULT;
        this.templateState = TemplateState.SHOW_TEMPLATE;
      }
      catch (error: any) {
        this.templateErrorMessage = this.AN_ERROR_OCCURED;
        console.error('getTemplateDefinitionAsync failed: ' + error.message);
        this.templateState = TemplateState.HAS_ERROR;
      }
    }
  }

  /** @internal */
  private async updateTemplateFieldsAsync(): Promise<void> {
    await this.updateTemplateFieldInfoAsync();
    this.allFieldValues = this.metadataConnectorService.getAllFieldValues() ?? {};
    const newFieldIds: number[] = this.allFieldInfos.map((fieldInfo) => fieldInfo.id);
    this.metadataConnectorService.selectTemplateFields(newFieldIds);
    if (this.templateState === TemplateState.SHOW_TEMPLATE) {
      await this.renderFieldsAsync(this.allFieldInfos);
    }
  }

  /** @internal */
  private async updateTemplateFieldInfoAsync(): Promise<void> {
    await this.updateAllFieldInfosFromServiceAsync();

    for (const fieldInfo of this.allFieldInfos) {
      const fieldInfoAsTemplateFieldInfo: TemplateFieldInfo = fieldInfo as TemplateFieldInfo;
      const dynamicOptions = this.getOrCreateDynamicOptions(fieldInfo);
      const isBaseDynamicField = isDynamicField(fieldInfo) && fieldInfoAsTemplateFieldInfo.rule?.ancestors.length === 0;
      if (isBaseDynamicField) {
        try {
          const fieldValue = this.getOrCreateFieldValue(fieldInfo.id);
          const numValues = fieldValue.values?.length ?? 1;
          const dynamicFieldValueOptions = await this.getDynamicFieldValueOptionsAsync(0);
          for (let index = 0; index < numValues; index++) {
            dynamicOptions[index] = dynamicFieldValueOptions[fieldInfo.id];
            if (dynamicOptions[index] === undefined) {
              console.warn(`Could not get dynamic field options of field ${fieldInfo.name} id ${fieldInfo.id}`);
              continue;
            }
            const values: string[] = this.getValueIfSingleOption(dynamicOptions[index]);
            await this.updateDynamicFieldsAsync(fieldInfo, values, index);
          }
        } catch (err: any) {
          this.templateState = TemplateState.HAS_ERROR;
          this.templateErrorMessage = this.TEMPLATE_HAS_FAILED_TO_LOAD;
          console.error('getDynamicFieldValueOptionsAsync failed: ' + err?.message ?? err?.title ?? '');
          throw err;
        }
      }
    }
  }

  /** @internal */
  private getValueIfSingleOption(dynamicOptions: string[]) {
    const values: string[] = [];
    if (dynamicOptions?.length === 1) {
      values.push(dynamicOptions[0]);
    }
    return values;
  }

  /** @internal */
  private async updateAllFieldInfosFromServiceAsync() {
    if (!this.templateSelected) {
      this.allFieldInfos = [];
    } else {
      try {
        this.templateState = TemplateState.LOADING;
        const fieldInfos = await this.templateFieldContainerService.getTemplateFieldsAsync(this.templateSelected.id);
        this.allFieldInfos = fieldInfos.filter((val) => {
          const validFieldType: boolean = val.fieldType in FieldType && val.fieldType !== FieldType.Blob;
          if (!validFieldType) {
            console.warn(`Invalid FieldType: ${val.fieldType}. Will not display field with name: ${val.name}`);
          }
          return validFieldType;
        });
        this.templateState = TemplateState.SHOW_TEMPLATE;
      }
      catch (err: any) {
        this.templateErrorMessage = this.TEMPLATE_HAS_FAILED_TO_LOAD;
        console.error('getTemplateFieldsAsync failed: ' + err?.message ?? err?.title ?? '');
        this.templateState = TemplateState.HAS_ERROR;
        throw err;
      }
      finally {
        this.ref.detectChanges();
      }
    }
  }

  /** @internal */
  private getOrCreateDynamicOptions(fieldInfo: TemplateFieldInfo | LfFieldInfo) {
    let dynamicOptions = this.dynamicOptions.get(fieldInfo.id);
    if (!dynamicOptions) {
      const defaultNone = [[]];
      this.dynamicOptions.set(fieldInfo.id, defaultNone);
      dynamicOptions = this.dynamicOptions.get(fieldInfo.id) ?? defaultNone;
    }
    return dynamicOptions;
  }

  /** @internal */
  async onFieldValueChangedAsync(
    fieldValues: string[],
    lfFieldInfo: TemplateFieldInfo,
    indicesChanged?: number[]
  ): Promise<void> {
    this.fieldValuesChanged.emit(this.isValid());
    let indicesOfValueChanged = indicesChanged;
    if (!indicesOfValueChanged) {
      indicesOfValueChanged = [...Array(fieldValues.length).keys()];
    }
    if (isDynamicField(lfFieldInfo)) {
      this.setFieldValue(lfFieldInfo.id, fieldValues);
      for (const indexChanged of indicesOfValueChanged) {
        this.showLoader(indexChanged);
        const fieldInfoOptions = this.getOrCreateDynamicOptions(lfFieldInfo);
        await CoreUtils.yieldAsync();
        const fieldOptions = fieldInfoOptions[indexChanged];
        if (!fieldOptions) {
          const isBaseDynamicField = isDynamicField(lfFieldInfo) && lfFieldInfo.rule?.ancestors.length === 0;
          if (isBaseDynamicField) {
            await this.addFieldOptionsForIndexAsync(indexChanged, fieldInfoOptions, lfFieldInfo);
          }
        }
        await this.updateDynamicFieldsAsync(lfFieldInfo, fieldValues, indexChanged);
      }
      if (this.templateState === TemplateState.SHOW_TEMPLATE) {
        await this.renderFieldsAsync(this.allFieldInfos);
      }
    } else {
      this.setFieldValue(lfFieldInfo.id, fieldValues);
    }
  }

  /** @internal */
  private async addFieldOptionsForIndexAsync(
    indexChanged: number,
    fieldInfoOptions: string[][],
    lfFieldInfo: TemplateFieldInfo
  ) {
    try {
      const dynamicFieldValueOptions = await this.getDynamicFieldValueOptionsAsync(indexChanged);
      fieldInfoOptions[indexChanged] = dynamicFieldValueOptions[lfFieldInfo.id];
      if (fieldInfoOptions[indexChanged] === undefined) {
        console.warn(
          `Could not get dynamic field options of field ${lfFieldInfo.name} id ${lfFieldInfo.id}, index ${indexChanged}`
        );
      }
    }
    catch (error) {
      this.templateState = TemplateState.HAS_ERROR;
      console.error('getDynamicFieldValueOptionsAsync failed:', error);
    }
  }

  /** @internal */
  private showLoader(indexChanged: number) {
    for (const fieldComponent of this.componentRefs) {
      if (isDynamicField(fieldComponent.instance.lfFieldInfo)) {
        fieldComponent.instance.isLoading = true;
      }
    }
    this.groupComponentRefs.forEach((component) => {
      component.instance.showLoader(indexChanged);
    });
  }

  /** @internal */
  private async updateDynamicFieldsAsync(
    fieldInfo: TemplateFieldInfo,
    values: string[],
    indexChanged: number
  ): Promise<void> {
    this.setFieldValue(fieldInfo.id, values);
    const children = this.getDynamicFieldChildren(fieldInfo);
    if (!children || children.length === 0) {
      return;
    }
    try {
      const dynamicFieldValueOptions = await this.getDynamicFieldValueOptionsAsync(indexChanged);
      for (const childFieldInfo of children) {
        const childId = childFieldInfo.id;
        if (!(childId in dynamicFieldValueOptions)) {
          console.warn(`Could not get dynamic field options of field ${childFieldInfo.name} id ${childFieldInfo.id}`);
          continue;
        }

        const dynamicFieldOptions = this.getOrCreateDynamicOptions(childFieldInfo);
        dynamicFieldOptions[indexChanged] = dynamicFieldValueOptions[childId] ?? [];

        const childFieldValue: FieldValue = this.getUpdatedChildValue(childFieldInfo, dynamicFieldOptions, indexChanged);
        const stringValues = childFieldValue.values?.map((val) => val['value']) ?? [''];
        await this.updateDynamicFieldsAsync(childFieldInfo, stringValues, indexChanged);
      }
    }
    catch (error) {
      this.templateState = TemplateState.HAS_ERROR;
      console.error('getDynamicFieldValueOptionsAsync:', error);
    }
  }

  /** @internal */
  private getUpdatedChildValue(
    childFieldInfo: TemplateFieldInfo,
    dynamicFieldOptions: string[][],
    indexChanged: number
  ) {
    const childFieldValues: FieldValue = this.getOrCreateFieldValue(childFieldInfo.id);
    const optionsForIndex = dynamicFieldOptions[indexChanged];
    if (optionsForIndex?.length === 1) {
      if (childFieldValues.values) {
        childFieldValues.values[indexChanged] = { value: optionsForIndex[0], position: (indexChanged + 1).toString() };
      } else {
        childFieldValues.values = [{ value: optionsForIndex[0], position: '1' }];
      }
    } else {
      if (childFieldValues.values) {
        childFieldValues.values[indexChanged] = { value: '', position: (indexChanged + 1).toString() };
      } else {
        childFieldValues.values = [{ value: '', position: '1' }];
      }
    }
    return childFieldValues;
  }

  /** @internal */
  private async getDynamicFieldValueOptionsAsync(indexChanged: number): Promise<{ [fieldId: number]: string[] }> {
    const relevantValues: FieldValues = this.getRelevantValuesForIndex(indexChanged);
    if (!this.templateSelected?.id) {
      throw new Error('Unexpected: templateSelected is undefined');
    }
    this.templateState = TemplateState.LOADING;
    const dynamicFieldValueOptions = await this.templateFieldContainerService.getDynamicFieldValueOptionsAsync(
      this.templateSelected.id,
      relevantValues
    );
    this.templateState = TemplateState.SHOW_TEMPLATE;
    this.ref.detectChanges();
    return dynamicFieldValueOptions;
  }

  /** @internal */
  private getRelevantValuesForIndex(indexChanged: number) {
    const dynamicFieldValues: FieldValues = this.getDynamicFieldValues();
    const relevantValues: FieldValues = {};
    for (const id in dynamicFieldValues) {
      const value = dynamicFieldValues[id];
      const newVal: FieldValue = {
        fieldId: value.fieldId,
        fieldName: value.fieldName,
        fieldType: value.fieldType,
        groupId: value.groupId,
      };
      if (value.values) {
        newVal.values = [value.values[indexChanged]];
      }
      relevantValues[value.fieldId] = newVal;
    }
    return relevantValues;
  }

  /** @internal */
  private getDynamicFieldChildren(fieldInfo: TemplateFieldInfo): TemplateFieldInfo[] | undefined {
    if (!isDynamicField(fieldInfo)) {
      return undefined;
    }

    const parentId = fieldInfo.id;
    const children = this.allFieldInfos.filter((templateFieldInfo) =>
      (templateFieldInfo as TemplateFieldInfo).rule?.ancestors.includes(parentId)
    );
    return children;
  }

  /** @internal */
  private getDynamicFieldValues(): FieldValues {
    const result: FieldValues = {};
    for (const fieldInfo of this.allFieldInfos) {
      const fieldId = fieldInfo.id;
      if (isDynamicField(fieldInfo) && fieldId in this.allFieldValues) {
        result[fieldId] = this.allFieldValues[fieldId];
      }
    }
    return result;
  }
}
