import {
  ChangeDetectorRef,
  Directive,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, Selectable } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { TreeNodePage, LfTreeNodeService, TreeNode } from './ILfTreeNodeService';
// import { ToolbarOption } from '../tree-components/flat-tree-components/lf-toolbar/lf-toolbar.component';
// import * as TreeToolbarUtils from './tree-toolbar-utils';

@Directive()
export abstract class RepositoryBrowserDirective implements OnChanges, OnDestroy {
  @Input() filter_text: string | undefined;
  protected _focused_node: TreeNode | undefined;
  @Input() get breadcrumbs(): TreeNode[] {
    return this._breadcrumbs;
  }
 
  @Output() entrySelected = new EventEmitter<TreeNode[] | undefined>();

  currentFolderChildren: TreeNode[] = [];
  hasError: boolean = false;
  /** @internal */
  isLoading: boolean = false;
  nextPage: string | undefined;
  /** @internal */
  treeNodeService!: LfTreeNodeService;
  // /** @internal */
  // toolbarOptions: ToolbarOption[] = [];
  // /** @internal */
  // displayedEntries: Entry[] | undefined = [];
  // /** @internal */
  // allPossibleEntries: Entry[] | undefined = [];

  protected _currentEntry?: TreeNode;
  protected selectable: Selectable = new Selectable();

