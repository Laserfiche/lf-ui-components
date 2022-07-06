import { Pipe, PipeTransform } from '@angular/core';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { Observable } from 'rxjs';
import { LfFieldInfo } from './../../field-components/utils/lf-field-types';

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
        return this.localizedFieldTypes?.get('DATA');
      }
      case FieldType.Date: {
        return this.localizedFieldTypes?.get('DATE');
      }
      case FieldType.DateTime: {
        return this.localizedFieldTypes?.get('DATE_TIME');
      }
      case FieldType.List: {
        return this.localizedFieldTypes?.get('LIST');
      }
      case FieldType.LongInteger: {
        return this.localizedFieldTypes?.get('LONG_INTEGER');
      }
      case FieldType.Number: {
        return this.localizedFieldTypes?.get('NUMBER');
      }
      case FieldType.ShortInteger: {
        return this.localizedFieldTypes?.get('INTEGER');
      }
      case FieldType.String: {
        return this.localizedFieldTypes?.get('TEXT');
      }
      case FieldType.Time: {
        return this.localizedFieldTypes?.get('TIME');
      }
      default:
        return undefined;
    }
  }
}
