import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppLocalizationService } from '../app-localization.service';

@Component({
  selector: 'lf-new-folder-dialog-modal-component',
  templateUrl: './lf-new-folder-dialog-modal.component.html',
  styleUrls: ['./lf-new-folder-dialog-modal.component.css']
})
export class LfNewFolderDialogModalComponent {
  /** @internal */
  folderName: string = '';
  /** @internal */
  errorMessage?: string;

  /** @internal */
  readonly NEW_FOLDER = this.localizationService.getStringObservable('NEW_FOLDER');

  /** @internal */
  readonly UNKNOWN_ERROR = this.localizationService.getStringObservable('UNKNOWN_ERROR');

  /** @internal */
  readonly NAME = this.localizationService.getStringObservable('NAME');

  /** @internal */
  readonly OK = this.localizationService.getStringObservable('OK');

  /** @internal */
  readonly CANCEL = this.localizationService.getStringObservable('CANCEL');

  /** @internal */
  readonly CLOSE = this.localizationService.getStringObservable('CLOSE');

  @Output() buttonClick: EventEmitter<string> = new EventEmitter<string>();

  /** @internal */
  constructor(
    /** @internal */
    private localizationService: AppLocalizationService,
    @Inject(MAT_DIALOG_DATA) public data: {addNewFolder: (folderName: string) => Promise<void>}
  ) { }

  /** @internal */
  async onOkClickAsync(): Promise<void> {
    try {
      await this.data.addNewFolder(this.folderName);
      this.errorMessage = undefined;
      this.buttonClick.emit('OK'); // Should not be localized
    }
    catch (err: any) {
      const errorMessage = (err.title ?? err.message) ?? this.UNKNOWN_ERROR;
      this.errorMessage = errorMessage;
    }
  }

  /** @internal */
  onClickClose() {
    this.buttonClick.emit('CLOSE');
  }

  /** @internal */
  onClickCancel() {
    this.buttonClick.emit('CANCEL');
  }
}
