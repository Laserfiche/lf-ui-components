import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectionList } from '@angular/material/list';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';

import { RepositoryBrowserDirective } from './repository-browser.directive';
import { LfTreeNodeService, TreeNode, ILfSelectable } from './ILfTreeNodeService';
import { Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent extends RepositoryBrowserDirective {
  @ViewChild(MatSelectionList) entryList: MatSelectionList | undefined;
  @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport | undefined;

  @Input() multiple: boolean = false;

  @Input()
  setSelectedValuesAsync: (valuesToSelect: TreeNode[]) => Promise<void> = async (valuesToSelect: TreeNode[]) => {
    const selectableValues = await this.mapTreeNodesToLfSelectableAsync(valuesToSelect);
    this.selectable.setSelectedValuesAsync(selectableValues, this.currentFolderChildren).then(() => {
      this.entrySelected.emit(this.convertSelectedItemsToTreeNode());
    });
  };

  /** @internal */
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
    public localizationService: AppLocalizationService
  ) {
    super(ref, popupDialog, zone, localizationService);

    this.scrolledIndexChanged.pipe(debounceTime(200)).subscribe(async () => {
      if (this._currentEntry == null) {
        return;
      }
      await this.updateFolderChildrenAsync(this._currentEntry);
    });
  }

  /**
   * function to initialize the lf-file-explorer component
   * @param provider LfRepositoryService service
   * @param selectedNode the id of the node to select, or a Entry starting from the selected entry
   */
  @Input() initAsync = async (treeNodeService: LfTreeNodeService, selectedNode?: string | TreeNode): Promise<void> => {
    await this.zone.run(async () => {
      try {
        this.treeNodeService = treeNodeService;
      } catch (error) {
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

  /** @internal */
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

  @Input() get focused_node(): TreeNode | undefined {
    return this._focused_node;
  }

  /** @internal */
  async onClickMatListOption(event: MouseEvent, option: ILfSelectable) {
    setTimeout(() => {
      if ((event.target as HTMLElement).classList.contains('mat-pseudo-checkbox')) {
        this.selectable.onItemClicked(event, option, this.currentFolderChildren, true);
      } else {
        this.selectable.onItemClicked(event, option, this.currentFolderChildren);
      }
      const items = this.convertSelectedItemsToTreeNode();
      this.entrySelected.emit(items as TreeNode[]);
    });
  }

  /** @internal */
  onfocus(node: TreeNode) {
    this._focused_node = node;
  }

  /** @internal */
  async onPressKeyDown(event: KeyboardEvent, node: ILfSelectable) {
    if (
      event.key === ' ' ||
      event.key === 'Enter' ||
      (event.shiftKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
    ) {
      setTimeout(() => {
        this.selectable.onItemClicked(event, node, this.currentFolderChildren);
        this.entrySelected.emit(this.convertSelectedItemsToTreeNode());
      });
    }
  }
}
