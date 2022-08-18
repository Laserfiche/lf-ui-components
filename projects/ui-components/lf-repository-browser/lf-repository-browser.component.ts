import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, ILfSelectable } from '@laserfiche/lf-ui-components/shared';
import { LfTreeNodeService, TreeNode, TreeNodePage } from './ILfTreeNodeService';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LfSelectionListComponent, SelectedItemEvent } from '@laserfiche/lf-ui-components/lf-selection-list';
import { CoreUtils } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent {
  @ViewChild(LfSelectionListComponent) entryList: LfSelectionListComponent | undefined;

  @Input() get breadcrumbs(): TreeNode[] {
    return this._breadcrumbs;
  }
  // @Input() get focused_node(): TreeNode | undefined {
  //   return this._focused_node;
  // }
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
  @Input() isSelectable?: (treeNode: TreeNode) => Promise<boolean>;
  @Input() multiple: boolean = false;
  // @Input() openSelectedNodeAsync = async () => {
  //   await this.zone.run(async () => {
  //     await this.openChildFolderAsync(this.focused_node);
  //   });
  // };
  @Input()
  setSelectedValuesAsync: (valuesToSelect: TreeNode[]) => Promise<void> = async (valuesToSelect: TreeNode[]) => {
    const selectableValues = await this.mapTreeNodesToLfSelectableAsync(valuesToSelect);
    if (this.entryList == null) {
      setTimeout(() => {
        this.setSelectedValuesAsync(valuesToSelect);
      });
      return;
    }
    this.entryList.setSelectedValuesAsync(selectableValues, this.checkForMoreDataCallback.bind(this)).then((selected: ILfSelectable[]) => {
      this.entrySelected.emit(this.convertSelectedItemsToTreeNode(selected));
    });
  };
 
  @Output() entrySelected = new EventEmitter<TreeNode[] | undefined>();

  /** @internal */
  currentFolderChildren: ILfSelectable[] = [];
  /** @internal */
  hasError: boolean = false;
  /** @internal */
  isLoading: boolean = false;
  /** @internal */
  nextPage: string | undefined;
  /** @internal */
  treeNodeService!: LfTreeNodeService;

  /** @internal */
  readonly OPEN = this.localizationService.getStringObservable('OPEN');
  /** @internal */
  readonly AN_ERROR_OCCURED = this.localizationService.getStringObservable('AN_ERROR_OCCURED');
  /** @internal */
  get shouldShowErrorMessage(): boolean {
    return this.hasError;
  }
  /** @internal */
  readonly THIS_FOLDER_IS_EMPTY = this.localizationService.getStringObservable('THIS_FOLDER_IS_EMPTY');
  /** @internal */
  get shouldShowEmptyMessage(): boolean {
    return this.currentFolderChildren.length === 0 && !this.hasError;
  }
  
  /** @internal */
  //protected _focused_node: TreeNode | undefined;
  /** @internal */
  protected _currentEntry?: TreeNode;
  /** @internal */
  // protected selectable: Selectable = new Selectable();

  /** @internal */
  private _breadcrumbs: TreeNode[] = [];
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
    this.scrolledIndexChanged.pipe(debounceTime(200)).subscribe(async () => {
      if (this._currentEntry == null) {
        return;
      }
      await this.updateFolderChildrenAsync(this._currentEntry);
    });
  }

  /**
   * 
   * @param entry 
   * @returns list of strings that represent img src's
   */
  getIcons(entry: TreeNode): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

  /**
   * Handles when a bread crumb is clicked
   * @param event 
   * @returns 
   */
  async onBreadcrumbClicked(event: { breadcrumbs: TreeNode[]; selected: TreeNode }) {
    if (!event.breadcrumbs || !event.selected) {
      console.error('onBreadcrumbClicked event is required to have a breadcrumbs as well as a selected entry');
      return;
    }
    this._breadcrumbs = event.breadcrumbs;
    this._currentEntry = event.selected;
    await this.updateAllPossibleEntriesAsync(this._currentEntry);
    setTimeout(() => this.entryList?.focus());
  }

  /**
   * Handles when a entry in the repository browser is double clicked
   * @param entry 
   * @returns 
   */
  async onDblClickAsync(entry: TreeNode | undefined) {
    if (!entry?.isContainer) {
      return;
    }
    await CoreUtils.yieldAsync();
    //this.selectable.clearSelectedValues(this.currentFolderChildren);
    await this.openChildFolderAsync(entry);
  }

  /**
   * Focuses the first item in the repository browser list
   * TODO: Add an optional parameter to allow for focusing a sepecific node
   */
  focus() {
    this._focus();
  }
  
  /**
   * Handles the scrolling event from the lf-selection-list
   */
  onScroll() {
    this.scrolledIndexChanged.next();
  }

  /**
   * Handles the SelectedItemEvent from the lf-selection-list
   * @param event 
   */
  async onItemSelected(event: SelectedItemEvent) {
    this.entrySelected.emit(event.selectedItems?.map((item: ILfSelectable) => item.value as TreeNode));
  }

  /**
   * Opens the entry passed as the parameter
   * Example: This will get called when an entry is double clicked
   * @param entry 
   */
  async openChildFolderAsync(entry: TreeNode | undefined) {
    if (entry?.isContainer === true) {
      this._breadcrumbs = [entry].concat(this.breadcrumbs);
      this._currentEntry = entry;
      await this.updateAllPossibleEntriesAsync(entry);

      this.entryList?.focus();
    }
  }
  
  /**
   * Callback that is passed to the lf-selection-list so it can continue to get more data if needed to select
   * initial values
   * @returns 
   */
  private async checkForMoreDataCallback(): Promise<ILfSelectable[] | undefined> {
    if (this._currentEntry == null) {
      return;
    }
    const selectablePage = await this.updateFolderChildrenAsync(this._currentEntry);
    return selectablePage;
  }

  /**
   * Maps ILfSelectable list to a TreeNode list
   * @param selected 
   * @returns 
   */
  private convertSelectedItemsToTreeNode(selected: ILfSelectable[]): TreeNode[] | undefined {
    return selected.map(value => value.value) as TreeNode[];
  }
  
  /**
   * Attempts to focus the entryList component
   * @param node Not used right now but is part of the TODO for focus fuction
   * @param tries 
   */
  private _focus(node: TreeNode | undefined = undefined, tries: number = 0): void {
    if (tries >= 10) { return; }
    if(this.entryList == null) {
      setTimeout(() => this._focus(node, tries + 1));
      return;
    }
    this.entryList.focus();
  }

  /**
   * Attempts to initialize the repository browser
   * Will initialize with the root node if not currentIdOrEntry is provided
   * Otherwise will use the provided entry to build the breadcrumbs and pull the corresponding data
   * @param currentIdOrEntry 
   * @returns 
   */
  private async initializeAsync(currentIdOrEntry?: string | TreeNode): Promise<void> {
    if (this.treeNodeService == null) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    let currentEntry: TreeNode | undefined;
    if (currentIdOrEntry == null) {
      await this.initializeWithRootOpenAsync();
      return;
    } else if (typeof currentIdOrEntry === 'string') {
      currentEntry = await this.treeNodeService.getTreeNodeByIdAsync(currentIdOrEntry);
    } else if (typeof currentIdOrEntry === 'object') {
      if (currentIdOrEntry.id == null) {
        throw new Error('current entry does not contain an id property');
      }
      currentEntry = currentIdOrEntry;
    }
    // If the entry passed in is not a container we will get the parent of this by default.
    if (currentEntry && !currentEntry.isContainer) {
      currentEntry = await this.treeNodeService.getParentTreeNodeAsync(currentEntry);
    }
    if (currentEntry) {
      await this.setNodeAsParentAsync(currentEntry);
      return;
    }
  }

  /**
   * USes the entry passed in to build the breadcrumbs
   * @param selectedEntry 
   * @returns 
   */
  private async initializeBreadcrumbOptionsAsync(selectedEntry: TreeNode) {
    this._breadcrumbs = [selectedEntry];
    let currentNode: TreeNode | undefined = selectedEntry;
    while (currentNode) {
      try {
        const nextParent: TreeNode | undefined = await this.treeNodeService.getParentTreeNodeAsync(currentNode);
        if (nextParent) {
          this.breadcrumbs.push(nextParent);
        }
        currentNode = nextParent;
      } catch (error) {
        console.error(error);
        return;
      }
    }
  }

  /**
   * Finds the root node from the treeNodeService and sets it to the current parent
   * @returns 
   */
  private async initializeWithRootOpenAsync(): Promise<void> {
    if (this.treeNodeService == null) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    const rootEntry: TreeNode | undefined = await this.treeNodeService.getRootTreeNodeAsync();
    if (rootEntry == null) {
      console.error(`Repository browser does not contain a root entry`);
      this.hasError = true;
      return;
    }
    this.hasError = false;
    await this.setNodeAsParentAsync(rootEntry);
  }

  /**
   * Maps TreeNode list to ILfSelectable items for use in the entryList
   * @param nodes 
   * @returns 
   */
  private async mapTreeNodesToLfSelectableAsync(nodes: TreeNode[]) {
    const selectablePage: ILfSelectable[] = [];
    for (const value of nodes) {
      const selectableValue = {
        value,
        isSelectable: this.isSelectable ? await this.isSelectable(value) : true,
        isSelected: false,
      };
      selectablePage.push(selectableValue);
    }
    return selectablePage;
  }

  /**
   * Resets the errors, selected values, currentFolderChildren and nextPage
   */
  private resetFolderProperties() {
    this.hasError = false;
    this.entryList?.clearSelectedValues();
    this.ref.detectChanges();
    this.currentFolderChildren = [];
    //this._focused_node = undefined;
    this.nextPage = undefined;
  }

  /**
   * Makes the parentEntry parameter into the current parent node
   * Will setup the breadcrumbs to be the listOfAncestorEntries with the parentEntry as the last one if passed in
   * @param parentEntry 
   * @param listOfAncestorEntries 
   * @returns 
   */
  private async setNodeAsParentAsync(parentEntry: TreeNode, listOfAncestorEntries?: TreeNode[]): Promise<void> {
    if (!parentEntry) {
      console.error('parentEntry must not be null');
      return;
    }
    if (!parentEntry.isContainer) {
      console.error('parentEntry must be a container');
      return;
    }
    if (listOfAncestorEntries == null) {
      await this.initializeBreadcrumbOptionsAsync(parentEntry);
    } else {
      this._breadcrumbs = [parentEntry].concat(listOfAncestorEntries);
    }
    this._currentEntry = parentEntry;
    await this.updateAllPossibleEntriesAsync(parentEntry);
  }

  /**
   * Resets the list and pulls new data for the parentEntry
   * @param parentEntry 
   * @param refresh Not Used currently
   */
  private async updateAllPossibleEntriesAsync(parentEntry: TreeNode, refresh: boolean = false) {
    if (parentEntry && parentEntry.id) {
      try {
        this.isLoading = true;
        this.resetFolderProperties();

        await this.updateFolderChildrenAsync(parentEntry);
        this.entrySelected.emit([]);
      } catch (error) {
        console.error(error);
        this.hasError = true;
      } finally {
        this.isLoading = false;
        this.ref.detectChanges();
      }
    } else {
      console.error('updateAllPossibleEntriesAsync parentEntry undefined or missing id property');
      this.hasError = true;
    }
  }

  /**
   * Does the work to call the treeNodeService and map the returned values to ILfSelectable entries
   * @param parentEntry 
   * @returns 
   */
  private async updateFolderChildrenAsync(parentEntry: TreeNode): Promise<ILfSelectable[]> {
    const firstEntryPage: TreeNodePage = await this.treeNodeService.getFolderChildrenAsync(parentEntry, this.nextPage);
    this.nextPage = firstEntryPage.nextPage;
    const page = firstEntryPage.page;
    const selectablePage: ILfSelectable[] = await this.mapTreeNodesToLfSelectableAsync(page);

    this.currentFolderChildren = this.currentFolderChildren.concat(...selectablePage);
    
    return selectablePage;
  }
}
