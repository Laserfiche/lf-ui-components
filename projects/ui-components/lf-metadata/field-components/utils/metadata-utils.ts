// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LfFieldInfo, TemplateFieldInfo } from './lf-field-types';

export function isDynamicField(fieldInfo: LfFieldInfo): boolean {
  const fieldInfoAsTemplateInfo = fieldInfo as TemplateFieldInfo;
  return fieldInfoAsTemplateInfo.rule?.ancestors !== undefined;
}
