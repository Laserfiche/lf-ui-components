import { TestBed } from '@angular/core/testing';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { FieldType } from './../../../../shared/lf-shared-public-api';
import { LfFieldTokenId, LfFieldTokenData, LfFieldTokenService } from './lf-field-token.service';

describe('LfFieldTokenService', () => {
  let service: LfFieldTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfFieldTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get tokens for date field', async () => {
    const data: LfFieldTokenData = {
      fieldType: FieldType.Date
    };
    const dateTokens = await service.getTokensAsync(data);
    const expectedDateTokens = [
      { id: LfFieldTokenId.DATE, friendlyName: 'Date', text: 'date' }
    ];
    expect(dateTokens.length).toEqual(expectedDateTokens.length);
    expect(dateTokens[0].id).toEqual(expectedDateTokens[0].id);

    let value: string | undefined;
    dateTokens[0].friendlyName.subscribe(async (val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expectedDateTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedDateTokens[0].friendlyName);
  });

  it('should get tokens for datetime field', async () => {
    const data: LfFieldTokenData = {
      fieldType: FieldType.DateTime
    };
    const datetimeTokens = await service.getTokensAsync(data);
    const expectedDatetimeTokens = [
      { id: LfFieldTokenId.DATETIME, friendlyName: 'Date/Time', text: 'datetime' }
    ];
    expect(datetimeTokens.length).toEqual(expectedDatetimeTokens.length);
    expect(datetimeTokens[0].id).toEqual(expectedDatetimeTokens[0].id);
    let value: string | undefined;
    datetimeTokens[0].friendlyName.subscribe(async (val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expectedDatetimeTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedDatetimeTokens[0].friendlyName);
  });

  it('should get tokens for time field', async () => {
    const data: LfFieldTokenData = {
      fieldType: FieldType.Time
    };
    const timeTokens = await service.getTokensAsync(data);
    const expectedTimeTokens = [
      { id: LfFieldTokenId.TIME, friendlyName: 'Time', text: 'time' }
    ];
    expect(timeTokens.length).toEqual(expectedTimeTokens.length);
    expect(timeTokens[0].id).toEqual(expectedTimeTokens[0].id);
    let value: string | undefined;
    timeTokens[0].friendlyName.subscribe(async (val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expectedTimeTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedTimeTokens[0].friendlyName);
  });

  it('should get tokens for number fields', async () => {
    const numberData: LfFieldTokenData = {
      fieldType: FieldType.Number
    };
    const integerData: LfFieldTokenData = {
      fieldType: FieldType.LongInteger
    };
    const numberTokens = await service.getTokensAsync(numberData);
    const integerTokens = await service.getTokensAsync(integerData);
    const expectedNumberTokens = [
      { id: LfFieldTokenId.SESSION_COUNT, friendlyName: 'Session Count', text: 'count' },
      { id: LfFieldTokenId.REPOSITORY_COUNT, friendlyName: 'Repository Count', text: 'gcount' },
      { id: LfFieldTokenId.ENTRY_ID, friendlyName: 'Entry ID', text: 'id' },
      { id: LfFieldTokenId.PARENT_ID, friendlyName: 'Parent ID', text: 'parentid' },
      { id: LfFieldTokenId.PARENT_FIELD, friendlyName: 'Parent Field', text: 'parent' }
    ];

    expect(numberTokens.length).toEqual(expectedNumberTokens.length);
    expect(numberTokens[0].id).toEqual(expectedNumberTokens[0].id);
    let value: string | undefined;
    numberTokens[0].friendlyName.subscribe(async (val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expectedNumberTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedNumberTokens[0].friendlyName);

    expect(integerTokens.length).toEqual(expectedNumberTokens.length);
    expect(integerTokens[1].id).toEqual(expectedNumberTokens[1].id);
    let intValue: string | undefined;
    integerTokens[0].friendlyName.subscribe(async (val) => {
      intValue = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => intValue === expectedNumberTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedNumberTokens[0].friendlyName);
  });

  it('should get tokens for string field', async () => {
    const data: LfFieldTokenData = {
      fieldType: FieldType.String
    };
    const stringTokens = await service.getTokensAsync(data);
    const expectedStringTokens = [
      {id: LfFieldTokenId.DATE, friendlyName: 'Date', text: 'date'},
      {id: LfFieldTokenId.TIME, friendlyName: 'Time', text: 'time'},
      {id: LfFieldTokenId.DATETIME, friendlyName: 'Date/Time', text: 'datetime'},
      // {id: LfFieldTokenId.SESSION_COUNT, friendlyName: 'Session Count', text: 'count'},
      {id: LfFieldTokenId.REPOSITORY_COUNT, friendlyName: 'Repository Count', text: 'gcount'},
      {id: LfFieldTokenId.USER_NAME, friendlyName: 'User Name', text: 'username'},
      {id: LfFieldTokenId.ENTRY_NAME, friendlyName: 'Entry Name', text: 'name'},
      {id: LfFieldTokenId.PARENT_NAME, friendlyName: 'Parent Name', text: 'parentname'},
      {id: LfFieldTokenId.ENTRY_ID, friendlyName: 'Entry ID', text: 'id'},
      {id: LfFieldTokenId.PARENT_ID, friendlyName: 'Parent ID', text: 'parentid'},
      {id: LfFieldTokenId.PARENT_FIELD, friendlyName: 'Parent Field', text: 'parent'}
    ];
    expect(stringTokens.length).toEqual(expectedStringTokens.length);
    expect(stringTokens[0].id).toEqual(expectedStringTokens[0].id);
    let value: string | undefined;
    stringTokens[0].friendlyName.subscribe(async (val) => {
      value = val;
    });
    await CoreUtils.waitForConditionAsync(
      () => value === expectedStringTokens[0].friendlyName,
      () => { throw Error(`Timeout: value was ${value}`); }
    );
    expect(value).toEqual(expectedStringTokens[0].friendlyName);
  });

  it('should get tokens for date field when NOT in import mode', () => {
    const dateTokens = service.getTokensForFieldType(FieldType.Date, false);
    const expectedDateTokens = [LfFieldTokenId.DATE];
    expect(dateTokens).toEqual(expectedDateTokens);
  });

  it('should get additional tokens for date field when in import mode', () => {
    const dateTokens = service.getTokensForFieldType(FieldType.Date, true);
    const expectedDateTokens = [LfFieldTokenId.DATE, LfFieldTokenId.FILE_MODIFIED];
    expect(dateTokens).toEqual(expectedDateTokens);
  });

  it('should get tokens for datetime field when NOT in import mode', () => {
    const datetimeTokens = service.getTokensForFieldType(FieldType.DateTime, false);
    const expectedDatetimeTokens = [LfFieldTokenId.DATETIME];
    expect(datetimeTokens).toEqual(expectedDatetimeTokens);
  });

  it('should get additional tokens for datetime field when in import mode', () => {
    const datetimeTokens = service.getTokensForFieldType(FieldType.DateTime, true);
    const expectedDatetimeTokens = [LfFieldTokenId.DATETIME, LfFieldTokenId.FILE_MODIFIED];
    expect(datetimeTokens).toEqual(expectedDatetimeTokens);
  });

  it('should get tokens for time field when NOT in import mode', () => {
    const timeTokens = service.getTokensForFieldType(FieldType.Time, false);
    const expectedTimeTokens = [LfFieldTokenId.TIME];
    expect(timeTokens).toEqual(expectedTimeTokens);
  });

  it('should get additional tokens for time field when in import mode', () => {
    const timeTokens = service.getTokensForFieldType(FieldType.Time, true);
    const expectedTimeTokens = [LfFieldTokenId.TIME, LfFieldTokenId.FILE_MODIFIED];
    expect(timeTokens).toEqual(expectedTimeTokens);
  });

  it('should get tokens for number fields', () => {
    const numberTokensNoImport = service.getTokensForFieldType(FieldType.Number, false);
    const integerTokensImport = service.getTokensForFieldType(FieldType.LongInteger, true);
    const expectedNumberTokens = [
      LfFieldTokenId.SESSION_COUNT,
      LfFieldTokenId.REPOSITORY_COUNT,
      LfFieldTokenId.ENTRY_ID,
      LfFieldTokenId.PARENT_ID,
      LfFieldTokenId.PARENT_FIELD
    ];
    expect(numberTokensNoImport).toEqual(expectedNumberTokens);
    expect(integerTokensImport).toEqual(expectedNumberTokens);
  });

  it('should get tokens for string field when NOT in import mode', () => {
    const stringTokens = service.getTokensForFieldType(FieldType.String, false);
    const expectedStringTokens = [
      LfFieldTokenId.DATE,
      LfFieldTokenId.TIME,
      LfFieldTokenId.DATETIME,
      // LfFieldTokenId.SESSION_COUNT,
      LfFieldTokenId.REPOSITORY_COUNT,
      LfFieldTokenId.USER_NAME,
      LfFieldTokenId.ENTRY_NAME,
      LfFieldTokenId.PARENT_NAME,
      LfFieldTokenId.ENTRY_ID,
      LfFieldTokenId.PARENT_ID,
      LfFieldTokenId.PARENT_FIELD
    ];
    expect(stringTokens).toEqual(expectedStringTokens);
  });

  it('should get additional tokens for string field when in import mode', () => {
    const stringTokens = service.getTokensForFieldType(FieldType.String, true);
    const expectedStringTokens = [
      LfFieldTokenId.DATE,
      LfFieldTokenId.TIME,
      LfFieldTokenId.DATETIME,
      // LfFieldTokenId.SESSION_COUNT,
      LfFieldTokenId.REPOSITORY_COUNT,
      LfFieldTokenId.USER_NAME,
      LfFieldTokenId.ENTRY_NAME,
      LfFieldTokenId.PARENT_NAME,
      LfFieldTokenId.ENTRY_ID,
      LfFieldTokenId.PARENT_ID,
      LfFieldTokenId.PARENT_FIELD,
      LfFieldTokenId.FILE_NAME,
      LfFieldTokenId.FILE_EXTENSION,
      LfFieldTokenId.FILE_MODIFIED
    ];
    expect(stringTokens).toEqual(expectedStringTokens);
  });

  it('should detect token if field is token', () => {
    const dateFieldWithToken = '%(date)';
    const containsToken = service.containsTokenForFieldType(dateFieldWithToken, FieldType.Date, false);
    expect(containsToken).toBeTrue();
  });

  it('should detect token if field contains token', () => {
    const stringFieldWithToken = 'Parent name is: %(parentname)';
    const containsToken = service.containsTokenForFieldType(stringFieldWithToken, FieldType.String, false);
    expect(containsToken).toBeTrue();
  });

  it('should detect token if field contains token with uppercase', () => {
    const stringFieldWithToken = 'Parent name is: %(ParentName)';
    const containsToken = service.containsTokenForFieldType(stringFieldWithToken, FieldType.String, false);
    expect(containsToken).toBeTrue();
  });

  it('should not detect token if field contains import token when NOT in import mode', () => {
    const datetimeFieldWithImportToken = '%(filemodified)';
    const containsToken = service.containsTokenForFieldType(datetimeFieldWithImportToken, FieldType.DateTime, false);
    expect(containsToken).toBeFalse();
  });

  it('should detect token if field contains import token when in import mode', () => {
    const datetimeFieldWithImportToken = '%(filemodified)';
    const containsToken = service.containsTokenForFieldType(datetimeFieldWithImportToken, FieldType.DateTime, true);
    expect(containsToken).toBeTrue();
  });
});
