import { CoreUtils } from '@laserfiche/lf-js-utils';
import { of } from 'rxjs';
import { LfFieldGroupIndexDisplayPipe } from './lf-field-group-index-display.pipe';

describe('LfFieldGroupIndexDisplayPipe', () => {
  const pipe = new LfFieldGroupIndexDisplayPipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('returns string if params do not match', async () => {
    const transform = pipe.transform(of('hi'), 1, 1);

    const expected = 'hi';
    let value: string | undefined;
    transform.subscribe((val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });

  it('replaces params if possible', async () => {
    const transform = pipe.transform(of('Test header {0} {1}'), 1, 5);

    const expected = 'Test header 2 5';
    let value: string | undefined;
    transform.subscribe((val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });

  it('returns string if there are too many params', async () => {
    const transform = pipe.transform(of('Test header {0} {1} {2}'), 1, 1);
    const expected = 'Test header {0} {1} {2}';
    let value: string | undefined;
    transform.subscribe((val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expected,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expected);
  });
});
