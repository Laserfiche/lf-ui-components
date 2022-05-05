import { MatDialog } from '@angular/material/dialog';
import { LfFileExplorerNewFolderComponent } from './lf-file-explorer-new-folder/lf-file-explorer-new-folder.component';
import { LfTreeService, TreeNode } from '../utils/lf-tree.service';
import { NewFolderDialogData } from './lf-new-folder-dialog-modal/lf-new-folder-dialog-modal.component';

export async function openNewFolderDialogAsync(treeService: LfTreeService, parentNode: TreeNode, popupDialog: MatDialog): Promise<any> {
    const data: NewFolderDialogData = {
        treeService: treeService,
        parentNode: parentNode
    };
    const dialogRef = popupDialog.open(LfFileExplorerNewFolderComponent, {
        width: '430px',
        data: data
    });
    const result = await dialogRef.afterClosed().toPromise();
    return result;
}
