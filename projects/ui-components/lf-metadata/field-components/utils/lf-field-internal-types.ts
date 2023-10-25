// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LfFieldValue, TemplateFieldInfo } from './lf-field-types';

/** @internal */
export interface FieldDefinition {
    fieldInfo: TemplateFieldInfo;
    fieldValues?: LfFieldValue[];
}
