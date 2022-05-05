import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LfFolderBrowserComponent, LfTreeProviders, TreeNode } from '@laserfiche/types-laserfiche-ui-components';
import { LfTreeDemoFolderBrowserService } from '../lf-tree-documentation/lf-tree-demo-folder-browser.service';

@Component({
  selector: 'app-lf-folder-browser-documentation',
  templateUrl: './lf-folder-browser-documentation.component.html',
  styleUrls: ['./lf-folder-browser-documentation.component.css', './../app.component.css']
})
export class LfFolderBrowserDocumentationComponent implements AfterViewInit {

  @ViewChild('folderBrowser') lfFolderBrowserElement!: ElementRef<LfFolderBrowserComponent>;

  elementProviders: LfTreeProviders = { treeService: new LfTreeDemoFolderBrowserService() };
  elementOpenToFolderId = 'Documents/Nested1/Nested2';
  elementOkString: string = 'Ok';
  elementCancelString: string = 'Cancel';
  elementLoading = false;
  elementSelectedNode: TreeNode | undefined = undefined;
  elementFilterText: string | undefined;

  constructor() { }

  async ngAfterViewInit() {
    Promise.resolve(null).then(() => this.lfFolderBrowserElement.nativeElement.initAsync(this.elementProviders, this.elementOpenToFolderId));
  }

  onElementOkClick(ev: CustomEvent<TreeNode>) {
    console.log('ok event received in lf-folder-browser with selectedNode: ', ev.detail);
  }

  onElementCancelClick(ev: CustomEvent<TreeNode>) {
    console.log('cancel event received in lf-folder-browser');
  }

  onElementNodeSelected(event: CustomEvent<TreeNode | undefined>) {
    console.log('node selected: ', event);
    if (this.elementSelectedNode !== event.detail) {
      if (event.detail) {
        this.elementSelectedNode = event.detail;
      }
    }
  }
}
