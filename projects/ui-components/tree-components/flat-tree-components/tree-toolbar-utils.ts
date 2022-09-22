import { MatDialog } from '@angular/material/dialog';
import { LfFileExplorerNewFolderComponent } from './lf-file-explorer-new-folder/lf-file-explorer-new-folder.component';
import { LfTreeService, TreeNode } from '../utils/lf-tree.service';

export async function openNewFolderDialogAsync(
  treeService: LfTreeService,
  parentNode: TreeNode,
  popupDialog: MatDialog
): Promise<any> {
  const dialogRef = popupDialog.open(LfFileExplorerNewFolderComponent, {
    width: '430px',
    data: {
      addNewFolder: async (name: string) => {
        if (treeService.addNewFolderAsync) {
          await treeService.addNewFolderAsync(parentNode, name);
        }
        else {
          throw new Error('addNewFolderAsync does not exist on TreeNodeService.');
        }
      }
    }
  });
  const result = await dialogRef.afterClosed().toPromise();
  return result;
}
