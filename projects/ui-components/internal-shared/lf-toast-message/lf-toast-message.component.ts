import { Component, Input } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

/** @internal */
export enum LfMessageToastTypes {
  Error='Error',
  Warning='Warning',
  Validation='Validation',
  Informational='Informational',
}

/** @internal */
export interface LfToastMessage {
  message: string;
  timeToShow?: number;
  type: LfMessageToastTypes;
  noIcon: boolean;
  hideMessage?: boolean;

  id?: string;
  doNotShowLabel?: string;
}

/** @internal */
@Component({
  selector: 'lf-toast-message',
  templateUrl: './lf-toast-message.component.html',
  styleUrls: ['./lf-toast-message.component.css'],
})

export class LfToastMessageComponent {
  form = new UntypedFormGroup({});

  @Input()
  set messages(messages: LfToastMessage[]) {
    if (typeof messages === 'undefined') {
      return;
    }
    for (const message of messages) {
      let messageId = message.id;
      if (messageId) {
        this.form.addControl(messageId, new UntypedFormControl());
      } else {
        messageId = message.id = Math.random().toString();
      }

      this.allMessages.push(message);
      // Errors and Warnings will not auto dismiss
      if (
        (message.type === LfMessageToastTypes.Validation || message.type === LfMessageToastTypes.Informational) &&
        message.timeToShow &&
        message.timeToShow > 0
      ) {
        window.setTimeout(this._removeToast.bind(this, messageId), message.timeToShow);
      }
    }
  }

  allMessages: LfToastMessage[];
  getCheckboxControl(messageId: string) {
    return this.form.controls[messageId];
  }

  constructor() {
    this.allMessages = [];
  }

  _computeTypeIcon(type: LfMessageToastTypes): string {
    switch (type) {
      case LfMessageToastTypes.Validation:
        return 'check_circle_outline';
      case LfMessageToastTypes.Warning:
        return 'warning_amber';
      case LfMessageToastTypes.Informational:
        return 'info';
      default:
        return 'error_outline';
    }
  }


  _closeToast(messageId: string) {
    this._removeToast(messageId);
  }

  _removeToast(messageId: string) {
    const checkboxControl = this.getCheckboxControl(messageId);

    const idx = this.allMessages.findIndex((message) => message.id === messageId);
    if (idx !== -1) {
      this.allMessages.splice(idx, 1);
    }
  }

  clearToasts(toastFilter?: LfMessageToastTypes) {
    this.allMessages = toastFilter ? this.allMessages.filter((message) => message.type !== toastFilter) : [];
  }
}
