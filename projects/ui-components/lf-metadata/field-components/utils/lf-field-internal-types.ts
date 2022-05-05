import { LfFieldValue, TemplateFieldInfo } from './lf-field-types';

/** @internal */
export interface FieldDefinition {
    fieldInfo: TemplateFieldInfo;
    fieldValues?: LfFieldValue[];
}