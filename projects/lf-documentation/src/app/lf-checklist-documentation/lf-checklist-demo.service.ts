import { Injectable } from '@angular/core';
import { Checklist } from '@laserfiche/types-laserfiche-ui-components';

@Injectable({
  providedIn: 'root'
})
export class LfChecklistDemoService {

  private demoChecklists: Checklist[] = [{
    name: 'First Checklist',
    checklistItems: [{
      icon: `./file.svg`,
      name: 'Item 1!',
      id: '1',
      disabled: false,
      checked: true,
      editable: false,
      constraintError: 'Does not follow constraint',
      constraint: '^[^\\\\]*$',
      isRequired: true,
      requiredError: 'Field name is required'
    },
    {
      icon: `./folder.svg`,
      name: 'Item 2!',
      id: '2',
      disabled: false,
      checked: true,
      editable: true,
      constraintError: 'Does not follow constraint',
      constraint: '^[^\\\\]*$',
      isRequired: true
    },
    {
      icon: `./file.svg`,
      name: 'Item 3!',
      id: '3',
      disabled: false,
      checked: false,
      editable: true,
      constraintError: 'Does not follow constraint',
      constraint: '^[^\\\\]*$',
      isRequired: true,
      requiredError: 'Field name is required'
    }],
    checklistOptions: [{
      name: 'disabled option',
      disabled: true,
      checked: true
    },
    {
      name: 'enabled option',
      disabled: false,
      checked: true
    },
    {
      name: 'check all items',
      disabled: false,
      checked: false
    }]
  },
  {
    name: 'Second Checklist with OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    checklistItems: [{
      icon: `./lf-80.png`,
      name: 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      id: '1',
      disabled: true,
      checked: true,
      editable: false
    },
    {
      icon: `./lf-80.png`,
      name: 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      id: '2',
      disabled: true,
      checked: false,
      editable: true
    }],
    checklistOptions: [{
      name: 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      disabled: false,
      checked: true
    },
    {
      name: 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      disabled: true,
      checked: true
    }]
  }];

  loadChecklistsAsync(): Promise<Checklist[]> {
    return new Promise((resolve, reject) => {
      resolve(this.demoChecklists);
    });
  }

  checkFirstChecklistItems() {
    const firstChecklistItems = this.demoChecklists[0].checklistItems;
    firstChecklistItems.forEach(item => {
      item.checked = true;
    });
  }
}
