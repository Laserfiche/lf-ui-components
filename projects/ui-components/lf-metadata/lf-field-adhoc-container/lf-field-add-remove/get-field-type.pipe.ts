import { Pipe, PipeTransform } from '@angular/core';
import { LfFieldInfo, FieldType } from '@laserfiche/types-lf-ui-components';
import { Observable } from 'rxjs';

/**
 * Pipe that returns the localized field type, given a fieldInfo and a set of localized strings
 */
@Pipe({
  name: 'getFieldType'
})
export class GetFieldTypePipe implements PipeTransform {

  constructor() { }

  private localizedFieldTypes?: Map<string, Observable<string>>;

  /**
   * Returns the Localized Field type, given an LfFieldInfo
   * @param fieldInfo the current LfFieldInfo
   * @param localizedFieldTypes A Map of various localized strings that correspond to different FieldTypes, (i.e. 'FIELD_TYPE_STRING')
   * @returns The localized field type
   */
  transform(fieldInfo: LfFieldInfo, localizedFieldTypes: Map<string, Observable<string>>): Observable<string> | undefined {
    this.localizedFieldTypes = localizedFieldTypes;
    return this.getFieldType(fieldInfo);
  }

  private getFieldType(field: LfFieldInfo): Observable<string> | undefined {
    switch (field.fieldType) {
      case FieldType.Blob: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_BLOB');
      }
      case FieldType.Date: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_DATE');
      }
      case FieldType.DateTime: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_DATETIME');
      }
      case FieldType.List: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_LIST');
      }
      case FieldType.LongInteger: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_LONG');
      }
      case FieldType.Number: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_NUMBER');
      }
      case FieldType.ShortInteger: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_SHORT');
      }
      case FieldType.String: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_STRING');
      }
      case FieldType.Time: {
        return this.localizedFieldTypes?.get('FIELD_TYPE_TIME');
      }
      default:
        return undefined;
    }
  }
}
