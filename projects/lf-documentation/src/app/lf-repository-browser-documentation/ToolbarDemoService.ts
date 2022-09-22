import { ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LfToolbarService, ToolbarOption } from '@laserfiche/lf-ui-components/shared';
import { LfRepositoryBrowserNewFolderComponent } from './lf-repository-browser-new-folder/lf-repository-browser-new-folder.component';
import { LfRepositoryBrowserComponent } from '../../../../ui-components/lf-repository-browser/lf-repository-browser.component';
import { DemoRepoService } from './demo-repo-service';

export class LfToolbarDemoService implements LfToolbarService {
  _toolbarOptions: ToolbarOption[] = [
    {
      name: 'refresh',
      disabled: false,
      tag: 'REFRESH',
      handler: async () => {
        await this.repoBrowserRef.nativeElement.refreshAsync();
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
  // dataService: DemoRepoService;
  getToolbarOptions() {
    return this._toolbarOptions;
  }
  constructor(private repoBrowserRef: ElementRef<LfRepositoryBrowserComponent>, public popupDialog: MatDialog, public dataService: DemoRepoService) {
    // this.dataService = this.repoBrowserRef.nativeElement.treeNodeService as DemoRepoService;

  }

  /** @internal */
  private async addNewFolderAsync(): Promise<void> {
    // await this.zone.run(async () => {
    const result = await this.openNewFolderDialogAsync();
    if (result === 'OK') {
      await this.repoBrowserRef.nativeElement.refreshAsync();
    }
    // });
  }

  async openNewFolderDialogAsync(): Promise<any> {
    // const data: NewFolderDialogDataTest = {
    //     treeService: this.repoBrowserRef.nativeElement.treeNodeService,
    //     parentNode: this.repoBrowserRef.nativeElement.currentFolder!
    // };
    // TODO how to get parentNode --- do we just need it for the name?
    const currentParentNode = this.repoBrowserRef.nativeElement.currentFolder;
    const dialogRef = this.popupDialog.open(LfRepositoryBrowserNewFolderComponent, {
      data: { addNewFolder: async (name: string) => { await this.dataService.addNewFolderAsync(name, currentParentNode); } },
      width: '430px',
    });
    const result = await dialogRef.afterClosed().toPromise();
    return result;
  }
}
