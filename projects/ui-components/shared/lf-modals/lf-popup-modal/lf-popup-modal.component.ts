import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * @internal
 * Not for public use
 */
@Component({
  selector: 'lf-popup-modal-component',
  templateUrl: './lf-popup-modal.component.html',
  styleUrls: ['./lf-popup-modal.component.css']
})
export class LfPopupModalComponent {
  @Input() data!: PopupModalData;
  @Output() buttonClick: EventEmitter<string> = new EventEmitter<string>();

  /** @internal */
  onConfirmClick(): void {
    this.buttonClick.emit(PopupModalResult.CONFIRM);
  }

  /** @internal */
  onCancelClick(): void {
    this.buttonClick.emit(PopupModalResult.CANCEL);
  }

  /** @internal */
  onNoClick(): void {
    this.buttonClick.emit(PopupModalResult.NO);
  }
}

/** @internal */
export interface PopupModalData {
  popupTitle: Observable<string>;
  popupMessage: Observable<string>;
  confirmButtonText?: Observable<string>;
  cancelButtonText?: Observable<string>;
  noButtonText?: Observable<string>;
  data?: any;
}

/** @internal */
export enum PopupModalResult {
  CONFIRM = 'CONFIRM',
  NO='NO',
  CANCEL='CANCEL'
}