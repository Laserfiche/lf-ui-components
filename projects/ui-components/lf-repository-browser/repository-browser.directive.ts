import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewChild} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { AppLocalizationService, ILfSelectable } from '@laserfiche/lf-ui-components/shared';
import { TreeNodePage, LfTreeNodeService, TreeNode } from './ILfTreeNodeService';
import { LfListComponent } from './lf-list.component';

@Directive()
export abstract class RepositoryBrowserDirective {
  @ViewChild(LfListComponent) entryList: LfListComponent | undefined;

  // @Input() filter: (node: TreeNode) => Promise<boolean>;
  @Input() get breadcrumbs(): TreeNode[] {
    return this._breadcrumbs;
  }

  @Input() multiple: boolean = false;

  @Input() isSelectable?: (treeNode: TreeNode) => Promise<boolean>;

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
  protected _focused_node: TreeNode | undefined;

  /** @internal */
  protected _currentEntry?: TreeNode;
  /** @internal */
  // protected selectable: Selectable = new Selectable();

  /** @internal */
  private _breadcrumbs: TreeNode[] = [];

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
  ) {}

  async checkForMoreDataCallback() {
    if (this._currentEntry == null) {
      return;
    }
    const selectablePage = await this.updateFolderChildrenAsync(this._currentEntry);
    return selectablePage;
  }

  /** @internal */
  async initializeAsync(currentIdOrEntry?: string | TreeNode): Promise<void> {
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
   * Initialize with root node open and selected
   * Note: assumes that rootNodes is only one root node (with entry ID = 1)
   */
  /** @internal */
  async initializeWithRootOpenAsync(): Promise<void> {
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

  /** @internal */
  async onBreadcrumbClicked(event: { breadcrumbs: TreeNode[]; selected: TreeNode }) {
    if (!event.breadcrumbs || !event.selected) {
      console.error('onBreadcrumbClicked event is required to have a breadcrumbs as well as a selected entry');
      return;
    }
    this._breadcrumbs = event.breadcrumbs;
    this._currentEntry = event.selected;
    await this.updateAllPossibleEntriesAsync(this._currentEntry);
    this.entryList?.focus();
  }

  async onDblClickAsync(entry: TreeNode | undefined) {
    if (!entry?.isContainer) {
      return;
    }
    await CoreUtils.yieldAsync();
    //this.selectable.clearSelectedValues(this.currentFolderChildren);
    await this.openChildFolderAsync(entry);
  }

  /** @internal */
  async openChildFolderAsync(entry: TreeNode | undefined) {
    if (entry?.isContainer === true) {
      this._breadcrumbs = [entry].concat(this.breadcrumbs);
      this._currentEntry = entry;
      await this.updateAllPossibleEntriesAsync(entry);

      this.entryList?.focus();
    }
  }

  /** @internal */
  async setNodeAsParentAsync(parentEntry: TreeNode, listOfAncestorEntries?: TreeNode[]): Promise<void> {
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

  /** @internal */
  async updateAllPossibleEntriesAsync(parentEntry: TreeNode, refresh: boolean = false) {
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

  /** @internal */
  protected async updateFolderChildrenAsync(parentEntry: TreeNode): Promise<ILfSelectable[]> {
    const firstEntryPage: TreeNodePage = await this.treeNodeService.getFolderChildrenAsync(parentEntry, this.nextPage);
    this.nextPage = firstEntryPage.nextPage;
    const page = firstEntryPage.page;
    const selectablePage: ILfSelectable[] = await this.mapTreeNodesToLfSelectableAsync(page);

    this.currentFolderChildren = this.currentFolderChildren.concat(...selectablePage);
    
    return selectablePage;
  }

  protected async mapTreeNodesToLfSelectableAsync(page: TreeNode[]) {
    const selectablePage: ILfSelectable[] = [];
    for (const value of page) {
      const selectableValue = {
        value,
        isSelectable: this.isSelectable ? await this.isSelectable(value) : true,
        isSelected: false,
      };
      selectablePage.push(selectableValue);
    }
    return selectablePage;
  }

  /** @internal */
  private resetFolderProperties() {
    this.hasError = false;
    this.entryList?.clearSelectedValues();
    this.ref.detectChanges();
    this.currentFolderChildren = [];
    this._focused_node = undefined;
    this.nextPage = undefined;
  }

  /** @internal */
  getIcons(entry: TreeNode): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

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

  // /** @internal */
  // readonly NO_MATCHING_ENTRIES_FOUND = this.localizationService.getStringObservable('NO_MATCHING_ENTRIES_FOUND');

  // /** @internal */
  // get shouldShowNoMatchesMessage(): boolean {
  //   return this.treeNodeService != null && this.currentFolderChildren.length === 0 && !this.hasError;
  // }

  /** @internal */
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

  /** @internal */
  protected convertSelectedItemsToTreeNode(selected: ILfSelectable[]): TreeNode[] | undefined {
    return selected.map(value => value.value) as TreeNode[];
  }
}
