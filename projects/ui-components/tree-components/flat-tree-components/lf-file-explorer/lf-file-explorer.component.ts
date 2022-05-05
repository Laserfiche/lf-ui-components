import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatListOption, MatSelectionListChange } from '@angular/material/list';
import { FlatTreeDirective } from '../flat-tree.directive';
import { LfTreeProviders, TreeNode } from '../../utils/lf-tree.service';
import { AppLocalizationService } from '@laserfiche/laserfiche-ui-components/shared';
import { validateDefined } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-file-explorer-component',
  templateUrl: './lf-file-explorer.component.html',
  styleUrls: ['./lf-file-explorer.component.css', './../flat-tree.directive.css']
})
export class LfFileExplorerComponent extends FlatTreeDirective {

  @Input() selected_nodes: TreeNode[] | undefined = [];
  @Input() multiple: boolean = false;

  @Output() okClick = new EventEmitter<TreeNode[] | undefined>();
  @Output() cancelClick = new EventEmitter<TreeNode[] | undefined>();
  @Output() nodeSelected = new EventEmitter<TreeNode[] | undefined>();

  /** @internal */
  _focused_node: TreeNode | undefined;

  /** @internal */
  constructor(
    /** @internal */
    public ref: ChangeDetectorRef,
    /** @internal */
    public popupDialog: MatDialog,
    /** @internal */
    public zone: NgZone,
    /** @internal */
    public localizationService: AppLocalizationService) {
    super(ref, popupDialog, zone, localizationService);
  }

  /**
   * function to initialize the lf-file-explorer component
   * @param providers LfTreeProviders service
   * @param selectedNode the id of the node to select, or a TreeNode[] starting from the selected node to the root node
   */
  @Input() initAsync = async (providers: LfTreeProviders, selectedNode?: string | TreeNode[]): Promise<void> => {
    await this.zone.run(async () => {
      this.treeService = validateDefined(providers.treeService, 'treeService');
      await this.initializeTreeAsync(selectedNode);
    });
  };

  @Input() openSelectedNodeAsync = async () => {
    await this.zone.run(async () => {
      await this.openChildFolderAsync(this.focused_node);
    });
  };
  /** @internal */
  onClickOkButton() {
    this.okClick.emit(this.selected_nodes);
  }

  /** @internal */
  onClickCancelButton() {
    this.cancelClick.emit(this.selected_nodes);
  }

  /** @internal */
  async onPressEnterAsync() {
    await this.openChildFolderAsync(this._focused_node);
  }

  /** @internal */
  onSelectionChange(allSelectedOptions: MatListOption[] | undefined, changes: MatSelectionListChange): void {
    const changedOptions: MatListOption[] = changes.options;
    this._focused_node = changedOptions?.length === 1 ? changedOptions[0].value : undefined;
    const selectedNodes: TreeNode[] | undefined = allSelectedOptions?.map(selection => selection.value);
    const selectableSelectedNodes: TreeNode[] | undefined = selectedNodes?.filter(selection => selection.isSelectable);
    this.selected_nodes = selectableSelectedNodes;
    this.ref.detectChanges();
    this.nodeSelected.emit(this.selected_nodes);
  }

  /** @internal */
  resetSelection(): void {
    this._focused_node = undefined;
    this.selected_nodes = [];
    this.nodeSelected.emit(this.selected_nodes);
  }

  /** @internal */
  get isOkButtonDisabled(): boolean {
    return this.ok_button_disabled || !this.selected_nodes || this.selected_nodes.length === 0;
  }

  @Input() get shouldShowOpenButton(): boolean {
    return this._focused_node?.isContainer === true && this.selected_nodes?.length === 0;
  }

  @Input() get focused_node(): TreeNode | undefined {
    return this._focused_node;
  };
}
