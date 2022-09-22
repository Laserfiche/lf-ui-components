import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'lf-repository-browser-new-folder-component',
  templateUrl: './lf-repository-browser-new-folder.component.html',
  styleUrls: ['./lf-repository-browser-new-folder.component.css']
})
export class LfRepositoryBrowserNewFolderComponent {

  constructor(
    public dialogRef: MatDialogRef<any>,
  ) { }

  onButtonClick(event: string) {
    const buttonName = event;
    this.dialogRef.close(buttonName);
  }

}