  /** @internal */
  private _breadcrumbs: TreeNode[] = [];
  /** @internal */
  private REFRESH: string = 'REFRESH';
  /** @internal */
  // private NEW_FOLDER: string = 'NEW_FOLDER';
  /** @internal */
  private readonly REFRESH_LOCALIZED = this.localizationService.getStringObservable(this.REFRESH);
  /** @internal */
  // private readonly ADD_NEW_FOLDER_LOCALIZED = this.localizationService.getStringObservable(this.NEW_FOLDER);
  /** @internal */
  private readonly allSubscriptions: Subscription = new Subscription();

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
  ) { }

  /** @internal */
  ngOnChanges(changes: SimpleChanges) {
    const filterTextChange: SimpleChange = changes['filter_text'];
    if (filterTextChange && filterTextChange.currentValue !== filterTextChange.previousValue) {
      if (!this._currentEntry) {
        return;
      }
      this.treeNodeService.getFolderChildrenAsync(this._currentEntry).then((entryPage: TreeNodePage) => {
        this.currentFolderChildren.push(...entryPage.page);
        this.nextPage = entryPage.nextPage;
      });
    }
  }

  /**
   * @internal
   */
  ngOnDestroy() {
    this.allSubscriptions?.unsubscribe();
  }

  /** @internal */
  async initializeAsync(currentIdOrEntry?: string | TreeNode): Promise<void> {
    if (this.treeNodeService == null) {
      this.hasError = true;
      throw new Error('Repository Browser cannot be initialized without a data service.');
    }
    // this.toolbarOptions = this.getToolbarOptions();
    let currentEntry: TreeNode | undefined;
    if (currentIdOrEntry == null) {
      await this.initializeWithRootOpenAsync();
      return;
    }
    else if (typeof (currentIdOrEntry) === 'string') {
      currentEntry = await this.treeNodeService.getTreeNodeByIdAsync(currentIdOrEntry);
    }
    else if (typeof(currentIdOrEntry) === 'object') {
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
  async onBreadcrumbClicked(event: {breadcrumbs: TreeNode[], selected: TreeNode}) {
    if (!event.breadcrumbs || !event.selected) {
      console.error('onBreadcrumbClicked event is required to have a breadcrumbs as well as a selected entry');
      return;
    }
    this._breadcrumbs = event.breadcrumbs;
    this._currentEntry = event.selected;
    await this.updateAllPossibleEntriesAsync(this._currentEntry);
  }

  /** @internal */
  // private getToolbarOptions(): ToolbarOption[] {
  //   const toolbarOptions: ToolbarOption[] = [];
  //   const refreshToobarOption: ToolbarOption = {
  //     tag: this.REFRESH,
  //     name: '',
  //     disabled: false
  //   };
  //   const refreshStringSub = this.REFRESH_LOCALIZED.subscribe((value) => {
  //     refreshToobarOption.name = value;
  //   });
  //   this.allSubscriptions.add(refreshStringSub);
  //   toolbarOptions.push(refreshToobarOption);

  //   // if (this.treeService?.addNewFolderAsync) {
  //   //   const addFolderToolbarOption: ToolbarOption = {
  //   //     tag: this.NEW_FOLDER,
  //   //     name: '',
  //   //     disabled: false
  //   //   };
  //     // const newFolderSub = this.ADD_NEW_FOLDER_LOCALIZED.subscribe((value) => {
  //     //   addFolderToolbarOption.name = value;
  //     // });
  //     // this.allSubscriptions.add(newFolderSub);
  //     // toolbarOptions.push(addFolderToolbarOption);
  //   // }
  //   return toolbarOptions;
  // }

  /** @internal */
  async openChildFolderAsync(entry: TreeNode | undefined) {
    if (entry?.isContainer === true) {
      this._breadcrumbs = [entry].concat(this.breadcrumbs);
      this._currentEntry = entry;
      await this.updateAllPossibleEntriesAsync(entry);
    }
  }

  /** @internal */
  async setNodeAsParentAsync(parentEntry: TreeNode, listOfAncestorEntries?: TreeNode[]): Promise<void> {
    if (!parentEntry) {
      console.error('parentEntry must not be null');
      return;
    }
    if(!parentEntry.isContainer) {
      console.error('parentEntry must be a container');
      return;
    }
    if (listOfAncestorEntries == null) {
      await this.initializeBreadcrumbOptionsAsync(parentEntry);
    }
    else {
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

        const firstEntryPage: TreeNodePage = await this.treeNodeService.getFolderChildrenAsync(parentEntry);
        this.currentFolderChildren.push(...firstEntryPage.page);
        this.nextPage = firstEntryPage.nextPage;
        this.entrySelected.emit(this.selectable.selectedItems as TreeNode[]);

      }
      catch (error) {
        console.error(error);
        this.hasError = true;
      }
      finally {
        this.isLoading = false;
        this.ref.detectChanges();
      }
    }
    else {
      console.error('updateAllPossibleEntriesAsync parentEntry undefined or missing id property');
      this.hasError = true;
    }
  }

  private resetFolderProperties() {
    this.hasError = false;
    this.ref.detectChanges();
    this.selectable.clearSelectedValues(this.currentFolderChildren);
    this.currentFolderChildren = [];
    this._focused_node = undefined;
    this.nextPage = undefined;
  }

  /** @internal */
  // async onToolbarOptionSelectedAsync(option: ToolbarOption): Promise<void> {
  //   switch (option.tag) {
  //     case this.REFRESH:
  //       await this.refreshTreeAsync();
  //       break;
  //     // case this.NEW_FOLDER:
  //     //   await this.addNewFolderAsync();
  //     //   break;
  //     default:
  //       break;
  //   }
  // }

  /** @internal */
  getIcons(entry: TreeNode): string[] {
    return typeof (entry.icon) === 'string' ? [entry.icon] : entry.icon;
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

  /** @internal */
  readonly NO_MATCHING_ENTRIES_FOUND = this.localizationService.getStringObservable('NO_MATCHING_ENTRIES_FOUND');

  /** @internal */
  get shouldShowNoMatchesMessage(): boolean {
    return this.treeNodeService != null && this.currentFolderChildren.length === 0 && !!this.filter_text;
  }

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
      } catch(error) {
        console.error(error);
        return;
      }
    }
  }

  /** @internal */
  // private async addNewFolderAsync(): Promise<void> {
  //   await this.zone.run(async () => {
  //     const result = await TreeToolbarUtils.openNewFolderDialogAsync(this.treeService, this.breadcrumbs[0], this.popupDialog);
  //     if (result === 'OK') { // Should not be localized
  //       await this.refreshTreeAsync();
  //     }
  //   });
  // }

  /** @internal */
  private async refreshAsync(): Promise<void> {
    if (this._currentEntry == null) {
      console.error('Could not find current entry on refreshAsync');
      return;
    }
    await this.updateAllPossibleEntriesAsync(this._currentEntry, true);
  }

}

