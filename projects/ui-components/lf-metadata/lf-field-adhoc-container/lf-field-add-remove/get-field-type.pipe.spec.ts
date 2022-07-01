import { CoreUtils } from '@laserfiche/lf-js-utils';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { Observable, of } from 'rxjs';
import { LfFieldInfo } from '../../field-components/utils/lf-field-types';
import { GetFieldTypePipe } from './get-field-type.pipe';

describe('GetFieldTypePipe', () => {
  const pipe = new GetFieldTypePipe();
  const mappedObservables: Map<string, Observable<string>> = new Map<string, Observable<string>>([
    ['FIELD_TYPE_STRING', of('string type')]
  ]);
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return Observable if exists', async () => {
    const item: LfFieldInfo = {
      id: 1,
      name: 'test name',
      fieldType: FieldType.String
    };
    let value: string | undefined;
    pipe.transform(item, mappedObservables)?.subscribe((val) => {
      value = val;
    });
    const expectedValue = 'string type';

    await CoreUtils.waitForConditionAsync(
      () => value === expectedValue,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedValue);
  });

  it('should return undefined if no mapped Observable', async () => {
    const item: LfFieldInfo = {
      id: 1,
      name: 'test name',
      fieldType: FieldType.List
    };
    const value = pipe.transform(item, mappedObservables);

    expect(value).toBeUndefined();
  });

});
