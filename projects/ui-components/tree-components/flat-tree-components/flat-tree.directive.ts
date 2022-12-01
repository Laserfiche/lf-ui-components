import { ChangeDetectorRef, Directive, Input, NgZone, OnChanges, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppLocalizationService, filterObjectsByName } from '@laserfiche/lf-ui-components/shared';
import { Subscription } from 'rxjs';
import { LfTreeService, TreeNode } from '../utils/lf-tree.service';
import { ToolbarOption } from './lf-toolbar/lf-toolbar.component';
import * as TreeToolbarUtils from './tree-toolbar-utils';

@Directive()
export abstract class FlatTreeDirective implements OnChanges, OnDestroy {

  @Input() ok_button_text: string | undefined;
  @Input() cancel_button_text: string | undefined;
  @Input() ok_button_disabled: boolean = false;
  @Input() filter_text: string | undefined;

  @Input()
  get breadcrumbs(): TreeNode[] {
    return this._breadcrumbs;
  }

  /** @internal */
  private _breadcrumbs: TreeNode[] = [];
  /** @internal */
  treeService!: LfTreeService;
  /** @internal */
  toolbarOptions: ToolbarOption[] = [];
  /** @internal */
  displayedNodes: TreeNode[] | undefined = [];
  /** @internal */
  allPossibleNodes: TreeNode[] | undefined = [];
  /** @internal */
  isLoading: boolean = false;

  /** @internal */
  private REFRESH: string = 'REFRESH';
  /** @internal */
  private NEW_FOLDER: string = 'NEW_FOLDER';
  /** @internal */
  private readonly REFRESH_LOCALIZED = this.localizationService.getStringLaserficheObservable(this.REFRESH);
  /** @internal */
  private readonly ADD_NEW_FOLDER_LOCALIZED = this.localizationService.getStringLaserficheObservable(this.NEW_FOLDER);
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
  abstract get shouldShowOpenButton(): boolean;
  /** @internal */
  abstract resetSelection(): void;

