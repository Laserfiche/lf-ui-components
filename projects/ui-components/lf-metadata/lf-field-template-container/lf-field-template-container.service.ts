import { FieldValues, TemplateFieldInfo, TemplateInfo } from '../field-components/utils/lf-field-types';

export interface LfFieldTemplateContainerService {
  getAvailableTemplatesAsync(): Promise<TemplateInfo[]>;
  getTemplateFieldsAsync(templateIdentifier: number | string): Promise<TemplateFieldInfo[]>;
  getTemplateDefinitionAsync(templateIdentifier: string | number): Promise<TemplateInfo | undefined>;
  getDynamicFieldValueOptionsAsync(
    templateId: number,
    currentValues: FieldValues
  ): Promise<{ [fieldId: number]: string[] }>;
}
