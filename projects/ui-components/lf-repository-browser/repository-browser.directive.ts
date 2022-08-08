import {
  ChangeDetectorRef,
  Directive,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, filterObjectsByName } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { TreeNodePage, LfTreeNodeService, TreeNode } from './ILFRepositoryService';
// import { ToolbarOption } from '../tree-components/flat-tree-components/lf-toolbar/lf-toolbar.component';
// import * as TreeToolbarUtils from './tree-toolbar-utils';

@Directive()
export abstract class RepositoryBrowserDirective implements OnChanges, OnDestroy {
  @Input() filter_text: string | undefined;
  currentFolderChildren: TreeNode[] = [];
  nextPage: string | undefined;

  @Input()
  get breadcrumbs(): TreeNode[] {
    return this._breadcrumbs;
  }

  /** @internal */
  private _breadcrumbs: TreeNode[] = [];

  protected _currentEntry?: TreeNode;
  /** @internal */
  treeNodeService!: LfTreeNodeService;
  // /** @internal */
  // toolbarOptions: ToolbarOption[] = [];
  // /** @internal */
  // displayedEntries: Entry[] | undefined = [];
  // /** @internal */
  // allPossibleEntries: Entry[] | undefined = [];
  /** @internal */
  isLoading: boolean = false;
  hasError: boolean = false;

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
  ) {}

  /** @internal */
  abstract resetSelection(): void;

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

  /**
   * Initialize with root node open and selected
   * Note: assumes that rootNodes is only one root node (with entry ID = 1)
   */
  /** @internal */
  async initializeWithRootOpenAsync(): Promise<void> {
    const rootEntry: TreeNode | undefined = await this.treeNodeService.getRootTreeNodeAsync();
    if (rootEntry == null) {
      console.error(`Repository browser must have a root entry`);
      this.hasError = true;
      return;
    }
    this.hasError = false;
    await this.setNodeAsParentAsync(rootEntry);
  }

  /** @internal */
  async initializeAsync(parentIdOrListOfAncestorEntries?: string | TreeNode[]): Promise<void> {
    // this.toolbarOptions = this.getToolbarOptions();
    let parentEntry: TreeNode | undefined;
    let listOfAncestorEntries: TreeNode[] | undefined;
    if (!parentIdOrListOfAncestorEntries) {
      await this.initializeWithRootOpenAsync();
      return;
    } else if (typeof parentIdOrListOfAncestorEntries === 'string') {
      parentEntry = await this.treeNodeService.getTreeNodeByIdAsync(parentIdOrListOfAncestorEntries);
    } else if (Array.isArray(parentIdOrListOfAncestorEntries)) {
      parentEntry = parentIdOrListOfAncestorEntries[0];
      listOfAncestorEntries = parentIdOrListOfAncestorEntries;
    }
    // If the entry passed in is not a container we will get the parent of this by default.
    if (parentEntry && !parentEntry.isContainer) {
      parentEntry = await this.treeNodeService.getParentTreeNodeAsync(parentEntry);
    }
    if (parentEntry) {
      await this.setNodeAsParentAsync(parentEntry, listOfAncestorEntries);
      return;
    }
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
  async setNodeAsParentAsync(parentEntry: TreeNode, listOfAncestorEntry?: TreeNode[]): Promise<void> {
    if (!listOfAncestorEntry) {
      await this.initializeBreadcrumbOptionsAsync(parentEntry);
    } else {
      this._breadcrumbs = listOfAncestorEntry;
    }
    this._currentEntry = parentEntry;
    await this.updateAllPossibleEntriesAsync(parentEntry);
  }

  /** @internal */
  private async initializeBreadcrumbOptionsAsync(selectedEntry: TreeNode) {
    this._breadcrumbs = [selectedEntry];
    let currentNode: TreeNode | undefined = selectedEntry;
    while (currentNode) {
      const nextParent: TreeNode | undefined = await this.treeNodeService.getParentTreeNodeAsync(currentNode);
      if (nextParent) {
        this.breadcrumbs.push(nextParent);
      }
      currentNode = nextParent;
    }
  }

  /** @internal */
  async openChildFolderAsync(entry: TreeNode | undefined) {
    if (entry?.isContainer === true) {
      this._breadcrumbs = [entry].concat(this.breadcrumbs);
      this._currentEntry = entry;
      await this.updateAllPossibleEntriesAsync(entry);
    }
  }

  /** @internal */
  async updateAllPossibleEntriesAsync(parentEntry: TreeNode) {
    if (parentEntry) {
      try {
        this.isLoading = true;
        this.hasError = false;
        this.ref.detectChanges();
        this.currentFolderChildren = [];
        this.nextPage = undefined;

        const firstEntryPage: TreeNodePage = await this.treeNodeService.getFolderChildrenAsync(parentEntry);
        this.currentFolderChildren.push(...firstEntryPage.page);
        this.nextPage = firstEntryPage.nextPage;
        this.resetSelection();
      } catch (error) {
        this.resetSelection();
        console.error(error);
        this.hasError = true;
      } finally {
        this.isLoading = false;
        this.ref.detectChanges();
      }
    } else {
      console.error('repository browser updateAllPossibleNodesAsync parentEntry undefined');
      this.hasError = true;
    }
  }

  /** @internal */
  async onBreadcrumbSelected(entry: TreeNode) {
    while (this.breadcrumbs?.length > 0 && this.breadcrumbs[0].id !== entry.id) {
      this._breadcrumbs = this.breadcrumbs.slice(1);
    }
    this._currentEntry = entry;
    await this.updateAllPossibleEntriesAsync(entry);
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
  private async refreshAsync(): Promise<void> {
    if (this._currentEntry == null) {
      console.error('Could not find current entry on refreshAsync');
      return;
    }
    await this.updateAllPossibleEntriesAsync(this._currentEntry);
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
  getIcons(entry: TreeNode): string[] {
    return typeof entry.icon === 'string' ? [entry.icon] : entry.icon;
  }

  /** @internal */
  // private filterDisplayedEntries(filterText?: string) {
  //   this.displayedEntries = filterObjectsByName(this.allPossibleEntries, filterText);
  // }

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
}
