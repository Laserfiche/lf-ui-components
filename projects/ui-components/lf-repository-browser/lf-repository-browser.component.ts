import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ILfSelectable, ItemWithId } from '@laserfiche/lf-ui-components/shared';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { LfTreeNodeService, LfTreeNode, LfTreeNodePage } from './ILfTreeNodeService';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  ColumnDef,
  ColumnOrderBy,
  LfSelectionListComponent,
  SelectedItemEvent,
} from '@laserfiche/lf-ui-components/lf-selection-list';

/** @internal */
const NAME_COL_AUTO: ColumnDef = {
  id: 'name',
  displayName: 'Name',
  defaultWidth: 'auto',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};
/** @internal */
const NAME_COL_50CH: ColumnDef = {
  id: 'name',
  displayName: 'Name',
  defaultWidth: '50ch',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};

@Component({
  selector: 'lf-repository-browser-component',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css'],
})
export class LfRepositoryBrowserComponent implements OnDestroy, AfterViewInit {
  /**
   * read-only property to get current breadcrumbs
   */
  @Input() get breadcrumbs(): LfTreeNode[] {
    return this._breadcrumbs;
  }

  /**
   * read-only property to retrieve currently opened LfTreeNode
   */
  @Input() get currentFolder(): LfTreeNode | undefined {
    return this._currentFolder;
  }

  /**
   * Property to set height in pixels of each item in lf-repository-browser
   */
  @Input() set item_size(value: number | string) {
    if (typeof value === 'string') {
      value = parseInt(value, 10);
    }
    this._itemSize = value;
  }
  get item_size(): number {
    return this._itemSize;
  }

  /**
   * Property to set number of items rendered, should be set to more than the number of visible nodes
   */
  @Input() set page_size(value: number | string) {
    if (typeof value === 'string') {
      value = parseInt(value, 10);
    }
    this._pageSize = value;
  }
  get page_size(): number {
    return this._pageSize;
  }

  /**
   * Property to get and set the current column to order by
   */
  @Input()
  get column_order_by(): ColumnOrderBy | undefined {
    return this.entryList?.columnOrderBy;
  }
  set column_order_by(orderBy: ColumnOrderBy | undefined) {
    if (this.entryList) {
      this.entryList.columnOrderBy = orderBy;
    }
  }

  /**
   * Property to set whether or not to always show header. By default will only show header if there is more than one column
   */
  @Input()
  set always_show_header(showHeader: boolean | undefined | string) {
    if (typeof showHeader === 'string') {
      if (showHeader.toLowerCase() === 'true') {
        showHeader = true;
      } else {
        showHeader = false;
      }
    }
    if (this.entryList) {
      this.entryList.alwaysShowHeader = showHeader;
    }
  }

  /**
   * Function to set additional columns to display. You can use this to set a specific name column as well, or accept the default.
   */
  @Input()
  setColumnsToDisplay: (cols: ColumnDef[]) => void = (cols: ColumnDef[]) => {
    if (this.entryList) {
      const nameColumnDef = cols.find((col) => col.id === 'name');
      if (!nameColumnDef) {
        let nameCol: ColumnDef;
        if (!cols || cols.length === 0) {
          nameCol = NAME_COL_AUTO;
        } else {
          nameCol = NAME_COL_50CH;
        }
        cols.unshift(nameCol);
      }
      this.entryList.columns = cols;
    }
    this.ref.detectChanges();
  };

