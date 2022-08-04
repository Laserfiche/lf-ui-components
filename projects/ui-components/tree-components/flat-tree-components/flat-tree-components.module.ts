import { NgModule, Injector, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { LfFileExplorerComponent } from './lf-file-explorer/lf-file-explorer.component';
import { LfFolderBrowserComponent } from './lf-folder-browser/lf-folder-browser.component';
import { LfToolbarComponent } from './lf-toolbar/lf-toolbar.component';
import { LfFileExplorerNewFolderComponent } from './lf-file-explorer-new-folder/lf-file-explorer-new-folder.component';
import { LfModalsModule, LfLoaderModule, LfBreadcrumbsModule } from '@laserfiche/lf-ui-components/shared';
import { LfNewFolderDialogModalModule } from './lf-new-folder-dialog-modal/lf-new-folder-dialog-modal.module';

@NgModule({
  declarations: [
    LfFileExplorerComponent,
    LfFolderBrowserComponent,
    LfToolbarComponent,
    LfFileExplorerNewFolderComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatListModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    LfLoaderModule,
    LfModalsModule,
    LfNewFolderDialogModalModule,
    LfBreadcrumbsModule
  ],
  bootstrap: [
    LfFileExplorerComponent,
    LfFolderBrowserComponent,
    LfToolbarComponent,
  ],
  exports: [
    LfFileExplorerComponent,
    LfFolderBrowserComponent,
    LfToolbarComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FlatTreeComponentsModule {
  /** @internal */
  constructor(
    /** @internal */ injector: Injector
  ) {
    const fileExplorerElementName: string = 'lf-file-explorer';
    if (window.customElements && !customElements.get(fileExplorerElementName)) {
      const fileExplorerElement = createCustomElement(LfFileExplorerComponent, { injector });
      customElements.define(fileExplorerElementName, fileExplorerElement);
    }

    const folderBrowserElementName: string = 'lf-folder-browser';
    if (window.customElements && !customElements.get(folderBrowserElementName)) {
      const folderBrowserElement = createCustomElement(LfFolderBrowserComponent, { injector });
      customElements.define(folderBrowserElementName, folderBrowserElement);
    }

    const toolbarElementName: string = 'lf-toolbar';
    if (window.customElements && !customElements.get(toolbarElementName)) {
      const toolbarElement = createCustomElement(LfToolbarComponent, { injector });
      customElements.define(toolbarElementName, toolbarElement);
    }

  }
}
