import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfNewFolderDialogModalComponent } from './lf-new-folder-dialog-modal.component';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';



@NgModule({
  declarations: [
    LfNewFolderDialogModalComponent
  ],
  imports: [
    FormsModule,
    CommonModule,
    MatInputModule
  ],
  bootstrap: [LfNewFolderDialogModalComponent],
  exports: [LfNewFolderDialogModalComponent]
})
export class LfNewFolderDialogModalModule { }
