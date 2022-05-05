import { Component } from '@angular/core';
import { ToolbarOption } from '@laserfiche/types-lf-ui-components';

@Component({
  selector: 'app-lf-toolbar-documentation',
  templateUrl: './lf-toolbar-documentation.component.html',
  styleUrls: ['./lf-toolbar-documentation.component.css', './../app.component.css']
})
export class LfToolbarDocumentationComponent {

  elementToolbarOptions: ToolbarOption[] = [
    { name: 'Refresh', disabled: false, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
    { name: 'New Folder', disabled: true, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
    { name: 'Download', disabled: true, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
    { name: 'Scan', disabled: true, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
    { name: 'Rename', disabled: false, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
    { name: 'Share', disabled: false, icon: 'https://lfxstatic.com/Site/laserfiche-ui-components/2.0/file.svg' },
  ];
  selectedElementOption?: string;

  private elementOptionsDisabled: boolean = false;

  constructor() { }

  get enableDisableElementText(): string {
    return this.elementOptionsDisabled ? 'Enable all options' : 'Disable all options';
  }

  onElementOptionSelected(option: CustomEvent<ToolbarOption | undefined>) {
    this.selectedElementOption = JSON.stringify(option.detail, null, 2);
  }

  enableDisableElement(): void {
    this.elementOptionsDisabled = !this.elementOptionsDisabled;
    this.elementToolbarOptions = this.elementToolbarOptions.map((option) => {
      option.disabled = this.elementOptionsDisabled;
      return option;
    });
  }
}
