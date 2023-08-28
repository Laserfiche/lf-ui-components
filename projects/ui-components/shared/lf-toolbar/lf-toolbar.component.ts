import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lf-toolbar-component',
  templateUrl: './lf-toolbar.component.html',
  styleUrls: ['./lf-toolbar.component.css']
})
export class LfToolbarComponent {

  // TODO: if there is not enough room for displayed options, put everything in dropdown
  @Input() displayed_options: ToolbarOption[] = [];
  @Input() dropdown_options: ToolbarOption[] = [];
  @Output() optionSelected: EventEmitter<ToolbarOption> = new EventEmitter<ToolbarOption>();

  /** @internal */
  constructor() {}

  /** @internal */
  onClickButton(option: ToolbarOption): void {
    this.optionSelected.emit(option);
  }

  /** @internal */
  getIcons(option: ToolbarOption): string[] {
    if (!option.icon) {
      return [];
    }
    if (typeof (option.icon) === 'string') {
      return [option.icon];
    }
    else {
      return option.icon;
    }
  }
}

export interface ToolbarOption {
  name: string;
  disabled: boolean;
  icon?: string[] | string;
  children?: ToolbarOption[];
  tag?: any;
}
