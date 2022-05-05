import { LfFieldInfo, TemplateFieldInfo } from './lf-field-types';

export function isDynamicField(fieldInfo: LfFieldInfo): boolean {
  const fieldInfoAsTemplateInfo = fieldInfo as TemplateFieldInfo;
  return fieldInfoAsTemplateInfo.rule?.ancestors !== undefined;
}
