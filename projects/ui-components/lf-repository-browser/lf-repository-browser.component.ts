import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';

import { RepositoryBrowserDirective } from './repository-browser.directive';
import { TreeNodePage, LfTreeNodeService, TreeNode } from './ILFRepositoryService';
import { Observable, Subject } from 'rxjs';
import { debounceTime} from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css']
})
export class LfRepositoryBrowserComponent extends RepositoryBrowserDirective {
  @ViewChild(MatSelectionList) entryList: MatSelectionList | undefined;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;

  @Input() multiple: boolean = false;

  @Output() entrySelected = new EventEmitter<TreeNode[] | undefined>();

  /** @internal */
  _focused_node: TreeNode | undefined;

  private scrolledIndexChanged = new Subject();

  /** @internal */
  constructor(
    /** @internal */
    public ref: ChangeDetectorRef,
    /** @internal */
    public popupDialog: MatDialog,
    /** @internal */
    public zone: NgZone,
    /** @internal */
    public localizationService: AppLocalizationService) {
    super(ref, popupDialog, zone, localizationService);

    this.scrolledIndexChanged.pipe(debounceTime(200)).subscribe(async () => {
      if (this._currentEntry == null) {
        return;
      }
      const nextPage: TreeNodePage = await this.treeNodeService.getFolderChildrenAsync(this._currentEntry, this.nextPage);
      this.currentFolderChildren = this.currentFolderChildren.concat(...nextPage.page);
      this.nextPage = nextPage.nextPage;
    });
  }

  /**
   * function to initialize the lf-file-explorer component
   * @param provider LfRepositoryService service
   * @param selectedNode the id of the node to select, or a Entry[] starting from the selected node to the root node
   */
  @Input() initAsync = async (treeNodeService: LfTreeNodeService, selectedNode?: string | TreeNode[]): Promise<void> => {
    await this.zone.run(async () => {
      try {
        this.treeNodeService = treeNodeService;
      } catch(error) {
        console.error(error);
        this.hasError = true;
        return;
      }
      await this.initializeAsync(selectedNode);
    });
  };

  @Input() openSelectedNodeAsync = async () => {
    await this.zone.run(async () => {
      await this.openChildFolderAsync(this.focused_node);
    });
  };

  /** @internal */
  async onPressEnterAsync() {
    await this.openChildFolderAsync(this._focused_node);
  }

  onScroll(event: Observable<number>) {
    if (this.viewport == null) {
      console.error('Viewport was not defined when onScroll was called');
      return;
    }
    // If the viewport is at the end we should try and pull more data
    const end = this.viewport.getRenderedRange().end;
    const total = this.viewport.getDataLength();
    if (end === total) {
      this.scrolledIndexChanged.next();
    }
  }

  /** @internal */
  onSelectionChange(allSelectedOptions: MatListOption[] | undefined, changes: MatSelectionListChange): void {
    const changedOptions: MatListOption[] = changes.options;
    this._focused_node = changedOptions?.length === 1 ? changedOptions[0].value : undefined;
    const selectedNodes: TreeNode[] | undefined = allSelectedOptions?.map(selection => selection.value);
    const selectableSelectedNodes: TreeNode[] | undefined = selectedNodes?.filter(selection => selection.isSelectable);
    this.ref.detectChanges();
    this.entrySelected.emit(selectableSelectedNodes);
  }

  /** @internal */
  resetSelection(): void {
    this._focused_node = undefined;
    this.entryList?.deselectAll();
    this.entrySelected.emit(this.entryList?.selectedOptions.selected
      .map((listOption: MatListOption) => listOption.value));
  }

  @Input() get focused_node(): TreeNode | undefined {
    return this._focused_node;
  };
}
