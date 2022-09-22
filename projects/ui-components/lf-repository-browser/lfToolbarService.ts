import { ElementRef, NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LfFileExplorerNewFolderComponent } from "../tree-components/flat-tree-components/lf-file-explorer-new-folder/lf-file-explorer-new-folder.component";
import { NewFolderDialogDataTest } from "../tree-components/flat-tree-components/lf-new-folder-dialog-modal/lf-new-folder-dialog-modal.component";
import { ToolbarOption } from "../tree-components/lf-tree-components-public-api";
import { LfTreeNode, LfTreeNodeService } from "./ILfTreeNodeService";
import { LfRepositoryBrowserComponent } from "./lf-repository-browser.component";

export declare interface LfToolbarService {
  getToolbarOptions(): ToolbarOption[];
}


export class LfToolbarDemoService implements LfToolbarService {
  _toolbarOptions: ToolbarOption[] = [
    {
      name: 'refresh',
      disabled: false,
      tag: 'REFRESH',
      handler: this.repoBrowserRef.nativeElement.refreshAsync,
    },
    {
      name: 'new folder',
      disabled: false,
      tag: 'NEW_FOLDER',
      handler: this.addNewFolderAsync.bind(this)
    }
  ];
  zone: NgZone;
  getToolbarOptions() {
    return this._toolbarOptions;
  }
  constructor(public repoBrowserRef: ElementRef<LfRepositoryBrowserComponent>,
    public popupDialog: MatDialog) {
      this.zone = this.repoBrowserRef.nativeElement.zone;
  }


  /** @internal */
  private async addNewFolderAsync(): Promise<void> {
    // await this.zone.run(async () => {
      const result = await this.openNewFolderDialogAsync();
      if (result === 'OK') { // Should not be localized
        await this.repoBrowserRef.nativeElement.refreshAsync();
      }
    // });
  }

  async openNewFolderDialogAsync(): Promise<any> {
    const data: NewFolderDialogDataTest = {
        treeService: this.repoBrowserRef.nativeElement.treeNodeService,
        parentNode: this.repoBrowserRef.nativeElement.currentFolder!
    };
    const dialogRef = this.popupDialog.open(LfFileExplorerNewFolderComponent, {
        width: '430px',
        data: data
    });
    const result = await dialogRef.afterClosed().toPromise();
    return result;
}

}
