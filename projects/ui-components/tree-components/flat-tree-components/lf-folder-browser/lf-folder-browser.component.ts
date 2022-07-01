import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LfTreeProviders, TreeNode } from '../../utils/lf-tree.service';
import { FlatTreeDirective } from '../flat-tree.directive';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';
import { CoreUtils } from '@laserfiche/lf-js-utils';

@Component({
  selector: 'lf-folder-browser-component',
  templateUrl: './lf-folder-browser.component.html',
  styleUrls: ['./lf-folder-browser.component.css', './../flat-tree.directive.css']
})
export class LfFolderBrowserComponent extends FlatTreeDirective {

  @Input() selected_node: TreeNode | undefined;

  @Output() okClick = new EventEmitter<TreeNode | undefined>();
  @Output() cancelClick = new EventEmitter<TreeNode | undefined>();
  @Output() nodeSelected = new EventEmitter<TreeNode | undefined>();

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
   * function to initialize the lf-folder-browser component
   * @param providers LfTreeProviders service
   * @param selectedNode the id of the node to select, or a TreeNode[] starting from the selected node to the root node
   */
  @Input() initAsync = async (providers: LfTreeProviders, selectedNode?: string | TreeNode[]): Promise<void> => {
    await this.zone.run(async () => {
      this.treeService = CoreUtils.validateDefined(providers.treeService, 'treeService');
      await this.initializeTreeAsync(selectedNode);
    });
  };

  @Input() openSelectedNodeAsync = async () => {
    await this.zone.run(async () => {
      await this.openChildFolderAsync(this.selected_node);
    });
  };

  /** @internal */
  onClickOkButton() {
    this.okClick.emit(this.selected_node);
  }

  /** @internal */
  onClickCancelButton() {
    this.cancelClick.emit(this.selected_node);
  }

  /** @internal */
  resetSelection(): void {
    this.selectNode(undefined);
  }

  /** @internal */
  selectNode(node: TreeNode | undefined) {
    this.selected_node = node?.isSelectable === true ? node : this.breadcrumbs[0];
    this.ref.detectChanges();
    this.nodeSelected.emit(this.selected_node);
  }

  /** @internal */
  get isOkButtonDisabled(): boolean {
    if (this.ok_button_disabled || !this.selected_node?.isSelectable) {
      return true;
    }
    return false;
  }

  @Input() get shouldShowOpenButton(): boolean {
    const selectedNodeIsContainer: boolean = this.selected_node?.isContainer ?? false;
    const parentsExist: boolean = this.breadcrumbs?.length > 0;
    const selectedNodeIsParent: boolean = this.selected_node?.id === this.breadcrumbs[0]?.id;
    return selectedNodeIsContainer && !(parentsExist && selectedNodeIsParent);
  }
}
