import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, ILfSelectable } from '@laserfiche/lf-ui-components/shared';
import { LfTreeNodeService, LfTreeNode, LfTreeNodePage } from './ILfTreeNodeService';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LfSelectionListComponent, SelectedItemEvent } from '@laserfiche/lf-ui-components/lf-selection-list';
import { CoreUtils } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent implements OnDestroy {
  /** @internal */
  @ViewChild(LfSelectionListComponent) entryList: LfSelectionListComponent | undefined;

  @Input() get breadcrumbs(): LfTreeNode[] {
    return this._breadcrumbs;
  }

  /**
   * function to initialize the lf-file-explorer component
   * @param provider LfRepositoryService service
   * @param selectedNode the id of the node to select, or a Entry starting from the selected entry
  */
  @Input() initAsync = async (treeNodeService: LfTreeNodeService, selectedNode?: string | LfTreeNode): Promise<void> => {
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
  @Input() isSelectable?: (treeNode: LfTreeNode) => Promise<boolean>;
  @Input() multiple: boolean = false;
  @Input()
  setSelectedValuesAsync: (valuesToSelect: LfTreeNode[]) => Promise<void> = async (valuesToSelect: LfTreeNode[]) => {
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

  @Output() entrySelected = new EventEmitter<LfTreeNode[] | undefined>();

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
  protected _currentEntry?: LfTreeNode;
  /** @internal */
  protected maximumChildrenReceived: boolean = false;;
  /** @internal */
  // protected selectable: Selectable = new Selectable();

  /** @internal */
  private _breadcrumbs: LfTreeNode[] = [];
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
      if (!this.maximumChildrenReceived)
        await this.updateFolderChildrenAsync(this._currentEntry);
    });
  }

  /**
   * @internal
   * @param entry
   * @returns list of strings that represent img src's
   */
  getIcons(entry: LfTreeNode): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

  /**
   * @internal
   * Handles when a bread crumb is clicked
   * @param event
   * @returns
   */
  async onBreadcrumbClicked(event: { breadcrumbs: LfTreeNode[]; selected: LfTreeNode }) {
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
   * @internal
   * Handles when a entry in the repository browser is double clicked
   * @param entry
   * @returns
   */
  async onDblClickAsync(entry: LfTreeNode | undefined) {
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
   * @internal
   * Handles the scrolling event from the lf-selection-list
   */
  onScroll() {
    this.scrolledIndexChanged.next();
  }

  /**
   * @internal
   * Handles the SelectedItemEvent from the lf-selection-list
   * @param event
   */
  async onItemSelected(event: SelectedItemEvent) {
    this.entrySelected.emit(event.selectedItems?.map((item: ILfSelectable) => item.value as LfTreeNode));
  }

  /**
   * Opens the entry passed as the parameter
   * Example: This will get called when an entry is double clicked
   * @param entry
   */
  async openChildFolderAsync(entry: LfTreeNode | undefined) {
    if (entry?.isContainer === true) {
      this._breadcrumbs = [entry].concat(this.breadcrumbs);
      this._currentEntry = entry;
      await this.updateAllPossibleEntriesAsync(entry);

      this.entryList?.focus();
    }
  }

  /**
   * @internal
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
   * @internal
   * Maps ILfSelectable list to a TreeNode list
   * @param selected
   * @returns
   */
  private convertSelectedItemsToTreeNode(selected: ILfSelectable[]): LfTreeNode[] | undefined {
    return selected.map(value => value.value) as LfTreeNode[];
  }

  /**
   * @internal
   * Attempts to focus the entryList component
   * @param node Not used right now but is part of the TODO for focus fuction
   * @param tries
   */
  private _focus(node: LfTreeNode | undefined = undefined, tries: number = 0): void {
    if (tries >= 10) { return; }
    if (this.entryList == null) {
      setTimeout(() => this._focus(node, tries + 1));
      return;
    }
    this.entryList.focus();
  }

  /**
   * @internal
   * Attempts to initialize the repository browser
   * Will initialize with the root node if not currentIdOrEntry is provided
   * Otherwise will use the provided entry to build the breadcrumbs and pull the corresponding data
   * @param currentIdOrEntry
   * @returns
   */
  private async initializeAsync(currentIdOrEntry?: string | LfTreeNode): Promise<void> {
    if (this.treeNodeService == null) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    let currentEntry: LfTreeNode | undefined;
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
   * @internal
   * Uses the entry passed in to build the breadcrumbs
   * @param selectedEntry
   * @returns
   */
  private async initializeBreadcrumbOptionsAsync(selectedEntry: LfTreeNode) {
    this._breadcrumbs = [selectedEntry];
    let currentNode: LfTreeNode | undefined = selectedEntry;
    while (currentNode) {
      try {
        const nextParent: LfTreeNode | undefined = await this.treeNodeService.getParentTreeNodeAsync(currentNode);
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
   * @internal
   * Finds the root node from the treeNodeService and sets it to the current parent
   * @returns
   */
  private async initializeWithRootOpenAsync(): Promise<void> {
    if (this.treeNodeService == null) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    const rootEntry: LfTreeNode | undefined = await this.treeNodeService.getRootTreeNodeAsync();
    if (rootEntry == null) {
      console.error(`Repository browser does not contain a root entry`);
      this.hasError = true;
      return;
    }
    this.hasError = false;
    await this.setNodeAsParentAsync(rootEntry);
  }

  /**
   * @internal
   * Maps TreeNode list to ILfSelectable items for use in the entryList
   * @param nodes
   * @returns
   */
  private async mapTreeNodesToLfSelectableAsync(nodes: LfTreeNode[]) {
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
   * @internal
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
   * @internal
   * Makes the parentEntry parameter into the current parent node
   * Will setup the breadcrumbs to be the listOfAncestorEntries with the parentEntry as the last one if passed in
   * @param parentEntry
   * @param listOfAncestorEntries
   * @returns
   */
  private async setNodeAsParentAsync(parentEntry: LfTreeNode, listOfAncestorEntries?: LfTreeNode[]): Promise<void> {
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
   * @internal
   * Resets the list and pulls new data for the parentEntry
   * @param parentEntry
   * @param refresh Not Used currently
   */
  private async updateAllPossibleEntriesAsync(parentEntry: LfTreeNode, refresh: boolean = false) {
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
   * @internal
   * Does the work to call the treeNodeService and map the returned values to ILfSelectable entries
   * @param parentEntry
   * @returns
   */
  private async updateFolderChildrenAsync(parentEntry: LfTreeNode): Promise<ILfSelectable[]> {
    const firstEntryPage: LfTreeNodePage = await this.treeNodeService.getFolderChildrenAsync(parentEntry, this.nextPage);
    let selectablePage: ILfSelectable[] = [];
    this.nextPage = firstEntryPage.nextPage;
    const page = firstEntryPage.page;
    selectablePage = await this.mapTreeNodesToLfSelectableAsync(page);
    this.currentFolderChildren = this.currentFolderChildren.concat(...selectablePage);
    if (this.nextPage) {
      this.maximumChildrenReceived = false;
    }
    else {
      this.maximumChildrenReceived = true;
    }

    return selectablePage;
  }

  /** @internal */
  ngOnDestroy() {
    this.scrolledIndexChanged.unsubscribe();
  }
}
