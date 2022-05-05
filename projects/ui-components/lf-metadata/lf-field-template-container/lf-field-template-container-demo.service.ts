// This service is an intentional duplication of the service in lf-documentation

import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { FieldValues, TemplateFieldInfo, TemplateInfo } from '../field-components/utils/lf-field-types';
import { isDynamicField } from '../field-components/utils/metadata-utils';
import { DatetimeUtils } from './lf-field-template-container-datetime-utils';
import { LfFieldTemplateContainerService } from './lf-field-template-container.service';

export enum TemplateIds {
  String,
  Blank,
  Number,
  DateTime,
  DynamicLocation,
  DynamicOneLocation,
  DynamicDateTimes,
  DynamicNumbers,
  Groups
}

export enum DynamicFieldIds {
  State,
  County,
  City,
  GrandparentDate,
  GrandparentTime,
  GrandparentDateTime,
  ParentDate,
  ParentTime,
  ParentDateTime,
  ChildDate,
  ChildTime,
  ChildDateTime,
  ParentNumber,
  ChildNumber,
}

export enum State {
  CA = 'CA',
  NV = 'NV',
  OH = 'OH',
}

export enum County {
  Clark = 'Clark',
  Cuyahoga = 'Cuyahoga',
  Hamilton = 'Hamilton',
  LosAngeles = 'LosAngeles',
  Orange = 'Orange',
  SanBernadino = 'SanBernadino',
}

export enum City {
  Cincinnati = 'Cincinnati',
  Cleveland = 'Cleveland',
  Fullerton = 'Fullerton',
  Hawthorne = 'Hawthorne',
  LasVegas = 'LasVegas',
  LongBeach = 'LongBeach',
  Placentia = 'Placentia',
  Riverside = 'Riverside',
  Strongsville = 'Strongsville',
  Westwood = 'Westwood',
}
export const fieldInfosPerTemplate: { [templateId: number]: TemplateFieldInfo[] } = {
  [TemplateIds.String]: [
    { id: 1, name: 'multivalue string', fieldType: FieldType.String, isMultiValue: true },
    { id: 2, name: 'plain string', fieldType: FieldType.String },
  ],
  [TemplateIds.DateTime]: [
    { id: 3, name: 'multivalue date', fieldType: FieldType.Date, isMultiValue: true },
    { id: 4, name: 'multivalue datetime', fieldType: FieldType.DateTime, isMultiValue: true },
    { id: 5, name: 'multivalue time', fieldType: FieldType.Time, isMultiValue: true },
  ],
  [TemplateIds.Number]: [
    { id: 6, name: 'number', fieldType: FieldType.Number },
    { id: 7, name: 'short integer 1', fieldType: FieldType.ShortInteger },
    { id: 8, name: 'long interger', fieldType: FieldType.LongInteger },
    { id: 9, name: 'short integer 2', fieldType: FieldType.ShortInteger },
  ],
  [TemplateIds.DynamicLocation]: [
    {
      id: DynamicFieldIds.State,
      name: 'State',
      fieldType: FieldType.String,
      rule: { ancestors: [] },
      groupId: 1,
      isMultiValue: true
    },
    {
      id: DynamicFieldIds.County,
      name: 'County',
      fieldType: FieldType.String,
      rule: { ancestors: [DynamicFieldIds.State] },
      groupId: 1,
      isMultiValue: true
    },
    {
      id: DynamicFieldIds.City,
      name: 'City',
      fieldType: FieldType.String,
      rule: { ancestors: [DynamicFieldIds.County] },
      groupId: 1,
      isMultiValue: true
    },
    {
      id: 1000,
      name: 'Weather',
      fieldType: FieldType.String
    },
  ],
  [TemplateIds.DynamicOneLocation]: [
    {
      id: DynamicFieldIds.State,
      name: 'State',
      fieldType: FieldType.String,
      rule: { ancestors: [] },
    },
    {
      id: DynamicFieldIds.County,
      name: 'County',
      fieldType: FieldType.String,
      rule: { ancestors: [DynamicFieldIds.State] },
    },
    {
      id: DynamicFieldIds.City,
      name: 'City',
      fieldType: FieldType.String,
      rule: { ancestors: [DynamicFieldIds.County] },
    },
  ],
  [TemplateIds.DynamicDateTimes]: [
    {
      id: DynamicFieldIds.GrandparentDate,
      name: 'Grandparent Date',
      fieldType: FieldType.Date,
      rule: { ancestors: [] },
    },
    {
      id: DynamicFieldIds.ParentDate,
      name: 'Parent Date',
      fieldType: FieldType.Date,
      rule: { ancestors: [DynamicFieldIds.GrandparentDate] },
    },
    {
      id: DynamicFieldIds.ChildDate,
      name: 'Child Date',
      fieldType: FieldType.Date,
      rule: { ancestors: [DynamicFieldIds.ParentDate] },
    },
    {
      id: DynamicFieldIds.GrandparentTime,
      name: 'Grandparent Time',
      fieldType: FieldType.Time,
      rule: { ancestors: [] },
    },
    {
      id: DynamicFieldIds.ParentTime,
      name: 'Parent Time',
      fieldType: FieldType.Time,
      rule: { ancestors: [DynamicFieldIds.GrandparentTime] },
    },
    {
      id: DynamicFieldIds.ChildTime,
      name: 'Child Time',
      fieldType: FieldType.Time,
      rule: { ancestors: [DynamicFieldIds.ParentTime] },
    },
    {
      id: DynamicFieldIds.GrandparentDateTime,
      name: 'Grandparent DateTime',
      fieldType: FieldType.DateTime,
      rule: { ancestors: [] },
    },
    {
      id: DynamicFieldIds.ParentDateTime,
      name: 'Parent DateTime',
      fieldType: FieldType.DateTime,
      rule: { ancestors: [DynamicFieldIds.GrandparentDateTime] },
    },
    {
      id: DynamicFieldIds.ChildDateTime,
      name: 'Child DateTime',
      fieldType: FieldType.DateTime,
      rule: { ancestors: [DynamicFieldIds.ParentDateTime] },
    },
  ],
  [TemplateIds.DynamicNumbers]: [
    {
      id: DynamicFieldIds.ParentNumber,
      name: 'Parent Number',
      fieldType: FieldType.Number,
      rule: { ancestors: [] },
    },
    {
      id: DynamicFieldIds.ChildNumber,
      name: 'Child Number',
      fieldType: FieldType.Number,
      rule: { ancestors: [DynamicFieldIds.ParentNumber] },
    },
  ],
  [TemplateIds.Groups]: [
    {
      id: 10,
      name: 'Breakfast',
      fieldType: FieldType.String,
      groupId: 1,
      isMultiValue: true,
      isRequired: true
    },
    {
      id: 11,
      name: 'Lunch',
      fieldType: FieldType.String,
      groupId: 1,
      isMultiValue: true,
      defaultValue: 'hamburger'
    },
    {
      id: 12,
      name: 'Dinner',
      fieldType: FieldType.String,
      groupId: 1,
      isMultiValue: true
    },
    {
      id: 13,
      name: 'Dessert',
      fieldType: FieldType.String,
      isMultiValue: true
    },
    {
      id: 14,
      name: 'Snack',
      fieldType: FieldType.String
    }
  ]
};

