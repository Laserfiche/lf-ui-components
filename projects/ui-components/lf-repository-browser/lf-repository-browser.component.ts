import { ChangeDetectorRef, Component, Input, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, ILfSelectable } from '@laserfiche/lf-ui-components/shared';

import { RepositoryBrowserDirective } from './repository-browser.directive';
import { LfTreeNodeService, TreeNode } from './ILfTreeNodeService';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SelectedItemEvent } from './lf-list.component';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent extends RepositoryBrowserDirective {
  @Input()
  setSelectedValuesAsync: (valuesToSelect: TreeNode[]) => Promise<void> = async (valuesToSelect: TreeNode[]) => {
    const selectableValues = await this.mapTreeNodesToLfSelectableAsync(valuesToSelect);
    if (this.entryList == null) {
      setTimeout(() => {
        this.setSelectedValuesAsync(valuesToSelect);
      });
      return;
    }
    this.entryList.setSelectedValuesAsync(selectableValues, this.checkForMoreDataCallback).then((selected: ILfSelectable[]) => {
      this.entrySelected.emit(this.convertSelectedItemsToTreeNode(selected));
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

  @Input() get focused_node(): TreeNode | undefined {
    return this._focused_node;
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
  onScroll() {
    this.scrolledIndexChanged.next();
  }

  /** @internal */
  onfocus(node: TreeNode) {
    this._focused_node = node;
  }

  /** @internal */
  async onItemSelected(event: SelectedItemEvent) {
    this.entrySelected.emit(event.selectedItems?.map((item: ILfSelectable) => item.value as TreeNode));
  }
}
