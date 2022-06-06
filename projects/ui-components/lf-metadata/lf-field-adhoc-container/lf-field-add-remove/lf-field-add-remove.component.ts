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
  private readonly APPLY_CHANGES_TITLE = this.localizationService.getStringObservable('APPLY_CHANGES_TITLE');
  private readonly APPLY_CHANGES = this.localizationService.getStringObservable('APPLY_CHANGES');
  private readonly YES = this.localizationService.getStringObservable('YES');
  private readonly NO = this.localizationService.getStringObservable('NO');
  readonly CANCEL: Observable<string> = this.localizationService.getStringObservable('CANCEL');
  readonly APPLY: Observable<string> = this.localizationService.getStringObservable('APPLY');
  readonly ADD_REMOVE_FIELDS: Observable<string> = this.localizationService.getStringObservable('ADD_REMOVE_FIELDS');
  readonly NO_FIELD_AVAILABLE_WITH_FILTER: Observable<string> = this.localizationService.getStringObservable('NO_FIELD_AVAILABLE_WITH_FILTER');
  readonly SEARCH_FIELDS: Observable<string> = this.localizationService.getStringObservable('SEARCH_FIELDS');

  readonly LOCALIZED_FIELD_TYPES: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['FIELD_TYPE_BLOB', this.localizationService.getStringObservable('FIELD_TYPE_BLOB')],
    ['FIELD_TYPE_DATE', this.localizationService.getStringObservable('FIELD_TYPE_DATE')],
    ['FIELD_TYPE_DATETIME', this.localizationService.getStringObservable('FIELD_TYPE_DATETIME')],
    ['FIELD_TYPE_LIST', this.localizationService.getStringObservable('FIELD_TYPE_LIST')],
    ['FIELD_TYPE_LONG', this.localizationService.getStringObservable('FIELD_TYPE_LONG')],
    ['FIELD_TYPE_NUMBER', this.localizationService.getStringObservable('FIELD_TYPE_NUMBER')],
    ['FIELD_TYPE_SHORT', this.localizationService.getStringObservable('FIELD_TYPE_SHORT')],
    ['FIELD_TYPE_STRING', this.localizationService.getStringObservable('FIELD_TYPE_STRING')],
    ['FIELD_TYPE_TIME', this.localizationService.getStringObservable('FIELD_TYPE_TIME')],
  ]);

  allFieldInfos: AdhocFieldInfo[] = [];
  displayFieldInfos: AdhocFieldInfo[] = [];
  selectedFieldIds: Set<number> = new Set<number>();

  areCheckboxChanges: boolean = false;
  filterFieldsControl: FormControl = new FormControl();
  fieldFilterText: string = '';

  adhocFieldContainerService!: LfFieldAdhocContainerService;

  dialogRef?: MatDialogRef<any>;
  @ViewChild('addRemoveConfirmModal') popupModal?: TemplateRef<any>;

  @Output() checkboxUpdate = new EventEmitter<void>();
  @Output() clickBack = new EventEmitter<void>();

  constructor(
    private adHocConnectorService: AdhocFieldConnectorService,
    private ref: ChangeDetectorRef,
    public popupDialog: MatDialog,
    private localizationService: AppLocalizationService
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
    this.allFieldInfos = this.adHocConnectorService.getAllFieldInfos();
  };

  async onClickBack() {
    if (this.areCheckboxChanges) {
      const popupModalData: PopupModalData = {
        popupTitle: this.APPLY_CHANGES_TITLE,
        popupMessage: this.APPLY_CHANGES,
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
}