export class LfFieldTemplateContainerDemoService implements LfFieldTemplateContainerService {
  readonly testTemplateInfos: TemplateInfo[] = [
    { id: TemplateIds.String, name: 'Strings' },
    { id: TemplateIds.DateTime, name: 'Dates and Times' },
    { id: TemplateIds.Number, name: 'Numbers' },
    { id: TemplateIds.DynamicLocation, name: 'Location (Dynamic)' },
    { id: TemplateIds.DynamicOneLocation, name: 'One Location (Dynamic)' },
    { id: TemplateIds.DynamicDateTimes, name: 'Dates and Times (Dynamic)' },
    { id: TemplateIds.DynamicNumbers, name: 'One Row of Numbers (Dynamic)' },
    { id: TemplateIds.Groups, name: 'Template with Groups' }
  ];

  readonly lookupTableByTemplateId = new Map<TemplateIds, LookupTable>([
    [
      TemplateIds.DynamicLocation,
      [
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.LosAngeles,
          [DynamicFieldIds.City]: City.LongBeach,
        },
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.SanBernadino,
          [DynamicFieldIds.City]: City.Riverside,
        },
        {
          [DynamicFieldIds.State]: State.OH,
          [DynamicFieldIds.County]: County.Cuyahoga,
          [DynamicFieldIds.City]: City.Strongsville,
        },
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.Orange,
          [DynamicFieldIds.City]: City.Placentia,
        },
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.Orange,
          [DynamicFieldIds.City]: City.Fullerton,
        },
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.LosAngeles,
          [DynamicFieldIds.City]: City.Hawthorne,
        },
        {
          [DynamicFieldIds.State]: State.OH,
          [DynamicFieldIds.County]: County.Hamilton,
          [DynamicFieldIds.City]: City.Cincinnati,
        },
        {
          [DynamicFieldIds.State]: State.OH,
          [DynamicFieldIds.County]: County.Cuyahoga,
          [DynamicFieldIds.City]: City.Cleveland,
        },
        {
          [DynamicFieldIds.State]: State.CA,
          [DynamicFieldIds.County]: County.LosAngeles,
          [DynamicFieldIds.City]: City.Westwood,
        },
        {
          [DynamicFieldIds.State]: State.NV,
          [DynamicFieldIds.County]: County.Clark,
          [DynamicFieldIds.City]: City.LasVegas,
        },
      ],
    ],
    [
      TemplateIds.DynamicOneLocation,
      [
        {
          [DynamicFieldIds.State]: State.NV,
          [DynamicFieldIds.County]: County.Clark,
          [DynamicFieldIds.City]: City.LasVegas,
        },
      ],
    ],
    [
      TemplateIds.DynamicDateTimes,
      [
        {
          [DynamicFieldIds.GrandparentDate]: '2020-01-02',
          [DynamicFieldIds.ParentDate]: '2020-03-04',
          [DynamicFieldIds.ChildDate]: '2020-05-06',
          [DynamicFieldIds.GrandparentTime]: '01:02',
          [DynamicFieldIds.ParentTime]: '03:04',
          [DynamicFieldIds.ChildTime]: '05:06',
          [DynamicFieldIds.GrandparentDateTime]: '2020-01-02T03:04:05.000Z',
          [DynamicFieldIds.ParentDateTime]: '2020-03-04T03:04:05.000Z',
          [DynamicFieldIds.ChildDateTime]: '2020-05-06T03:04:05.000Z',
        },
      ],
    ],
    [
      TemplateIds.DynamicNumbers,
      [
        {
          [DynamicFieldIds.ParentNumber]: '123',
          [DynamicFieldIds.ChildNumber]: '456',
        },
      ],
    ],
  ]);

  async getAvailableTemplatesAsync(): Promise<TemplateInfo[]> {
    return this.testTemplateInfos;
  }

  async getTemplateFieldsAsync(templateId: number): Promise<TemplateFieldInfo[]> {
    if (templateId === 0 || !(templateId in fieldInfosPerTemplate)) {
      return [];
    }
    return fieldInfosPerTemplate[templateId];
  }

  async getTemplateDefinitionAsync(id: string | number): Promise<TemplateInfo | undefined> {
    return this.testTemplateInfos.find((info) => info.id === id);
  }

  async getDynamicFieldValueOptionsAsync(
    templateId: number,
    currentValues: FieldValues
  ): Promise<{ [fieldId: number]: string[] }> {
    const lookupTable: LookupTable | undefined = this.lookupTableByTemplateId.get(templateId);
    if (!lookupTable) {
      return {};
    }

    const result: { [fieldId: number]: string[] } = {};
    const fieldInfos = await this.getTemplateFieldsAsync(templateId);
    for (const fieldInfo of fieldInfos) {
      if (!isDynamicField(fieldInfo)) {
        continue;
      }

      const id = fieldInfo.id;
      result[id] = [];

      const ancestors = fieldInfo.rule?.ancestors;
      const areAllAncestorsDefined = ancestors?.every(ancestorId => currentValues[ancestorId] !== undefined);
      if (!ancestors || !areAllAncestorsDefined) {
        continue;
      }

      const fieldOptions: string[] = this.getUniqueValues(lookupTable, id, (row: Row) => {
        return this.valuesAreDefinedAndMatchOnIds(row, currentValues, ancestors);
      });
      result[id] = fieldOptions;
    }
    return result;
  }

  private valuesAreDefinedAndMatchOnIds(row: Row, fieldValues: FieldValues, ids: number[]): boolean {
    for (const id of ids) {
      const fieldValue = fieldValues[id];
      const firstValue = this.getFirstFieldValue(fieldValues, id);
      if (firstValue === undefined) {
        return false;
      }

      let compareFunc = (a: string, b: string) => a === b;
      if (fieldValue.fieldType === FieldType.Date || fieldValue.fieldType === FieldType.DateTime) {
        compareFunc = DatetimeUtils.compareDateStrings;
      }

      if (!compareFunc(firstValue, row[id])) {
        return false;
      }
    }
    return true;
  }

  private getFirstFieldValue(fieldValues: FieldValues, fieldId: number): string | undefined {
    let result: string | undefined;
    const values = fieldValues[fieldId]?.values ?? undefined;
    if (values && values.length > 0) {
      result = values[0]?.value ?? '';
    }
    return result;
  }

  private getUniqueValues(lookupTable: LookupTable, selectId: DynamicFieldIds, filterFunc: (row: Row) => boolean): string[] {
    const filteredTable = lookupTable.filter(filterFunc);
    const fieldValuesWithDuplicates = filteredTable.map((row: Row) => row[selectId]);
    const fieldValues = new Set<string>(fieldValuesWithDuplicates);
    return [...fieldValues.values()];
  }
}

interface Row {
  [fieldId: number]: string;
}

type LookupTable = Row[];
