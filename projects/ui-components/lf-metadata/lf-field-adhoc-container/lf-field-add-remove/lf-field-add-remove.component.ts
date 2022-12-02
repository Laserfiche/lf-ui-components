import { Component, EventEmitter, Output, Input, ChangeDetectorRef, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { AdhocFieldConnectorService } from '../lf-field-adhoc-connector.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AdhocFieldInfo } from '../lf-field-adhoc-container-types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { LfFieldAdhocContainerService } from '../lf-field-adhoc-container.service';
import { FieldType, PopupModalData } from '@laserfiche/lf-ui-components/shared';
import { LfFieldInfo } from '../../field-components/utils/lf-field-types';
import { AppLocalizationService, filterObjectsByName } from '@laserfiche/lf-ui-components/shared';
import { Observable } from 'rxjs';
import { PopupModalResult } from '@laserfiche/lf-ui-components/shared';
import { CoreUtils } from '@laserfiche/lf-js-utils';

/**
 * @internal
 */
@Component({
  selector: 'lf-field-add-remove-component',
  templateUrl: './lf-field-add-remove.component.html',
  styleUrls: ['./lf-field-add-remove.component.css']
})
export class LfFieldAddRemoveComponent implements AfterViewInit {
  private readonly APPLY_CHANGES = this.localizationService.getStringLaserficheObservable('APPLY_CHANGES');
  private readonly DO_YOU_WANT_TO_YOUR_APPLY_FIELD_CHANGES = this.localizationService.getStringLaserficheObservable('DO_YOU_WANT_TO_YOUR_APPLY_FIELD_CHANGES');
  private readonly YES = this.localizationService.getStringLaserficheObservable('YES');
  private readonly NO = this.localizationService.getStringLaserficheObservable('NO');
  readonly CANCEL: Observable<string> = this.localizationService.getStringLaserficheObservable('CANCEL');
  readonly APPLY: Observable<string> = this.localizationService.getStringLaserficheObservable('APPLY');
  readonly ADD_REMOVE_FIELDS: Observable<string> = this.localizationService.getStringLaserficheObservable('ADD_REMOVE_FIELDS');
  readonly NO_MATCHING_FIELDS_FOUND: Observable<string> = this.localizationService.getStringLaserficheObservable('NO_MATCHING_FIELDS_FOUND');
  readonly SEARCH_FIELDS: Observable<string> = this.localizationService.getStringLaserficheObservable('SEARCH_FIELDS');
  readonly AN_ERROR_OCCURED = this.localizationService.getStringLaserficheObservable('AN_ERROR_OCCURED');

  readonly LOCALIZED_FIELD_TYPES: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['DATA', this.localizationService.getStringLaserficheObservable('DATA')],
    ['DATE', this.localizationService.getStringLaserficheObservable('DATE')],
    ['DATE_TIME', this.localizationService.getStringLaserficheObservable('DATE_TIME')],
    ['LIST', this.localizationService.getStringLaserficheObservable('LIST')],
    ['LONG_INTEGER', this.localizationService.getStringLaserficheObservable('LONG_INTEGER')],
    ['NUMBER', this.localizationService.getStringLaserficheObservable('NUMBER')],
    ['INTEGER', this.localizationService.getStringLaserficheObservable('INTEGER')],
    ['TEXT', this.localizationService.getStringLaserficheObservable('TEXT')],
    ['TIME', this.localizationService.getStringLaserficheObservable('TIME')],
  ]);

  allFieldInfos: AdhocFieldInfo[] = [];
  displayFieldInfos: AdhocFieldInfo[] = [];
  selectedFieldIds: Set<number> = new Set<number>();
  areCheckboxChanges: boolean = false;
  filterFieldsControl: FormControl = new FormControl();
  fieldFilterText: string = '';

  hasError: boolean = false;
  isLoading: boolean = true;
  adhocFieldContainerService!: LfFieldAdhocContainerService;

  dialogRef?: MatDialogRef<any>;
  @ViewChild('addRemoveConfirmModal') popupModal?: TemplateRef<any>;

  @Output() checkboxUpdate = new EventEmitter<void>();
  @Output() clickBack = new EventEmitter<void>();

  constructor(
    private adHocConnectorService: AdhocFieldConnectorService,
    public ref: ChangeDetectorRef,
    public popupDialog: MatDialog,
    private localizationService: AppLocalizationService,
  ) { }

  ngAfterViewInit() {
    this.filterFieldsControl.valueChanges.pipe(debounceTime(200)).subscribe((value) => {
      this.fieldFilterText = value;
      this.filterDisplayedFields();
    });
  }

  @Input()
  initAsync = async (adhocContainerService: LfFieldAdhocContainerService): Promise<void> => {
    this.adhocFieldContainerService = CoreUtils.validateDefined(adhocContainerService, 'adhocContainerService');
    try {
      this.isLoading = true;
      this.hasError = false;
      await this.loadFieldDefinitionsInOrderAsync();
    }
    catch (error) {
      this.hasError = true;
    }
    finally {
      this.isLoading = false;
    }
  };

  /** @internal */
  get shouldShowErrorMessage(): boolean {
    return this.hasError;
  }

  async onClickBack() {
    if (this.areCheckboxChanges) {
      const popupModalData: PopupModalData = {
        popupTitle: this.APPLY_CHANGES,
        popupMessage: this.DO_YOU_WANT_TO_YOUR_APPLY_FIELD_CHANGES,
        cancelButtonText: this.CANCEL,
        confirmButtonText: this.YES,
        noButtonText: this.NO
      };
      this.dialogRef = this.popupDialog.open(
        this.popupModal!,
        {
          width: '280px',
          maxWidth: 'none',
          data: popupModalData
        }
      );

      const result = await this.dialogRef.afterClosed().toPromise();
      if (result === PopupModalResult.CONFIRM) {
        this.onClickApply();
      }
      else if (result === PopupModalResult.NO) {
        this.onConfirmNo();
      }
    }
    else {
      this.clickBack.emit();
    }
  }

  onModalButtonClick(event: string) {
    const buttonClicked: string = event;
    this.dialogRef?.close(buttonClicked);
  }

  onClickApply() {
    this.areCheckboxChanges = false;
    this.adHocConnectorService.setSelectedFieldIds(this.selectedFieldIds);
    this.clickBack.emit();
  }

  onClickCancel() {
    this.getAppliedFields();
    this.areCheckboxChanges = false;
  }

  onConfirmNo() {
    this.areCheckboxChanges = false;
    this.clickBack.emit();
  }

  private filterDisplayedFields() {
    this.displayFieldInfos = filterObjectsByName(this.allFieldInfos, this.fieldFilterText) ?? [];
  }

  onClearFields() {
    this.fieldFilterText = '';
    this.filterDisplayedFields();
  }

  onUpdateCheckbox(changeEvent: MatCheckboxChange, field: LfFieldInfo) {
    this.areCheckboxChanges = true;
    this.updateSelectedOptions(changeEvent.checked, field);
    this.checkboxUpdate.emit();
  }

  private updateSelectedOptions(checked: boolean, field: LfFieldInfo) {
    if (checked) {
      this.selectedFieldIds.add(field.id);
    }
    else {
      this.selectedFieldIds.delete(field.id);
    }
  }

  async updateSortedFieldInfos() {
    this.getAppliedFields();
    this.areCheckboxChanges = false;
    this.allFieldInfos = this.partitionFieldInfos(this.allFieldInfos);
    this.filterDisplayedFields();
    this.ref.detectChanges();
  }

  private partitionFieldInfos(fieldDefinitions: AdhocFieldInfo[]) {
    const selectedFieldInfos: AdhocFieldInfo[] = fieldDefinitions?.filter(
      (fieldInfo) => (this.selectedFieldIds.has(fieldInfo.id) && !fieldInfo.inTemplateSelected)) ?? [];
    const unselectedFieldInfos: LfFieldInfo[] = fieldDefinitions?.filter(
      (fieldInfo) => !(this.selectedFieldIds.has(fieldInfo.id) || fieldInfo.inTemplateSelected)) ?? [];
    const disabledFields: AdhocFieldInfo[] = fieldDefinitions?.filter(
      (fieldInfo) => fieldInfo.inTemplateSelected) ?? [];

    const allOrderedFields = selectedFieldInfos.concat(unselectedFieldInfos).concat(disabledFields);
    return allOrderedFields;
  }

  isFieldSelected(field: AdhocFieldInfo): boolean {
    const selectedItemExists: boolean = this.selectedFieldIds ? this.selectedFieldIds.has(field.id) : false;
    const isSelected: boolean = field.inTemplateSelected ?? false;
    return selectedItemExists || isSelected;
  }


  getAppliedFields() {
    this.selectedFieldIds = this.adHocConnectorService.getSelectedFieldIds();
  }

  private async loadFieldDefinitionsInOrderAsync(): Promise<void> {
  const fieldInfos: LfFieldInfo[] = await this.getCurrentFieldOptionsAsync();
  this.allFieldInfos = this.orderFieldInfosByName(fieldInfos);
  this.adHocConnectorService.setAllFieldInfos(this.allFieldInfos);
}

  private async getCurrentFieldOptionsAsync(): Promise<LfFieldInfo[]> {
      const fieldInfos: AdhocFieldInfo[] = await this.adhocFieldContainerService.getAllFieldDefinitionsAsync();
      const fieldDefinitions = fieldInfos.filter((val) => {
        const validFieldType: boolean = val.fieldType in FieldType && val.fieldType !== FieldType.Blob;
        if (!validFieldType) {
          console.warn(`Invalid FieldType: ${val.fieldType}. Will not display field with name: ${val.name}`);
        }
        return validFieldType;
      });
      this.adHocConnectorService.setAllFieldInfos(fieldDefinitions);

      if (fieldDefinitions?.length === 0) {
        console.warn('getAllFieldDefinitionsAsync returned no definitions');
      }
      return fieldDefinitions;
  }

    /** @internal */
    private orderFieldInfosByName(fieldInfos: LfFieldInfo[]): LfFieldInfo[] {
      if (fieldInfos) {
        const sortSelectedFieldInfosAlphabetically = fieldInfos?.sort((a, b) => {
          const aName = a.name?.toLowerCase() ?? '';
          const bName = b.name?.toLowerCase() ?? '';
          return aName < bName ? -1 : 1;
        });
        return sortSelectedFieldInfosAlphabetically;
      }
      else {
        return [];
      }
    }

}
