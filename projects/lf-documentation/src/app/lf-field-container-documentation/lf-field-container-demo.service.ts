import { Injectable } from '@angular/core';
import {
  FieldValues,
  LfFieldInfo,
  TemplateFieldInfo,
  TemplateInfo,
  LfFieldContainerService,
  FieldType,
  FieldFormat}
  from '@laserfiche/types-lf-ui-components';

@Injectable({
  providedIn: 'root'
})
export class LfFieldContainerDemoService implements LfFieldContainerService {

  async getAllFieldDefinitionsAsync(): Promise<LfFieldInfo[]> {
    const allFieldInfos: LfFieldInfo[] = [
      {
        name: 'Order Type',
        id: 1,
        fieldType: FieldType.List,
        listValues: ['Burrito', 'Taco', 'Quesadilla', 'Bowl'],
        isRequired: true,
        defaultValue: 'Bowl'
      },
      {
        name: 'Proteins',
        id: 2,
        fieldType: FieldType.String,
        isMultiValue: true,
        defaultValue: 'Tofu'
      },
      {
        name: 'Veggies',
        id: 3,
        fieldType: FieldType.String,
        isMultiValue: true,
        defaultValue: 'Kale'
      },
      {
        name: 'Drink',
        id: 4,
        fieldType: FieldType.String,
        defaultValue: 'Water'
      },
      {
        name: 'Order Total',
        id: 5,
        fieldType: FieldType.Number,
        format: FieldFormat.Currency,
        currency: 'USD',
        isRequired: true,
        defaultValue: '12.95'
      },
      {
        name: 'Subject',
        id: 11,
        fieldType: FieldType.String,
        isRequired: true
      },
      {
        name: 'Sender',
        id: 12,
        fieldType: FieldType.String,
        isRequired: true
      },
      {
        name: 'Time Received',
        id: 13,
        fieldType: FieldType.DateTime,
        format: FieldFormat.ShortDateTime,
        isRequired: true
      },
      {
        name: 'Recipients',
        id: 14,
        fieldType: FieldType.String,
        isMultiValue: true,
        isRequired: true
      },
      {
        name: 'Comments',
        id: 15,
        fieldType: FieldType.String
      },
      {
        name: 'Date Sent',
        id: 16,
        fieldType: FieldType.Date,
        format: FieldFormat.ShortDate,
        isRequired: true
      },
    ];
    return allFieldInfos;
  }

  async getTemplateDefinitionAsync(id: string | number): Promise<TemplateInfo | undefined> {
    const allTemplates: TemplateInfo[] = [
      { id: 1, name: 'Lunch Orders' },
      { id: 2, name: 'Email' }
    ];
    if (typeof (id) === 'string') {
      return allTemplates.find((info) => info.name === id);
    }
    else {
      return allTemplates.find((info) => info.id === id);
    }
  }

  async getAvailableTemplatesAsync(): Promise<TemplateInfo[]> {
    const allTemplates: TemplateInfo[] = [
      { id: 1, name: 'Lunch Orders' },
      { id: 2, name: 'Email' }
    ];
    return allTemplates;
  }

  async getTemplateFieldsAsync(templateId: number): Promise<TemplateFieldInfo[]> {
    switch (templateId) {
      case 1:
        const lunchFields: TemplateFieldInfo[] = [
          {
            name: 'Order Type',
            id: 1,
            fieldType: FieldType.List,
            listValues: ['Burrito', 'Taco', 'Quesadilla', 'Bowl'],
            isRequired: true,
            defaultValue: 'Bowl'
          },
          {
            name: 'Proteins',
            id: 2,
            fieldType: FieldType.String,
            isMultiValue: true,
            defaultValue: 'Tofu'
          },
          {
            name: 'Veggies',
            id: 3,
            fieldType: FieldType.String,
            isMultiValue: true,
            defaultValue: 'Kale'
          },
          {
            name: 'Drink',
            id: 4,
            fieldType: FieldType.String,
            defaultValue: 'Water'
          },
          {
            name: 'Order Total',
            id: 5,
            fieldType: FieldType.Number,
            format: FieldFormat.Currency,
            currency: 'USD',
            isRequired: true,
            defaultValue: '12.95'
          }
        ];
        return lunchFields;
      case 2:
        const emailFields: TemplateFieldInfo[] = [
          {
            name: 'Subject',
            id: 11,
            fieldType: FieldType.String,
            isRequired: true
          },
          {
            name: 'Sender',
            id: 12,
            fieldType: FieldType.String,
            isRequired: true
          },
          {
            name: 'Time Received',
            id: 13,
            fieldType: FieldType.DateTime,
            format: FieldFormat.ShortDateTime,
            isRequired: true
          },
          {
            name: 'Recipients',
            id: 14,
            fieldType: FieldType.String,
            isMultiValue: true,
            isRequired: true
          },
          {
            name: 'Comments',
            id: 15,
            fieldType: FieldType.String
          },
          {
            name: 'Date Sent',
            id: 16,
            fieldType: FieldType.Date,
            format: FieldFormat.ShortDate,
            isRequired: true
          },
        ];
        return emailFields;
      default:
        return [];
    }
  }

  async getDynamicFieldValueOptionsAsync(templateId: number, currentValues: FieldValues): Promise<{ [fieldId: number]: string[] }> {
    return {};
  }

}
