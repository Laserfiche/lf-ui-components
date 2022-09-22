import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'lf-file-explorer-new-folder-component',
  templateUrl: './lf-file-explorer-new-folder.component.html',
  styleUrls: ['./lf-file-explorer-new-folder.component.css']
})
export class LfFileExplorerNewFolderComponent {

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: {addNewFolder: (folderName: string) => Promise<void>}
  ) { }

  onButtonClick(event: string) {
    const buttonName = event;
    this.dialogRef.close(buttonName);
  }

}
