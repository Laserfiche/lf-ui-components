import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LfFileExplorerComponent, LfTreeProviders, TreeNode } from '@laserfiche/types-laserfiche-ui-components';
import { LfTreeDemoFilePickerService } from '../lf-tree-documentation/lf-tree-demo-file-picker.service';

@Component({
  selector: 'app-lf-file-explorer-documentation',
  templateUrl: './lf-file-explorer-documentation.component.html',
  styleUrls: ['./lf-file-explorer-documentation.component.css', './../app.component.css']
})
export class LfFileExplorerDocumentationComponent implements AfterViewInit {

  @ViewChild('fileExplorer') lfFileExplorerElement!: ElementRef<LfFileExplorerComponent>;

  elementProviders: LfTreeProviders = { treeService: new LfTreeDemoFilePickerService() };
  elementOpenToFolderId = 'Repository 1/Nested1';
  elementOkString: string = 'Select';
  elementCancelString: string = 'Cancel';
  elementLoading = false;
  elementSelectedNodes: TreeNode[] | undefined = undefined;
  elementFilterText: string | undefined;

  constructor() { }

  async ngAfterViewInit() {
    Promise.resolve(null).then(() => this.lfFileExplorerElement.nativeElement.initAsync(this.elementProviders, this.elementOpenToFolderId));
  }

  onElementOkClick(ev: CustomEvent<TreeNode[] | undefined>) {
    console.log('ok event received in lf-file-explorer with selectedNodes: ', ev.detail);
  }

  onElementCancelClick(ev: CustomEvent<TreeNode[] | undefined>) {
    console.log('cancel event received in lf-file-explorer');
  }

  onElementNodesSelected(event: CustomEvent<TreeNode[] | undefined>) {
    console.log('node selected: ', event);
    if (this.elementSelectedNodes !== event.detail) {
      if (event.detail) {
        this.elementSelectedNodes = event.detail;
      }
    }
  }

}
