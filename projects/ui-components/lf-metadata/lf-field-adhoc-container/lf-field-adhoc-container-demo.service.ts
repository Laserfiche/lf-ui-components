// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

// This service is an intentional duplication of the demo service in lf-documentation

import { LfFieldAdhocContainerService } from './lf-field-adhoc-container.service';
import { FieldFormat, FieldType } from '@laserfiche/lf-ui-components/shared';
import { FieldValue, LfFieldInfo } from '../field-components/utils/lf-field-types';
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
    return this.fieldInfos;
  }
}
