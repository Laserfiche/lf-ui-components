import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, ILfSelectable, ItemWithId } from '@laserfiche/lf-ui-components/shared';
import { LfTreeNodeService, LfTreeNode, LfTreeNodePage } from './ILfTreeNodeService';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LfSelectionListComponent, SelectedItemEvent } from '@laserfiche/lf-ui-components/lf-selection-list';

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent implements OnDestroy {
  /** @internal */
  @ViewChild(LfSelectionListComponent) entryList: LfSelectionListComponent | undefined;
  private selectedItems: LfTreeNode[] | undefined;

  @Input() get breadcrumbs(): LfTreeNode[] {
    return this._breadcrumbs;
  }

  @Input() get currentFolder(): LfTreeNode | undefined {
    return this._currentFolder;
  }

  @Input() itemSize: number = 42;
  /**
   * function to initialize the lf-file-explorer component
   * @param provider LfRepositoryService service
   * @param selectedNode the id of the node to select, or a Entry starting from the selected entry
   */
  @Input() initAsync = async (treeNodeService: LfTreeNodeService, selectedNode?: LfTreeNode): Promise<void> => {
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
    if (!this.entryList) {
      setTimeout(() => {
        this.setSelectedValuesAsync(valuesToSelect);
      });
      return;
    }
    this.entryList
      .setSelectedValuesAsync(selectableValues, this.checkForMoreDataCallback.bind(this))
      .then((selected: ILfSelectable[]) => {
        const selectedItems = this.convertSelectedItemsToTreeNode(selected);
        this.entrySelected.emit(selectedItems);
      });
  };

  @Input()
  refreshAsync: () => Promise<void> = async () => {
    if (!this._currentFolder) {
      this._currentFolder = await this.treeNodeService.getRootTreeNodeAsync();
    }
    if (!this._currentFolder) {
      throw new Error('No root was found, repository browser was unable to refresh.');
    }
    this.entryList?.clearSelectedValues();
    this.nextPage = undefined;
    this.lastCalledPage = undefined;
    this.maximumChildrenReceived = false;
    await this.updateAllPossibleEntriesAsync(this._currentFolder);
  };

  @Input()
  openSelectedNodesAsync: () => Promise<void> = async () => {
    if (this.selectedItems && this.selectedItems.length > 0) {
      await this.openSelectedItemsAsync();
    } else {
      console.debug('No selected nodes to open');
    }
  };

  @Input()
  openFocusedNodeAsync: () => Promise<void> = async () => {
    if (this.entryList?.currentFocusIndex) {
      const nodeToOpen = this.entryList.listItems[this.entryList.currentFocusIndex].value as LfTreeNode;
      this.entryDblClicked.emit([nodeToOpen]);
      await this.openChildFolderAsync(nodeToOpen);
    } else {
      console.debug('No focused node to open');
    }
  }

  /**
   * Focuses the first item in the repository browser list
   * TODO: Add an optional parameter to allow for focusing a specific node
   */
  @Input() focus = () => {
    this._focus();
  };

  @Output() entryDblClicked = new EventEmitter<LfTreeNode[]>();
  @Output() entrySelected = new EventEmitter<LfTreeNode[] | undefined>();
  @Output() entryFocused = new EventEmitter<LfTreeNode | undefined>();

  /** @internal */
  currentFolderChildren: ILfSelectable[] = [];
  /** @internal */
  hasError: boolean = false;
  /** @internal */
  isLoading: boolean = true;
  /**
   * @internal
   * TODO: Add a message for when the repository browser is not initialized
   * When that happens default isLoading to false
   */
  initialized: boolean = false;
  /** @internal */
  nextPage: string | undefined;
  /** @internal */
  lastCalledPage: string | undefined;
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
  protected _currentFolder?: LfTreeNode;
  /** @internal */
  protected maximumChildrenReceived: boolean = false;

  /** @internal */
  private _breadcrumbs: LfTreeNode[] = [];
  /** @internal */
  private scrolledIndexChanged = new Subject();
  /**
   * @internal
   * Used to track if data is currently being pulled
   * */
  private lastDataCall?: Promise<any>;

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
      if (!this._currentFolder) {
        return;
      }
      if (!this.maximumChildrenReceived) {
        if (this.nextPage && this.nextPage == this.lastCalledPage) {
          // do nothing. nextPage already attempted
          return;
        }
        await this.makeDataCall(this._currentFolder);
      }
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
    this._currentFolder = event.selected;
    this.entryDblClicked.emit([this._currentFolder]);
    await this.updateAllPossibleEntriesAsync(this._currentFolder);
    setTimeout(() => this.entryList?.focus());
  }

  /**
   * @internal
   * Handles when a entry in the repository browser is double clicked
   * @param entry
   * @returns
   */
  async onDblClickAsync(treeNode: LfTreeNode | undefined) {
    await this.openChildFolderAsync(treeNode as LfTreeNode);
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
    const lastSelectedItem =
      this.selectedItems && this.selectedItems.length > 0
        ? this.selectedItems[this.selectedItems.length - 1]
        : undefined;
    if (
      (lastSelectedItem &&
        lastSelectedItem === event.selected.value &&
        this.selectedItems?.length === event.selectedItems?.length) ||
      (event.selectedItems?.length === 0 && this.selectedItems?.length === 0)
    ) {
      // do nothing
      return;
    }
    this.selectedItems = event.selectedItems?.map((item: ILfSelectable) => item.value as LfTreeNode);
    this.entrySelected.emit(this.selectedItems);
  }

  /** @internal */
  onEntryFocused(item: ItemWithId | undefined) {
    this.entryFocused.emit(item ? item as LfTreeNode : undefined);
  }

  /**
   * @internal
   * Opens the entry passed as the parameter
   * Example: This will get called when an entry is double clicked
   * @param entry
   */
  async openChildFolderAsync(entry: LfTreeNode) {
    if (!entry?.isContainer) {
      return;
    }
    this._breadcrumbs = [entry].concat(this.breadcrumbs);
    this._currentFolder = entry;
    await this.updateAllPossibleEntriesAsync(entry);

    this.entryList?.focus();
  }

  /**
   * @internal
   */
  async openSelectedItemsAsync() {
    const selectedNodes = this.selectedItems;
    this.entryDblClicked.emit(selectedNodes);
    if (selectedNodes?.length === 1 && selectedNodes[0].isContainer) {
      await this.openChildFolderAsync(selectedNodes[0]);
    }
  }

  /**
   * @internal
   * Callback that is passed to the lf-selection-list so it can continue to get more data if needed to select
   * initial values
   * @returns
   */
  private async checkForMoreDataCallback(): Promise<ILfSelectable[] | undefined> {
    if (!this._currentFolder) {
      return;
    }
    return await this.makeDataCall(this._currentFolder);
  }

  /**
   * @internal
   * Maps ILfSelectable list to a TreeNode list
   * @param selected
   * @returns
   */
  private convertSelectedItemsToTreeNode(selected: ILfSelectable[]): LfTreeNode[] | undefined {
    return selected.map((value) => value.value) as LfTreeNode[];
  }

  /**
   * @internal
   * Attempts to focus the entryList component
   * @param node Not used right now but is part of the TODO for focus fuction
   * @param tries
   */
  private _focus(node: LfTreeNode | undefined = undefined, tries: number = 0): void {
    if (tries >= 10) {
      return;
    }
    if (!this.entryList) {
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
  private async initializeAsync(currentEntry?: LfTreeNode): Promise<void> {
    if (!this.treeNodeService) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    if (!currentEntry) {
      try {
        currentEntry = await this.treeNodeService.getRootTreeNodeAsync();
        this.hasError = false;
      } catch (err: any) {
        console.error(`Error retrieving root node`, JSON.stringify(err));
        this.hasError = true;
        return;
      }
    }
    // If the entry passed in is not a container we will get the parent of this by default.
    if (currentEntry && !currentEntry.isContainer) {
      currentEntry = await this.treeNodeService.getParentTreeNodeAsync(currentEntry);
    }
    if (!currentEntry) {
      throw new Error('currentEntry is undefined');
    }
    this.initialized = true;
    await this.setNodeAsParentAsync(currentEntry);
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
    this.lastCalledPage = undefined;
    this.maximumChildrenReceived = false;
  }

  /**
   * @internal
   * Makes the parentEntry parameter into the current parent node
   * Will setup the breadcrumbs to be the listOfAncestorEntries with the parentEntry as the last one if passed in
   * @param parentEntry
   * @param listOfAncestorEntries
   * @returns
   */
  private async setNodeAsParentAsync(parentEntry: LfTreeNode): Promise<void> {
    if (!parentEntry) {
      console.error('parentEntry must not be null');
      return;
    }
    if (!parentEntry.isContainer) {
      console.error('parentEntry must be a container');
      return;
    }
    await this.initializeBreadcrumbOptionsAsync(parentEntry);
    this._currentFolder = parentEntry;
    await this.updateAllPossibleEntriesAsync(parentEntry);
  }

  /**
   * @internal
   * Resets the list and pulls new data for the parentEntry
   * @param parentEntry
   * @param refresh Not Used currently
   */
  private async updateAllPossibleEntriesAsync(parentEntry: LfTreeNode, refresh: boolean = false) {
    // If we are already getting data we want to wait for that to finish before resetting and pulling new data.
    if (this.lastDataCall) {
      // If we get an error in the last data call just throw it away.
      await this.lastDataCall.catch((error) => undefined);
    }
    if (parentEntry && parentEntry.id) {
      try {
        this.isLoading = true;
        this.resetFolderProperties();

        await this.makeDataCall(parentEntry);
        this.selectedItems = [];
        this.entrySelected.emit([]);
      } catch (error) {
        console.error(error);
        this.lastDataCall = undefined;
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

  private async makeDataCall(parentEntry: LfTreeNode): Promise<ILfSelectable[]> {
    this.lastDataCall = this.updateFolderChildrenAsync(parentEntry);
    const selectable = await this.lastDataCall;
    this.lastDataCall = undefined;
    return selectable;
  }

  /**
   * @internal
   * Does the work to call the treeNodeService and map the returned values to ILfSelectable entries
   * @param parentEntry
   * @returns
   */
  private async updateFolderChildrenAsync(parentEntry: LfTreeNode): Promise<ILfSelectable[]> {
    this.lastCalledPage = this.nextPage;
    const dataPage = await this.treeNodeService.getFolderChildrenAsync(parentEntry, this.nextPage);
    let selectablePage: ILfSelectable[] = [];
    this.nextPage = dataPage.nextPage;
    const page = dataPage.page;
    selectablePage = await this.mapTreeNodesToLfSelectableAsync(page);
    this.currentFolderChildren = this.currentFolderChildren.concat(...selectablePage);
    if (this.nextPage) {
      this.maximumChildrenReceived = false;
    } else {
      this.maximumChildrenReceived = true;
    }

    return selectablePage;
  }

  /** @internal */
  ngOnDestroy() {
    this.scrolledIndexChanged.unsubscribe();
  }
}
