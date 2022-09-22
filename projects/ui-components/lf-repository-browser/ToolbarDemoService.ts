import { ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LfToolbarService, ToolbarOption } from '@laserfiche/lf-ui-components/shared';
import { LfRepositoryBrowserNewFolderComponent } from './lf-repository-browser-new-folder/lf-repository-browser-new-folder.component';
import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';

export class LfToolbarDemoService implements LfToolbarService {
  _toolbarOptions: ToolbarOption[] = [
    {
      name: 'refresh',
      disabled: false,
      tag: 'REFRESH',
      handler: async () => {
        console.log('refresh');
      },
    },
    {
      name: 'new folder',
      disabled: false,
      tag: 'NEW_FOLDER',
      handler: this.addNewFolderAsync.bind(this),
    },
  ];
  getToolbarOptions() {
    return this._toolbarOptions;
  }
  constructor(private repoBrowserRef: ElementRef<LfRepositoryBrowserComponent>, public popupDialog: MatDialog) {}

  /** @internal */
  private async addNewFolderAsync(): Promise<void> {
    // await this.zone.run(async () => {
    const result = await this.openNewFolderDialogAsync();
    if (result === 'OK') {
      // Should not be localized
      await this.repoBrowserRef.nativeElement.refreshAsync();
    }
    // });
  }

  async openNewFolderDialogAsync(): Promise<any> {
    // const data: NewFolderDialogDataTest = {
    //     treeService: this.repoBrowserRef.nativeElement.treeNodeService,
    //     parentNode: this.repoBrowserRef.nativeElement.currentFolder!
    // };
    const dialogRef = this.popupDialog.open(LfRepositoryBrowserNewFolderComponent, {
        width: '430px',
    });
    const result = await dialogRef.afterClosed().toPromise();
    return false;
  }
}
