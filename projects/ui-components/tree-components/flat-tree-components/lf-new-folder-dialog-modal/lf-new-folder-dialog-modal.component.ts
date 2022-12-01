import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';
import { LfTreeService, TreeNode } from '../../utils/lf-tree.service';

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
  readonly NEW_FOLDER = this.localizationService.getStringLaserficheObservable('NEW_FOLDER');

  /** @internal */
  readonly UNKNOWN_ERROR = this.localizationService.getStringLaserficheObservable('UNKNOWN_ERROR');

  /** @internal */
  readonly NAME = this.localizationService.getStringLaserficheObservable('NAME');

  /** @internal */
  readonly OK = this.localizationService.getStringLaserficheObservable('OK');

  /** @internal */
  readonly CANCEL = this.localizationService.getStringLaserficheObservable('CANCEL');

  /** @internal */
  readonly CLOSE = this.localizationService.getStringLaserficheObservable('CLOSE');

  @Input() data?: NewFolderDialogData;
  @Output() buttonClick: EventEmitter<string> = new EventEmitter<string>();

  /** @internal */
  constructor(
    /** @internal */
    private localizationService: AppLocalizationService
  ) { }

  /** @internal */
  async onOkClickAsync(): Promise<void> {
    try {
      if (!this.data?.treeService.addNewFolderAsync) {
        throw new Error();
      }
      await this.data.treeService.addNewFolderAsync(this.data.parentNode, this.folderName);
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

export interface NewFolderDialogData {
  treeService: LfTreeService;
  parentNode: TreeNode;
}
