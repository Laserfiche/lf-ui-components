// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { FieldFormat, FieldType } from '@laserfiche/lf-ui-components/shared';

export interface LfFieldInfo {
  name: string;
  id: number;
  displayName: string;
  description?: string;
  fieldType: FieldType;
  length?: number;
  defaultValue?: string;
  isMultiValue?: boolean;
  isRequired?: boolean;
  constraint?: string;
  constraintError?: string;
  listValues?: Array<string>;
  format?: FieldFormat;
  currency?: string;
  formatPattern?: string;
}

export type LfFieldValue = string;

// TODO find better name: too similar to LfFieldValue
export interface FieldValue {
  fieldId: number;
  fieldName?: string;
  values?: Array<{ [key: string]: string }>;
  fieldType?: FieldType;
  groupId?: number;
  flags?: number;
}

export interface FieldValues {
  [fieldId: number]: FieldValue;
}

export interface TemplateInfo {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  fieldCount?: number;
  color?: LfColor;
}

export interface TemplateValue {
  name: string;
  id: number;
  fieldValues: { [key: string]: FieldValue };
}

export interface LfColor {
  a: number;
  r: number;
  g: number;
  b: number;
}

export interface TemplateFieldInfo extends LfFieldInfo {
  rule?: Rule;
  groupId?: number;
  groupName?: string;
}

export interface Rule {
  ancestors: number[]; // ids of parent fields in template according to form logic rule
}
