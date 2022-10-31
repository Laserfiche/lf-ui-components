import { FieldValue, LfFieldInfo } from "./../../../../ui-components/lf-metadata/field-components/utils/lf-field-types";
import { LfFieldAdhocContainerService } from "./../../../../ui-components/lf-metadata/lf-field-adhoc-container/public-api";
import { FieldFormat, FieldType } from "./../../../../ui-components/shared/lf-shared-public-api";


export class LfFieldAdhocContainerDemoService implements LfFieldAdhocContainerService {
  fieldInfos: LfFieldInfo[] = [
    {
      name: 'Attendance List',
      id: 1,
      fieldType: FieldType.String,
      isMultiValue: true
    },
    {
      name: 'Full Name',
      id: 2,
      fieldType: FieldType.String,
      isRequired: true
    },
    {

      name: 'Birthdays',
      id: 3,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      isMultiValue: true,
    },
    {

      name: 'Birthdays w/ Time',
      id: 4,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      isMultiValue: true,
    },
    {

      name: 'Start Times',
      id: 5,
      fieldType: FieldType.Time,
      format: FieldFormat.ShortTime,
      isMultiValue: true,
    },
    {

      name: 'Number (no format)',
      id: 6,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Amount (AUD)',
      id: 61,
      fieldType: FieldType.Number,
      format: FieldFormat.Currency,
      currency: 'AUD',
    },
    {

      name: 'Test Scores',
      id: 62,
      fieldType: FieldType.Number,
      format: FieldFormat.Percent,
      isMultiValue: true,
      constraint: '>=0&<=1',
      constraintError: 'Must be between 0-1.',
    },
    {

      name: 'Calories Per Serving',
      id: 63,
      fieldType: FieldType.Number,
      format: FieldFormat.Scientific,
    },
    {

      name: 'General Number',
      id: 64,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Int',
      id: 7,
      fieldType: FieldType.ShortInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'LongInt',
      id: 8,
      fieldType: FieldType.LongInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Additional Comments',
      id: 9,
      fieldType: FieldType.String,
      format: FieldFormat.None,
      isRequired: true,
      length: 2,
    },
    {

      name: 'Date',
      id: 11,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
    },
    {

      name: 'DateTime',
      id: 12,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
    },
    {
      name: 'Attendance List (1)',
      id: 101,
      fieldType: FieldType.String,
      isMultiValue: true
    },
    {
      name: 'Full Name (1)',
      id: 102,
      fieldType: FieldType.String,
      isRequired: true
    },
    {

      name: 'Birthdays (1)',
      id: 103,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      isMultiValue: true,
    },
    {

      name: 'Birthdays w/ Time (1)',
      id: 104,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      isMultiValue: true,
    },
    {

      name: 'Start Times (1)',
      id: 105,
      fieldType: FieldType.Time,
      format: FieldFormat.ShortTime,
      isMultiValue: true,
    },
    {

      name: 'Number (no format) (1)',
      id: 106,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Amount (AUD) (1)',
      id: 161,
      fieldType: FieldType.Number,
      format: FieldFormat.Currency,
      currency: 'AUD',
    },
    {

      name: 'Test Scores (1)',
      id: 162,
      fieldType: FieldType.Number,
      format: FieldFormat.Percent,
      isMultiValue: true,
      constraint: '>=0&<=1',
      constraintError: 'Must be between 0-1.',
    },
    {

      name: 'Calories Per Serving (1)',
      id: 163,
      fieldType: FieldType.Number,
      format: FieldFormat.Scientific,
    },
    {

      name: 'General Number (1)',
      id: 164,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Int (1)',
      id: 107,
      fieldType: FieldType.ShortInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'LongInt (1)',
      id: 108,
      fieldType: FieldType.LongInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Additional Comments (1)',
      id: 109,
      fieldType: FieldType.String,
      format: FieldFormat.None,
      isRequired: true,
      length: 2,
    },
    {

      name: 'Date (1)',
      id: 110,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
    },
    {

      name: 'DateTime (1)',
      id: 120,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
    },
    {

      name: 'Time',
      id: 13,
      fieldType: FieldType.Time,
      format: FieldFormat.LongTime,
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