  /**
   * Function to initialize the lf-repository-browser component
   * @param treeNodeService LfRepositoryService service
   * @param initialOpenedNode The LfTreeNode that you would like to open, or the identifier of the LfTreeNode. The identifier should match the implementation of service.getTreeNodeById(..) (i.e. id, path, etc.)
   */
  @Input() initAsync = async (
    treeNodeService: LfTreeNodeService,
    initialOpenedNode?: LfTreeNode | string
  ): Promise<void> => {
    await this.zone.run(async () => {
      try {
        this.hasError = false;
        this.isLoading = true;
        this.treeNodeService = treeNodeService;
        if (typeof initialOpenedNode === 'string') {
          if (!initialOpenedNode || initialOpenedNode.trim().length === 0) {
            initialOpenedNode = undefined;
          } else {
            if (this.treeNodeService.getTreeNodeByIdAsync) {
              try {
                initialOpenedNode = await this.treeNodeService.getTreeNodeByIdAsync(initialOpenedNode);
              } catch {
                console.warn('Unable to determine LfTreeNode by id. Will initialize to root.');
                initialOpenedNode = undefined;
              }
            } else {
              console.warn(
                'initialOpenedNode is specified by an id, but getTreeNodeById is not implemented. Will initialize to root.'
              );
              initialOpenedNode = undefined;
            }
          }
        }

        await this.initializeAsync(initialOpenedNode);
      } catch (error) {
        console.error(error);
        this.hasError = true;
      } finally {
        this.isLoading = false;
        this.ref.detectChanges();
      }
    });
  };

  /**
   * This function will be called for each LfTreeNode to determine if it is selectable, when it is rendered
   */
  @Input() isSelectable?: (treeNode: LfTreeNode) => Promise<boolean>;

