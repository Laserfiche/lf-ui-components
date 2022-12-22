import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild,
} from '@angular/core';
import { LfFieldContainerService } from './lf-field-container.service';
import { LfFieldAdhocContainerComponent } from '../lf-field-adhoc-container/lf-field-adhoc-container.component';
import { LfFieldTemplateContainerComponent } from '../lf-field-template-container/lf-field-template-container.component';
import { FieldValue, LfFieldInfo, TemplateValue } from '../field-components/utils/lf-field-types';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { Observable, of } from 'rxjs';
import { CoreUtils } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-field-container-component',
  templateUrl: './lf-field-container.component.html',
  styleUrls: ['./lf-field-container.component.css']
})
export class LfFieldContainerComponent {
  @Input() collapsible: boolean = false;
  @Input() start_collapsed: boolean = false;
  @Output() fieldValuesChanged = new EventEmitter<boolean>();
  @Output() templateSelectedChanged = new EventEmitter<number>();
  @Output() dialogOpened = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  /** @internal */
  @ViewChild(LfFieldTemplateContainerComponent) templateContainer!: LfFieldTemplateContainerComponent;
  /** @internal */
  @ViewChild(LfFieldAdhocContainerComponent) adhocContainer!: LfFieldAdhocContainerComponent;

  /** @internal */
  private lfFieldContainerService!: LfFieldContainerService;

  /** @internal */
  panelOpenState: boolean = this.start_collapsed;
  /** @internal */
  readonly FIELDS = this.localizationService.getStringLaserficheObservable('FIELDS');

  /** @internal */
  readonly TEMPLATE = this.localizationService.getStringLaserficheObservable('TEMPLATE');

  /** @internal */
  SELECTED_TEMPLATE_NAME = this.getSelectedTemplateName();

  /** @internal */
  getSelectedTemplateName(): Observable<string> {
    const templateSelected = this.templateContainer?.templateSelected;
    if (templateSelected) {
      return of(templateSelected.displayName);
    }
    else {
      return this.templateContainer?.emptyTemplateName;
    }
  }

  /** @internal */
  constructor(
    /** @internal */
    private ref: ChangeDetectorRef,
    /** @internal */
    private zone: NgZone,
    /** @internal */
    public localizationService: AppLocalizationService
  ) { }

  @Input()
  initAsync = async (
    lfFieldContainerService: LfFieldContainerService,
    templateIdentifier?: number | string
  ): Promise<void> => {
    this.ref.detectChanges();
    this.lfFieldContainerService = CoreUtils.validateDefined(
      lfFieldContainerService,
      'lfFieldContainerService'
    );
    await this.zone.run(async () => {
      await this.adhocContainer.initAsync(this.lfFieldContainerService);
      await this.templateContainer.initAsync(
        { templateFieldContainerService: this.lfFieldContainerService },
        templateIdentifier
      );
      this.SELECTED_TEMPLATE_NAME = this.getSelectedTemplateName();
    });

  };

  @Input()
  forceValidation = (): boolean => {
    const templateIsValid: boolean = this.templateContainer.forceValidation();
    const adhocIsValid: boolean = this.adhocContainer.forceValidation();
    return templateIsValid && adhocIsValid;
  };

  @Input()
  clearAsync = async (): Promise<void> => {
    await this.templateContainer.clearAsync();
    await this.adhocContainer.clearAsync();
  };

  @Input()
  getFieldValues = (): { [fieldName: string]: FieldValue } => {
    return this.zone.run(() => {
      const adhocFieldValues: { [fieldName: string]: FieldValue } =
        this.adhocContainer.getFieldValues();
      const templateFieldValues: { [fieldName: string]: FieldValue } =
        this.templateContainer.getTemplateValue()?.fieldValues ?? {};
      return { ...adhocFieldValues, ...templateFieldValues };
    });
  };

  @Input()
  getNumAdhocFields = (): number => {
    const adhocFields = Object.keys(this.adhocContainer.getFieldValues() ?? {}).length;
    return adhocFields ?? 0;
  };

  @Input()
  resetFieldDataAsync = async (
    fields: { value: FieldValue; definition: LfFieldInfo }[]
  ): Promise<void> => {
    await this.zone.run(async () => {
      await this.adhocContainer.resetFieldDataAsync(fields);
    });
  };

  @Input()
  updateFieldValuesAsync = async (values: FieldValue[]): Promise<void> => {
    await this.zone.run(async () => {
      await this.adhocContainer.updateFieldValuesAsync(values);
    });
  };

  @Input()
  getTemplateValue = (): TemplateValue | undefined => {
    return this.templateContainer.getTemplateValue();
  };

  /** @internal */
  onFieldValuesChanged(): void {
    const templateIsValid: boolean = this.templateContainer.isValid();
    const adhocIsValid: boolean = this.adhocContainer.isValid();
    this.fieldValuesChanged.emit(templateIsValid && adhocIsValid);
  }

  /** @internal */
  onTemplateSelectedChange(selectedTemplateId: number) {
    this.templateSelectedChanged.emit(selectedTemplateId);
    this.SELECTED_TEMPLATE_NAME = this.getSelectedTemplateName();
  }

  /** @internal */
  onDialogOpened() {
    this.dialogOpened.emit();
  }

  /** @internal */
  onDialogClosed() {
    this.dialogClosed.emit();
  }
}
