import { FieldValue, LfFieldInfo } from "./../../../../ui-components/lf-metadata/field-components/utils/lf-field-types";
import { LfFieldAdhocContainerService } from "./../../../../ui-components/lf-metadata/lf-field-adhoc-container/public-api";
import { FieldFormat, FieldType } from "./../../../../ui-components/shared/lf-shared-public-api";

export class LfFieldAdhocContainerDemoService implements LfFieldAdhocContainerService {
  fieldInfos: LfFieldInfo[] = [
    {
      name: 'Attendance List',
      id: 1,
      fieldType: FieldType.String,
      isMultiValue: true,
      displayName: 'Attendance List'
    },
    {
      name: 'Full Name',
      id: 2,
      fieldType: FieldType.String,
      isRequired: true,
      displayName: 'Full Name'
    },
    {
      name: 'Birthdays',
      id: 3,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      isMultiValue: true,
      displayName: 'Birthdays'
    },
    {
      name: 'Birthdays w/ Time',
      id: 4,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      isMultiValue: true,
      displayName: 'Birthdays w/ Time'
    },
    {
      name: 'Start Times',
      id: 5,
      fieldType: FieldType.Time,
      format: FieldFormat.ShortTime,
      isMultiValue: true,
      displayName: 'Start Times'
    },
    {
      name: 'Number (no format)',
      id: 6,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
      displayName: 'Number (no format)'
    },
    {
      name: 'Amount (AUD)',
      id: 61,
      fieldType: FieldType.Number,
      format: FieldFormat.Currency,
      currency: 'AUD',
      displayName: 'Amount (AUD)'
    },
    {
      name: 'Test Scores',
      id: 62,
      fieldType: FieldType.Number,
      format: FieldFormat.Percent,
      isMultiValue: true,
      constraint: '>=0&<=100',
      constraintError: 'Must be between 0-100.',
      displayName: 'Test Scores'
    },
    {
      name: 'Calories Per Serving',
      id: 63,
      fieldType: FieldType.Number,
      format: FieldFormat.Scientific,
      displayName: 'Calories Per Serving'
    },
    {
      name: 'General Number',
      id: 64,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
      displayName: 'General Number'
    },
    {
      name: 'Int',
      id: 7,
      fieldType: FieldType.ShortInteger,
      format: FieldFormat.GeneralNumber,
      displayName: 'Int'
    },
    {
      name: 'LongInt',
      id: 8,
      fieldType: FieldType.LongInteger,
      format: FieldFormat.GeneralNumber,
      displayName: 'LongInt'
    },
    {
      name: 'Additional Comments',
      id: 9,
      fieldType: FieldType.String,
      format: FieldFormat.None,
      isRequired: true,
      length: 200,
      displayName: 'Additional Comments'
    },
    {
      name: 'Date',
      id: 11,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      displayName: 'Date'
    },
    {
      name: 'DateTime',
      id: 12,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      displayName: 'DateTime'
    },
    {
      name: 'Attendance List (1)',
      id: 101,
      fieldType: FieldType.String,
      isMultiValue: true,
      displayName: 'Attendance List (1)'
    },
    {
      name: 'Full Name (1)',
      id: 102,
      fieldType: FieldType.String,
      isRequired: true,
      displayName: 'Full Name (1)'
    },
    {
      name: 'Birthdays (1)',
      id: 103,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      isMultiValue: true,
      displayName: 'Birthdays (1)'
    },
    {
      name: 'Birthdays w/ Time (1)',
      id: 104,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      isMultiValue: true,
      displayName: 'Birthdays w/ Time (1)'
    },
    {
      name: 'Start Times (1)',
      id: 105,
      fieldType: FieldType.Time,
      format: FieldFormat.ShortTime,
      isMultiValue: true,
      displayName: 'Start Times (1)'
    },
    {
      name: 'Number (no format) (1)',
      id: 106,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
      displayName: 'Number (no format) (1)'
    },
    {
      name: 'Amount (AUD) (1)',
      id: 161,
      fieldType: FieldType.Number,
      format: FieldFormat.Currency,
      currency: 'AUD',
      displayName: 'Amount (AUD) (1)'
    },
    {
      name: 'Test Scores (1)',
      id: 162,
      fieldType: FieldType.Number,
      format: FieldFormat.Percent,
      isMultiValue: true,
      constraint: '>=0&<=1',
      constraintError: 'Must be between 0-1.',
      displayName: 'Test Scores (1)'
    },
    {
      name: 'Calories Per Serving (1)',
      id: 163,
      fieldType: FieldType.Number,
      format: FieldFormat.Scientific,
      displayName: 'Calories Per Serving (1)'
    },
    {
      name: 'General Number (1)',
      id: 164,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
      displayName: 'General Number (1)'
    },
    {
      name: 'Int (1)',
      id: 107,
      fieldType: FieldType.ShortInteger,
      format: FieldFormat.GeneralNumber,
      displayName: 'Int (1)'
    },
    {
      name: 'LongInt (1)',
      id: 108,
      fieldType: FieldType.LongInteger,
      format: FieldFormat.GeneralNumber,
      displayName: 'LongInt (1)'
    },
    {
      name: 'Additional Comments (1)',
      id: 109,
      fieldType: FieldType.String,
      format: FieldFormat.None,
      isRequired: true,
      length: 2,
      displayName: 'Additional Comments (1)'
    },
    {
      name: 'Date (1)',
      id: 110,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      displayName: 'Date (1)'
    },
    {
      name: 'DateTime (1)',
      id: 120,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      displayName: 'DateTime (1)'
    },
    {
      name: 'Time',
      id: 13,
      fieldType: FieldType.Time,
      format: FieldFormat.LongTime,
      displayName: 'Time'
    },
  ];
  values: FieldValue[] = [
    {
      fieldName: 'Attendance List',
      fieldId: 1,
      fieldType: FieldType.String,
      values: [
        { value: 'Alex', position: '0' },
        { value: 'Andrew', position: '1' },
        { value: 'Ian', position: '2' },
        { value: 'Lee', position: '3' },
        { value: 'Paolo', position: '4' },
        { value: 'Quinn', position: '5' },
      ],
    },
  ];
  mappedFields = [{ value: this.values[0], definition: this.fieldInfos[0] }];

  async getAllFieldDefinitionsAsync(): Promise<LfFieldInfo[]> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
       return resolve(this.fieldInfos);
    }, 100);
  });
  }
}
