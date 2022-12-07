import { Injectable } from '@angular/core';
import { FieldValues, LfFieldInfo, TemplateFieldInfo, TemplateInfo } from './../../../../ui-components/lf-metadata/field-components/utils/lf-field-types';
import { LfFieldContainerService } from './../../../../ui-components/lf-metadata/lf-field-container/public-api';
import { FieldFormat, FieldType } from './../../../../ui-components/shared/lf-shared-public-api';

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
        defaultValue: 'Bowl',
        displayName: 'Order Type'
      },
      {
        name: 'Proteins',
        id: 2,
        fieldType: FieldType.String,
        isMultiValue: true,
        defaultValue: 'Tofu',
        displayName: 'Proteins'
      },
      {
        name: 'Veggies',
        id: 3,
        fieldType: FieldType.String,
        isMultiValue: true,
        defaultValue: 'Kale',
        displayName: 'Veggies'
      },
      {
        name: 'Drink',
        id: 4,
        fieldType: FieldType.String,
        defaultValue: 'Water',
        displayName: 'Drink'
      },
      {
        name: 'Order Total',
        id: 5,
        fieldType: FieldType.Number,
        format: FieldFormat.Currency,
        currency: 'USD',
        isRequired: true,
        defaultValue: '12.95',
        displayName: 'Order Total'
      },
      {
        name: 'Subject',
        id: 11,
        fieldType: FieldType.String,
        isRequired: true,
        displayName: 'Subject'
      },
      {
        name: 'Sender',
        id: 12,
        fieldType: FieldType.String,
        isRequired: true,
        displayName: 'Sender'
      },
      {
        name: 'Time Received',
        id: 13,
        fieldType: FieldType.DateTime,
        format: FieldFormat.ShortDateTime,
        isRequired: true,
        displayName: 'Time Received'
      },
      {
        name: 'Recipients',
        id: 14,
        fieldType: FieldType.String,
        isMultiValue: true,
        isRequired: true,
        displayName: 'Recipients'
      },
      {
        name: 'Comments',
        id: 15,
        fieldType: FieldType.String,
        displayName: 'Comments'
      },
      {
        name: 'Date Sent',
        id: 16,
        fieldType: FieldType.Date,
        format: FieldFormat.ShortDate,
        isRequired: true,
        displayName: 'Date Sent'
      },
      {
        name: 'Test Blob',
        id: 17,
        fieldType: FieldType.Blob,
        displayName: 'Test Blob'
      },
    ];
    return allFieldInfos;
  }

  async getTemplateDefinitionAsync(id: string | number): Promise<TemplateInfo | undefined> {
    const allTemplates: TemplateInfo[] = [
      { id: 1, name: 'Lunch Orders', displayName: 'Lunch Orders Display Name'},
      { id: 2, name: 'Email', displayName: 'Email Display Name' }
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
      { id: 1, name: 'Lunch Orders', displayName: 'Lunch Orders' },
      { id: 2, name: 'Email', displayName: 'Email' }
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
            defaultValue: 'Bowl',
            displayName: 'Order Type'
          },
          {
            name: 'Proteins',
            id: 2,
            fieldType: FieldType.String,
            isMultiValue: true,
            defaultValue: 'Tofu',
            displayName: 'Proteins  '
          },
          {
            name: 'Veggies',
            id: 3,
            fieldType: FieldType.String,
            isMultiValue: true,
            defaultValue: 'Kale',
            displayName: 'Veggies'
          },
          {
            name: 'Drink',
            id: 4,
            fieldType: FieldType.String,
            defaultValue: 'Water',
            displayName: 'Drink'
          },
          {
            name: 'Order Total',
            id: 5,
            fieldType: FieldType.Number,
            format: FieldFormat.Currency,
            currency: 'USD',
            isRequired: true,
            defaultValue: '12.95',
            displayName: 'Order Total'
          },
          {
            name: 'Test Blob',
            id: 17,
            fieldType: FieldType.Blob,
            displayName: 'Test Blob'
          }
        ];
        return lunchFields;
      case 2:
        const emailFields: TemplateFieldInfo[] = [
          {
            name: 'Subject',
            id: 11,
            fieldType: FieldType.String,
            isRequired: true,
            displayName: "Subject"
          },
          {
            name: 'Sender',
            id: 12,
            fieldType: FieldType.String,
            isRequired: true,
            displayName: 'Sender'
          },
          {
            name: 'Time Received',
            id: 13,
            fieldType: FieldType.DateTime,
            format: FieldFormat.ShortDateTime,
            isRequired: true,
            displayName: 'Time Received'
          },
          {
            name: 'Recipients',
            id: 14,
            fieldType: FieldType.String,
            isMultiValue: true,
            isRequired: true,
            displayName: 'Recipients'
          },
          {
            name: 'Comments',
            id: 15,
            fieldType: FieldType.String,
            displayName: 'Comments'
          },
          {
            name: 'Date Sent',
            id: 16,
            fieldType: FieldType.Date,
            format: FieldFormat.ShortDate,
            isRequired: true,
            displayName: 'Date Sent'
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
