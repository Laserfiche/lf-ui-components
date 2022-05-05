import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { LfTreeComponent, LfTreeProviders, TreeNode } from '@laserfiche/types-laserfiche-ui-components';
import { LfTreeDemoFilePickerService } from './lf-tree-demo-file-picker.service';
import { LfTreeDemoFolderBrowserService } from './lf-tree-demo-folder-browser.service';

@Component({
  selector: 'app-lf-tree-documentation',
  templateUrl: './lf-tree-documentation.component.html',
  styleUrls: ['./lf-tree-documentation.component.css', './../app.component.css'],
})
export class LfTreeDocumentationComponent implements AfterViewInit {
  title = 'lf-tree-documentation';
  cancelString = 'CANCEL';
  okString = 'OKAY';
  providers: LfTreeProviders[] = [
    { treeService: new LfTreeDemoFilePickerService() },
    { treeService: new LfTreeDemoFolderBrowserService() },
  ];
  openToFolderId = 'Repository 1/Nested1/Nested2/Nested3';


  @ViewChild('tree') lfTreeElement!: ElementRef<LfTreeComponent>;
  elementString = 'Test Tree Description using element';
  elementSelectedNode: TreeNode | undefined;
  elementLfTreeProviderIndex = 0;
  elementLoading = false;

  constructor() { }

  async ngAfterViewInit() {

    await Promise.all([
      this.lfTreeElement.nativeElement.initAsync(this.providers[this.elementLfTreeProviderIndex], this.openToFolderId),
    ]);
  }

  onElementCancelClick(ev: CustomEvent<TreeNode>) {
    console.log('cancel event received in lf-tree');
  }

  onElementOkClick(ev: CustomEvent<TreeNode>) {
    console.log('ok event received in lf-tree with selectedNode: ', ev.detail);
  }

  elementDisable(): void {
    this.elementLoading = true;
  }

  elementEnable(): void {
    this.elementLoading = false;
  }

  async toggleElementProviders() {
    this.elementLfTreeProviderIndex = this.elementLfTreeProviderIndex === 0 ? 1 : 0;
    await this.lfTreeElement.nativeElement.initAsync(this.providers[this.elementLfTreeProviderIndex]);
  }

  onElementNodeSelected(event: CustomEvent<TreeNode | undefined>) {
    console.log('Node Selected: ', event.detail);
    // hack to make Unselect node button work for element
    if (this.elementSelectedNode !== event.detail) {
      if (event.detail) {
        this.elementSelectedNode = event.detail;
      }
    }
  }
}