  /**
   * Property to get and set whether multiple select is enabled on the component
   */
  @Input() set multiple(value: boolean | string) {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') {
        value = true;
      } else {
        value = false;
      }
    }
    this._multipleSelectEnabled = value;
  }
  get multiple(): boolean {
    return this._multipleSelectEnabled;
  }

  /**
   * Function to set selectedNodes. If current data does not include all the requested node, it will call getFolderChildren until there are no more, or maxFetchIterations is reached.
   * @param nodesToSelect array of LfTreeNodes to select by id
   * @param maxFetchIterations Max number of times to get data if the current data doesn't contain all of the requested nodes. Default is 5.
   * @returns void
   */
  @Input()
  setSelectedNodesAsync: (nodesToSelect: LfTreeNode[], maxFetchIterations?: number) => Promise<void> = async (
    nodesToSelect: LfTreeNode[],
    maxFetchIterations: number = 5
  ) => {
    const selectableValues = await this.mapTreeNodesToLfSelectableAsync(nodesToSelect);
    if (!this.entryList && this.isLoading) {
      setTimeout(() => {
        this.setSelectedNodesAsync(nodesToSelect, maxFetchIterations);
      });
      return;
    }
    if (this.entryList) {
      this.entryList.clearSelectedValues();
      const selectedNodes: ILfSelectable[] = await this.entryList.setSelectedNodesAsync(
        selectableValues,
        this.checkForMoreDataCallback.bind(this),
        maxFetchIterations
      );
      const selectedItems = this.convertSelectedItemsToTreeNode(selectedNodes);
      if (selectedItems?.length === 0 && this.selectedItems?.length === 0) {
        // do nothing
      } else {
        this.selectedItems = selectedItems;
        this.entrySelected.emit(this.selectedItems);
      }
    }
  };

  /**
   * Function to refresh data in folder (get first page)
   * @param clearSelectedValues Optional parameter to clear all the currently selected values. Default is true.
   */
  @Input()
  refreshAsync: (clearSelectedValues?: boolean) => Promise<void> = async (clearSelectedValues: boolean = true) => {
    try {
      this.hasError = false;
      this.isLoading = true;
      if (!this._currentFolder) {
        this._currentFolder = await this.treeNodeService.getRootTreeNodeAsync();
      }
      if (!this._currentFolder) {
        throw new Error('No root was found, repository browser was unable to refresh.');
      }
      this.nextPage = undefined;
      this.lastCalledPage = undefined;
      this.maximumChildrenReceived = false;
      this.currentFolderChildren = [];
      this.ref.detectChanges();
      await this.initializeBreadcrumbOptionsAsync(this._currentFolder);
      await this.updateAllPossibleEntriesAsync(this._currentFolder, clearSelectedValues);
    } catch {
      this.hasError = true;
    } finally {
      this.isLoading = false;
      this.ref.detectChanges();
    }
  };

  /**
   * Function to open selected node(s). If there is just one container node it will open the container in the UI and emit the entryDblClicked event,
   * if there is more than one node or it is not a container, it will just emit the entryDblClicked event
   */
  @Input()
  openSelectedNodesAsync: () => Promise<void> = async () => {
    if (this.selectedItems && this.selectedItems.length > 0) {
      await this.openSelectedItemsAsync();
    } else {
      console.debug('No selected nodes to open');
    }
  };

  /**
   * Function to open focused node. If there is just one container node it will open the container in the UI and emit the entryDblClicked event
   */
  @Input()
  openFocusedNodeAsync: () => Promise<void> = async () => {
    if (this.focusedEntry) {
      const nodeToOpen = this.focusedEntry as LfTreeNode;
      await this.openChildFolderAsync(nodeToOpen);
      this.entryDblClicked.emit([nodeToOpen]);
    } else {
      console.debug('No focused node to open');
    }
  };

  /**
   * Focuses the first item in the repository browser list
   * TODO: Add an optional parameter to allow for focusing a specific node
   */
  @Input() focus = () => {
    this._focus();
  };

  /** Event triggered on double click (open) of a node. This can be accompanied by the UI opening a single container */
  @Output() entryDblClicked = new EventEmitter<LfTreeNode[]>();
  /** Event triggered on selection (click/space bar) of a node.*/
  @Output() entrySelected = new EventEmitter<LfTreeNode[] | undefined>();
  /** Event triggered on focus of a node.*/
  @Output() entryFocused = new EventEmitter<LfTreeNode | undefined>();

  /** @internal */
  @ViewChild(LfSelectionListComponent) entryList: LfSelectionListComponent | undefined;
  /** @internal */
  private selectedItems: LfTreeNode[] | undefined;
  /** @internal */
  private focusedEntry: ItemWithId | undefined;
  /** @internal */
  private _multipleSelectEnabled: boolean = false;
  /** @internal */
  private _pageSize: number = 50;
  /** @internal */
  private _itemSize: number = 42;
  /** @internal */
  repoBrowserUniqueId: string = '';

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
  readonly OPEN = this.localizationService.getStringLaserficheObservable('OPEN');
  /** @internal */
  readonly AN_ERROR_OCCURED = this.localizationService.getStringLaserficheObservable('AN_ERROR_OCCURED');

  /** @internal */
  get shouldShowErrorMessage(): boolean {
    return this.hasError;
  }
  /** @internal */
  readonly THIS_FOLDER_IS_EMPTY = this.localizationService.getStringLaserficheObservable('THIS_FOLDER_IS_EMPTY');
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
  private scrolledIndexChanged = new Subject<void>();
  /**
   * @internal
   * Used to track if data is currently being pulled
   * */
  private lastDataCall?: Promise<ILfSelectable[]>;

  /** @internal */
  constructor(
    /** @internal */
    public ref: ChangeDetectorRef,
    /** @internal */
    public popupDialog: MatDialog,
    /** @internal */
    public zone: NgZone,
    /** @internal */
    private localizationService: AppLocalizationService,
    /** @internal */
    private el: ElementRef
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

  /** @internal */
  ngAfterViewInit(): void {
    const path = window.location.pathname;
    this.repoBrowserUniqueId = `lf-repository-browser_${path}_${this.el.nativeElement.id}`;
    this.ref.detectChanges();
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
    await this.updateAllPossibleEntriesAsync(this._currentFolder);
    this.entryDblClicked.emit([this._currentFolder]);
    setTimeout(() => this.entryList?.focus());
  }

  /**
   * @internal
   * @param entry
   * @returns list of strings that represent img src's
   */
  getIcons(entry: any): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

  /**
   * @internal
   * Handles when a entry in the repository browser is double clicked
   * @param entry
   * @returns
   */
  async onDblClickAsync(treeNode: LfTreeNode | undefined) {
    await this.openChildFolderAsync(treeNode as LfTreeNode);
    this.entryDblClicked.emit([treeNode as LfTreeNode]);
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
    this.focusedEntry = item;
    this.entryFocused.emit(item ? (item as LfTreeNode) : undefined);
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
    if (selectedNodes?.length === 1 && selectedNodes[0].isContainer) {
      await this.openChildFolderAsync(selectedNodes[0]);
    }
    this.entryDblClicked.emit(selectedNodes);
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
    if (!this.maximumChildrenReceived) {
      const data = await this.makeDataCall(this._currentFolder);
      return data;
    }
    return;
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
      currentEntry = await this.treeNodeService.getRootTreeNodeAsync();
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
    this.setColumnsToDisplay(this.entryList?.columns ?? []);
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
      const nextParent: LfTreeNode | undefined = await this.treeNodeService.getParentTreeNodeAsync(currentNode);
      if (nextParent) {
        this.breadcrumbs.push(nextParent);
      }
      currentNode = nextParent;
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
    this.currentFolderChildren = [];
    this.ref.detectChanges();

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
  private async updateAllPossibleEntriesAsync(parentEntry: LfTreeNode, clearSelected: boolean = true) {
    // If we are already getting data we want to wait for that to finish before resetting and pulling new data.
    if (this.lastDataCall) {
      // If we get an error in the last data call just throw it away.
      await this.lastDataCall.catch((error) => undefined);
    }
    if (parentEntry && parentEntry.id) {
      try {
        const lastSelectedItems = this.selectedItems;
        this.isLoading = true;
        this.hasError = false;
        const previousSelectedItems: ILfSelectable[] = await this.getCurrentlySelectedItemsAsync();
        this.resetFolderProperties();
        await this.makeDataCall(parentEntry);
        this.selectedItems = [];
        if (!clearSelected) {
          this.selectedItems = await this.resetPreviouslySelectedItemsAsync(previousSelectedItems);
        }
        if (lastSelectedItems?.length === 0 && this.selectedItems?.length === 0) {
          // do nothing
        } else {
          this.entrySelected.emit(this.selectedItems);
        }
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

  /** @internal */
  private async getCurrentlySelectedItemsAsync() {
    const previousSelectedNodes: LfTreeNode[] | undefined = this.selectedItems;
    const previousSelectedItems: ILfSelectable[] = await this.mapTreeNodesToLfSelectableAsync(
      previousSelectedNodes ?? []
    );
    return previousSelectedItems;
  }

  /** @internal */
  private async resetPreviouslySelectedItemsAsync(
    previousSelectedItems: ILfSelectable[]
  ): Promise<LfTreeNode[] | undefined> {
    this.ref.detectChanges();
    const resetSelectedNodes: ILfSelectable[] = await this.entryList!.setSelectedNodesAsync(
      previousSelectedItems,
      this.checkForMoreDataCallback.bind(this),
      0
    );
    const currentSelectedItems: LfTreeNode[] | undefined = this.convertSelectedItemsToTreeNode(resetSelectedNodes);
    return currentSelectedItems;
  }

  /** @internal */
  private async makeDataCall(parentEntry: LfTreeNode): Promise<ILfSelectable[] | undefined> {
    try {
      this.hasError = false;
      const selectable: ILfSelectable[] = [];
      while (!this.maximumChildrenReceived && selectable.length < this.page_size) {
        this.lastDataCall = this.updateFolderChildrenAsync(parentEntry);
        const additionalData = await this.lastDataCall;
        selectable.push(...additionalData);
        this.lastDataCall = undefined;
      }
      this.currentFolderChildren = this.currentFolderChildren.concat(...selectable);
      return selectable;
    } catch (error) {
      this.hasError = true;
      this.isLoading = false;
      this.ref.detectChanges();
      return undefined;
    }
  }

  /**
   * @internal
   * Does the work to call the treeNodeService and map the returned values to ILfSelectable entries
   * @param parentEntry
   * @returns
   */
  private async updateFolderChildrenAsync(parentEntry: LfTreeNode): Promise<ILfSelectable[]> {
    this.lastCalledPage = this.nextPage;
    const sortState: ColumnOrderBy | undefined = this.column_order_by;
    const dataPage: LfTreeNodePage = await this.treeNodeService.getFolderChildrenAsync(
      parentEntry,
      this.nextPage,
      sortState
    );
    this.nextPage = dataPage.nextPage;
    const pageTreeNodes: LfTreeNode[] = dataPage.page;
    const selectablePage: ILfSelectable[] = await this.mapTreeNodesToLfSelectableAsync(pageTreeNodes);
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
