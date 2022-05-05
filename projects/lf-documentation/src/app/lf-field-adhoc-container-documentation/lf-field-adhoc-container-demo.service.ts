import { FieldFormat, FieldType, FieldValue, LfFieldAdhocContainerService, LfFieldInfo } from '@laserfiche/types-lf-ui-components';


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
    return this.fieldInfos;
  }
}
