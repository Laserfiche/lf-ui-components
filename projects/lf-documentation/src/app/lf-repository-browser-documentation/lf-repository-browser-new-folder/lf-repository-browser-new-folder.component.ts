import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-lf-repository-browser-new-folder-component',
  templateUrl: './lf-repository-browser-new-folder.component.html',
  styleUrls: ['./lf-repository-browser-new-folder.component.css']
})
export class LfRepositoryBrowserNewFolderComponent {

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: {addNewFolder: (folderName: string) => Promise<void>}
    ) { }

  async onButtonClick(event: string) {
    const buttonName = event;
    this.dialogRef.close(buttonName);
  }

}
