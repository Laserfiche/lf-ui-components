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
      constraint: '>=0&<=100',
      constraintError: 'Must be between 0-100.',
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
      length: 200,
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
      name: 'Attendance List',
      id: 100,
      fieldType: FieldType.String,
      isMultiValue: true
    },
    {
      name: 'Full Name',
      id: 200,
      fieldType: FieldType.String,
      isRequired: true
    },
    {

      name: 'Birthdays',
      id: 300,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
      isMultiValue: true,
    },
    {

      name: 'Birthdays w/ Time',
      id: 400,
      fieldType: FieldType.DateTime,
      format: FieldFormat.LongDateTime,
      isMultiValue: true,
    },
    {

      name: 'Start Times',
      id: 500,
      fieldType: FieldType.Time,
      format: FieldFormat.ShortTime,
      isMultiValue: true,
    },
    {

      name: 'Number (no format)',
      id: 600,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Amount (AUD)',
      id: 6100,
      fieldType: FieldType.Number,
      format: FieldFormat.Currency,
      currency: 'AUD',
    },
    {

      name: 'Test Scores',
      id: 6200,
      fieldType: FieldType.Number,
      format: FieldFormat.Percent,
      isMultiValue: true,
      constraint: '>=0&<=100',
      constraintError: 'Must be between 0-100.',
    },
    {

      name: 'Calories Per Serving',
      id: 6300,
      fieldType: FieldType.Number,
      format: FieldFormat.Scientific,
    },
    {

      name: 'General Number',
      id: 6400,
      fieldType: FieldType.Number,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Int',
      id: 700,
      fieldType: FieldType.ShortInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'LongInt',
      id: 800,
      fieldType: FieldType.LongInteger,
      format: FieldFormat.GeneralNumber,
    },
    {

      name: 'Additional Comments',
      id: 900,
      fieldType: FieldType.String,
      format: FieldFormat.None,
      isRequired: true,
      length: 200,
    },
    {

      name: 'Date',
      id: 1100,
      fieldType: FieldType.Date,
      format: FieldFormat.LongDate,
    },
    {

      name: 'DateTime',
      id: 1200,
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
    });
  })
  }
}
