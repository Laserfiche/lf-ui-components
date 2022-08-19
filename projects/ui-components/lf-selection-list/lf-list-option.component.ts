import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';
import { ILfSelectable } from '@laserfiche/lf-ui-components/shared';

@Component({
  selector: 'lf-list-option-component',
  templateUrl: './lf-list-option.component.html',
  styleUrls: ['./lf-list-option.component.css']
})
/**
 * @internal
 */
export class LfListOptionComponent  {
  @ViewChild('focuselement', { static: true })
    focusElement?: ElementRef;

  @Input() set focused(value: boolean) {
    this._focused = value;
    if (!value) {
      return;
    }
    let currentFocusEle = document.activeElement;
    // We do not what the steal the focus from our viewport
    if (currentFocusEle == null || currentFocusEle.nodeName.toLowerCase() === 'cdk-virtual-scroll-viewport') { return; }
    // If we go up the parent tree and find that we are under the viewport than we will take focus
    while (currentFocusEle !== null && currentFocusEle.nodeName.toLowerCase() !== 'cdk-virtual-scroll-viewport') {
      currentFocusEle = currentFocusEle.parentElement;
    }
    if (currentFocusEle !== null) {
      this.focusElement?.nativeElement.focus();
    }
  };
  get focused(): boolean { return this._focused; }
  @Input() item?: ILfSelectable;
  @Input() listItemRef?: TemplateRef<unknown>;
  @Input() multipleSelection: boolean = false;
  
  private _focused = false;

  focus() {
    this._focus();
  }

  onCheckboxClicked(event: MouseEvent) {
    event.preventDefault();
  }

  _setTabIndex(focused: boolean) {
    return focused ? 0 : -1;
  }

  private _focus(tries: number = 0) {
    if (tries >= 10) { return; }
    if (this.focusElement == null) {
      setTimeout(this._focus.bind(this, tries + 1));
      return;
    }
    this.focusElement?.nativeElement.focus();
  }

}
