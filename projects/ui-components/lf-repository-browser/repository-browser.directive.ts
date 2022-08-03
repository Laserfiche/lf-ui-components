import { ChangeDetectorRef, Directive, Input, NgZone, OnChanges, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, filterObjectsByName } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { LfRepositoryService, Entry } from './ILFRepositoryService';
import { ToolbarOption } from '../tree-components/flat-tree-components/lf-toolbar/lf-toolbar.component';
// import * as TreeToolbarUtils from './tree-toolbar-utils';

@Directive()
export abstract class RepositoryBrowserDirective implements OnChanges, OnDestroy {
  @Input() filter_text: string | undefined;

  @Input()
  get breadcrumbs(): Entry[] {
    return this._breadcrumbs;
  }

  /** @internal */
  private _breadcrumbs: Entry[] = [];
  /** @internal */
  dataService!: LfRepositoryService;
  /** @internal */
  toolbarOptions: ToolbarOption[] = [];
  /** @internal */
  displayedEntries: Entry[] | undefined = [];
  /** @internal */
  allPossibleEntries: Entry[] | undefined = [];
  /** @internal */
  isLoading: boolean = false;

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
  abstract resetSelection(): void;

  /** @internal */
  ngOnChanges(changes: SimpleChanges) {
    const filterTextChange: SimpleChange = changes['filter_text'];
    if (filterTextChange && (filterTextChange.currentValue !== filterTextChange.previousValue)) {
      this.filterDisplayedEntries(filterTextChange.currentValue);
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
    const rootEntry: Entry | undefined = await this.dataService.getRootEntryAsync();
    if (rootEntry == null) {
      console.error(`Repository browser must have a root entry`);
      this.allPossibleEntries = undefined;
      this.displayedEntries = undefined;
      return;
    }
    await this.setNodeAsParentAsync(rootEntry);
  }

  /** @internal */
  async initializeAsync(parentIdOrListOfAncestorEntries?: string | Entry[]): Promise<void> {
    this.toolbarOptions = this.getToolbarOptions();
    let parentEntry: Entry | undefined;
    let listOfAncestorEntries: Entry[] | undefined;
    if (!parentIdOrListOfAncestorEntries) {
      await this.initializeWithRootOpenAsync();
      return;
    }
    else if (typeof (parentIdOrListOfAncestorEntries) === 'string') {
      parentEntry = await this.dataService.getEntryByIdAsync(parentIdOrListOfAncestorEntries);
    }
    else if (Array.isArray(parentIdOrListOfAncestorEntries)) {
      parentEntry = parentIdOrListOfAncestorEntries[0];
      listOfAncestorEntries = parentIdOrListOfAncestorEntries;
    }
    // If the entry passed in is not a container we will get the parent of this by default.
    if (parentEntry && !parentEntry.isContainer) {
      parentEntry = await this.dataService.getParentEntryAsync(parentEntry);
    }
    if (parentEntry) {
      await this.setNodeAsParentAsync(parentEntry, listOfAncestorEntries);
      return;
    }
  }

  /** @internal */
  private getToolbarOptions(): ToolbarOption[] {
    const toolbarOptions: ToolbarOption[] = [];
    const refreshToobarOption: ToolbarOption = {
      tag: this.REFRESH,
      name: '',
      disabled: false
    };
    const refreshStringSub = this.REFRESH_LOCALIZED.subscribe((value) => {
      refreshToobarOption.name = value;
    });
    this.allSubscriptions.add(refreshStringSub);
    toolbarOptions.push(refreshToobarOption);

    // if (this.treeService?.addNewFolderAsync) {
    //   const addFolderToolbarOption: ToolbarOption = {
    //     tag: this.NEW_FOLDER,
    //     name: '',
    //     disabled: false
    //   };
      // const newFolderSub = this.ADD_NEW_FOLDER_LOCALIZED.subscribe((value) => {
      //   addFolderToolbarOption.name = value;
      // });
      // this.allSubscriptions.add(newFolderSub);
      // toolbarOptions.push(addFolderToolbarOption);
    // }
    return toolbarOptions;
  }

  /** @internal */
  async setNodeAsParentAsync(parentNode: Entry, listOfAncestorNodes?: Entry[]): Promise<void> {
    if (!listOfAncestorNodes) {
      await this.initializeBreadcrumbOptionsAsync(parentNode);
    }
    else {
      this._breadcrumbs = listOfAncestorNodes;
    }
    await this.updateAllPossibleEntriesAsync(parentNode);
  }

  /** @internal */
  private async initializeBreadcrumbOptionsAsync(selectedNode: Entry) {
    this._breadcrumbs = [selectedNode];
    let currentNode: Entry | undefined = selectedNode;
    while (currentNode) {
      const nextParent: Entry | undefined = await this.dataService.getParentEntryAsync(currentNode);
      if (nextParent) {
        this.breadcrumbs.push(nextParent);
      }
      currentNode = nextParent;
    }
  }

  /** @internal */
  async openChildFolderAsync(node: Entry | undefined) {
    if (node?.isContainer === true) {
      this._breadcrumbs = [node].concat(this.breadcrumbs);
      await this.updateAllPossibleEntriesAsync(node);
    }
  }

  /** @internal */
  async updateAllPossibleEntriesAsync(parentEntry: Entry, refresh?: boolean) {
    if (parentEntry) {
      try {
        this.isLoading = true;
        this.ref.detectChanges();
        let newDisplayedNodes: Entry[] = [];

        newDisplayedNodes = await this.dataService.getData(parentEntry.id, true);

        this.allPossibleEntries = newDisplayedNodes ?? [];
        this.filterDisplayedEntries(this.filter_text);
        this.resetSelection();
      }
      catch (error) {
        this.allPossibleEntries = undefined;
        this.displayedEntries = undefined;
        this.resetSelection();
        console.error(error);
      }
      finally {
        this.isLoading = false;
        this.ref.detectChanges();
      }
    }
    else {
      console.error('flat-tree updateAllPossibleNodesAsync parentNode undefined');
    }
  }

  /** @internal */
  async onBreadcrumbSelected(node: Entry) {
    while (this.breadcrumbs?.length > 0 && this.breadcrumbs[0].id !== node.id) {
      this._breadcrumbs = this.breadcrumbs.slice(1);
    }
    await this.updateAllPossibleEntriesAsync(node);
  }

  /** @internal */
  async onToolbarOptionSelectedAsync(option: ToolbarOption): Promise<void> {
    switch (option.tag) {
      case this.REFRESH:
        await this.refreshTreeAsync();
        break;
      // case this.NEW_FOLDER:
      //   await this.addNewFolderAsync();
      //   break;
      default:
        break;
    }
  }

  /** @internal */
  private async refreshTreeAsync(): Promise<void> {
    const parentNode = this.breadcrumbs[0];
    await this.updateAllPossibleEntriesAsync(parentNode, true);
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
  getIcons(node: Entry): string[] {
    return typeof (node.icon) === 'string' ? [node.icon] : node.icon;
  }

  /** @internal */
  private filterDisplayedEntries(filterText?: string) {
    this.displayedEntries = filterObjectsByName(this.allPossibleEntries, filterText);
  }


  /** @internal */
  readonly OPEN = this.localizationService.getStringObservable('OPEN');

  /** @internal */
  readonly AN_ERROR_OCCURED = this.localizationService.getStringObservable('AN_ERROR_OCCURED');

  /** @internal */
  get shouldShowErrorMessage(): boolean {
    return !this.displayedEntries;
  }

  /** @internal */
  readonly THIS_FOLDER_IS_EMPTY = this.localizationService.getStringObservable('THIS_FOLDER_IS_EMPTY');

  /** @internal */
  get shouldShowEmptyMessage(): boolean {
    return this.allPossibleEntries?.length === 0;
  }

  /** @internal */
  readonly NO_MATCHING_ENTRIES_FOUND = this.localizationService.getStringObservable('NO_MATCHING_ENTRIES_FOUND');

  /** @internal */
  get shouldShowNoMatchesMessage(): boolean {
    return this.allPossibleEntries !== undefined && this.allPossibleEntries.length > 0 && this.displayedEntries?.length === 0;
  }

}

