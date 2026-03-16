// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IconUtils } from '@laserfiche/lf-js-utils';
import { ToolbarOption, LfToolbarComponent } from './../../../../ui-components/shared/lf-toolbar/lf-toolbar-public-api';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-toolbar-documentation',
  templateUrl: './lf-toolbar-documentation.component.html',
  styleUrls: ['./lf-toolbar-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfToolbarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfToolbarDocumentationComponent {
  elementToolbarOptions: ToolbarOption[] = [
    { name: 'Refresh', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'New Folder', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Download', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Scan', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Rename', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Share', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
  ];
  selectedElementOption?: string;

  private elementOptionsDisabled: boolean = false;

  constructor() {}

  get enableDisableElementText(): string {
    return this.elementOptionsDisabled ? 'Enable all options' : 'Disable all options';
  }

  onElementOptionSelected(option: ToolbarOption | undefined) {
    this.selectedElementOption = JSON.stringify(option, null, 2);
  }

  enableDisableElement(): void {
    this.elementOptionsDisabled = !this.elementOptionsDisabled;
    this.elementToolbarOptions = this.elementToolbarOptions.map((option) => {
      option.disabled = this.elementOptionsDisabled;
      return option;
    });
  }
}