  /** @internal */
  ngOnChanges(changes: SimpleChanges) {
    const filterTextChange: SimpleChange = changes['filter_text'];
    if (filterTextChange && (filterTextChange.currentValue !== filterTextChange.previousValue)) {
      this.filterDisplayedNodes(filterTextChange.currentValue);
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
  async initializeTreeWithRootOpenAsync(): Promise<void> {
    const rootNodes: TreeNode[] = await this.treeService.getRootNodesAsync();
    if (rootNodes && rootNodes.length > 0) {
      const rootNode = rootNodes[0];
      await this.setNodeAsParentAsync(rootNode);
    }
    else {
      console.error('flat-tree initializeTreeWithRootOpenAsync rootNodes undefined');
    }
  }

  /** @internal */
  async initializeTreeAsync(parentIdOrListOfAncestorNodes?: string | TreeNode[]): Promise<void> {
    this.toolbarOptions = this.getToolbarOptionsFromTreeService();
    let parentNode: TreeNode | undefined;
    let listOfAncestorNodes: TreeNode[] | undefined;
    if (!parentIdOrListOfAncestorNodes) {
      await this.initializeTreeWithRootOpenAsync();
      return;
    }
    else if (typeof (parentIdOrListOfAncestorNodes) === 'string') {
      parentNode = await this.treeService.getNodeByIdAsync(parentIdOrListOfAncestorNodes);
    }
    else if (Array.isArray(parentIdOrListOfAncestorNodes)) {
      parentNode = parentIdOrListOfAncestorNodes[0];
      listOfAncestorNodes = parentIdOrListOfAncestorNodes;
    }
    if (parentNode && !parentNode.isContainer) {
      parentNode = await this.treeService.getParentNodeAsync(parentNode);
    }
    if (parentNode) {
      await this.setNodeAsParentAsync(parentNode, listOfAncestorNodes);
      return;
    }
  }

  /** @internal */
  private getToolbarOptionsFromTreeService(): ToolbarOption[] {
    const toolbarOptions: ToolbarOption[] = [];
    if (this.treeService?.refreshAsync) {
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
    }
    if (this.treeService?.addNewFolderAsync) {
      const addFolderToolbarOption: ToolbarOption = {
        tag: this.NEW_FOLDER,
        name: '',
        disabled: false
      };
      const newFolderSub = this.ADD_NEW_FOLDER_LOCALIZED.subscribe((value) => {
        addFolderToolbarOption.name = value;
      });
      this.allSubscriptions.add(newFolderSub);
      toolbarOptions.push(addFolderToolbarOption);
    }
    return toolbarOptions;
  }

  /** @internal */
  async setNodeAsParentAsync(parentNode: TreeNode, listOfAncestorNodes?: TreeNode[]): Promise<void> {
    if (!listOfAncestorNodes) {
      await this.initializeBreadcrumbOptionsAsync(parentNode);
    }
    else {
      this._breadcrumbs = listOfAncestorNodes;
    }
    await this.updateAllPossibleNodesAsync(parentNode);
  }

  /** @internal */
  private async initializeBreadcrumbOptionsAsync(selectedNode: TreeNode) {
    this._breadcrumbs = [selectedNode];
    let currentNode: TreeNode | undefined = selectedNode;
    while (currentNode) {
      const nextParent: TreeNode | undefined = await this.treeService.getParentNodeAsync(currentNode);
      if (nextParent) {
        this.breadcrumbs.push(nextParent);
      }
      currentNode = nextParent;
    }
  }

  /** @internal */
  async openChildFolderAsync(node: TreeNode | undefined) {
    if (node?.isContainer === true) {
      this._breadcrumbs = [node].concat(this.breadcrumbs);
      await this.updateAllPossibleNodesAsync(node);
    }
  }

  /** @internal */
  async updateAllPossibleNodesAsync(parentNode: TreeNode, refresh?: boolean) {
    if (parentNode) {
      try {
        this.isLoading = true;
        this.ref.detectChanges();
        let newDisplayedNodes: TreeNode[] = [];
        if (refresh && this.treeService?.refreshAsync) {
          newDisplayedNodes = await this.treeService.refreshAsync(parentNode);
        }
        else {
          newDisplayedNodes = await this.treeService.getChildrenAsync(parentNode);
        }
        this.allPossibleNodes = newDisplayedNodes ?? [];
        this.filterDisplayedNodes(this.filter_text);
        this.resetSelection();
      }
      catch (error) {
        this.allPossibleNodes = undefined;
        this.displayedNodes = undefined;
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
  async onBreadcrumbSelected(node: TreeNode) {
    while (this.breadcrumbs?.length > 0 && this.breadcrumbs[0].id !== node.id) {
      this._breadcrumbs = this.breadcrumbs.slice(1);
    }
    await this.updateAllPossibleNodesAsync(node);
  }

  /** @internal */
  async onToolbarOptionSelectedAsync(option: ToolbarOption): Promise<void> {
    switch (option.tag) {
      case this.REFRESH:
        await this.refreshTreeAsync();
        break;
      case this.NEW_FOLDER:
        await this.addNewFolderAsync();
        break;
      default:
        break;
    }
  }

  /** @internal */
  private async refreshTreeAsync(): Promise<void> {
    const parentNode = this.breadcrumbs[0];
    await this.updateAllPossibleNodesAsync(parentNode, true);
  }

  /** @internal */
  private async addNewFolderAsync(): Promise<void> {
    await this.zone.run(async () => {
      const result = await TreeToolbarUtils.openNewFolderDialogAsync(this.treeService, this.breadcrumbs[0], this.popupDialog);
      if (result === 'OK') { // Should not be localized
        await this.refreshTreeAsync();
      }
    });
  }

  /** @internal */
  getIcons(node: TreeNode): string[] {
    return typeof (node.icon) === 'string' ? [node.icon] : node.icon;
  }

  /** @internal */
  private filterDisplayedNodes(filterText?: string) {
    this.displayedNodes = filterObjectsByName(this.allPossibleNodes, filterText);
  }

  /** @internal */
  get shouldShowOkButton(): boolean {
    return !this.shouldShowOpenButton && (this.ok_button_text !== undefined) && (this.ok_button_text.length > 0);
  }

  /** @internal */
  readonly OPEN = this.localizationService.getStringLaserficheObservable('OPEN');

  /** @internal */
  readonly AN_ERROR_OCCURED = this.localizationService.getStringLaserficheObservable('AN_ERROR_OCCURED');

  /** @internal */
  get shouldShowErrorMessage(): boolean {
    return !this.displayedNodes;
  }

  /** @internal */
  readonly THIS_FOLDER_IS_EMPTY = this.localizationService.getStringLaserficheObservable('THIS_FOLDER_IS_EMPTY');

  /** @internal */
  get shouldShowEmptyMessage(): boolean {
    return this.allPossibleNodes?.length === 0;
  }

  /** @internal */
  readonly NO_MATCHING_ENTRIES_FOUND = this.localizationService.getStringLaserficheObservable('NO_MATCHING_ENTRIES_FOUND');

  /** @internal */
  get shouldShowNoMatchesMessage(): boolean {
    return this.allPossibleNodes !== undefined && this.allPossibleNodes.length > 0 && this.displayedNodes?.length === 0;
  }

}

