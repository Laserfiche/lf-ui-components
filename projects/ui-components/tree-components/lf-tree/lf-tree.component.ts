import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Output, EventEmitter, Input, NgZone, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LfTreeProviders, LfTreeService, TreeNode } from './../utils/lf-tree.service';
import { DataSource, CollectionViewer, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, merge, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LfTreeKeysDirective } from './lf-tree-keys.directive';
import { TimeUtils, validateDefined } from '@laserfiche/lf-js-utils';

interface TreeNodeEx extends TreeNode {
  level: number;
}

@Component({
  selector: 'lf-tree-component',
  templateUrl: './lf-tree.component.html',
  styleUrls: ['./lf-tree.component.css'],
})
export class LfTreeComponent extends LfTreeKeysDirective implements OnDestroy {
  /** @internal */
  treeControl!: FlatTreeControl<TreeNodeEx>;
  /** @internal */
  treeService!: LfTreeService;
  /** @internal */
  dataSource!: DynamicDataSource;
  /** @internal */
  dataSourceSub: Subscription | undefined;
  /** @internal */
  matTreeNodeIndent: number = 20; // each node is indented (maxTreeNodeIndent * level)px

  @Input() ok_button_disabled: boolean = false;

  @Input() selected_node: TreeNode | undefined;
  @Output() nodeSelected = new EventEmitter<TreeNode | undefined>();

  @Input() description: string | undefined;
  @Input() ok_button_text: string | undefined;
  @Input() cancel_button_text: string | undefined;
  @Output() okClick = new EventEmitter<TreeNode>();
  @Output() cancelClick = new EventEmitter<TreeNode>();

  @Input() initAsync = async (providers: LfTreeProviders, selectedNodeId?: string): Promise<void> => {
    await this.zone.run(async () => {
      this.treeControl = new FlatTreeControl<TreeNodeEx>(
        (node) => node.level,
        (node) => node.isContainer
      );

      this.treeService = validateDefined(providers.treeService, 'treeService');
      this.dataSource = new DynamicDataSource(this.treeControl, this.treeService);
      this.ref.detectChanges();

      const rootNodes = await this.getRootNodesAsync();
      this.dataSource.data = rootNodes;
      this.dataSourceSub = this.dataSource.dataChange.subscribe((updatedNodes: TreeNode[]) => {
        if (updatedNodes.findIndex(node => node.id === this.selected_node?.id) === -1) {
          this.selectNodeForce(undefined);
        }
      });

      if (selectedNodeId) {
        await this.initializeTreeAsync(rootNodes, selectedNodeId);
      } else if (rootNodes.length > 0) {
        await this.initializeTreeAsync(rootNodes, rootNodes[0]);
      } else {
        console.warn('No nodes to display');
      }

      setTimeout(() => {
        if (this.selected_node?.id) {
          const selectedNodeElement: HTMLElement | undefined = document.getElementById(this.selected_node.id) ?? undefined;
          if (selectedNodeElement) {
            this.setFocusItem(selectedNodeElement);
          }
        }
      });
    });
  };

  /** @internal */
  constructor(
    /** @internal */
    private zone: NgZone,
    /** @internal */
    private ref: ChangeDetectorRef) {
    super();
  }

  private async getRootNodesAsync() {
    const rootNodes = await this.treeService.getRootNodesAsync();
    const rootNodesWithLevel = rootNodes.map((node) => {
      const newNode: TreeNodeEx = { ...node, level: 1 };
      return newNode;
    });
    return rootNodesWithLevel;
  }

  /** @internal */
  onClickTreeNode(node: TreeNode, event?: MouseEvent): void {
    this.zone.run(() => {
      this.selectNode(node);
      if (event?.currentTarget) {
        this.setFocusItem(event.currentTarget as HTMLElement);
      }
    });
  }

  /** @internal */
  getIcons(node: TreeNode): string[] {
    // TODO add error icon if there is an error on node
    if (typeof (node.icon) === 'string') {
      return [node.icon];
    }
    else {
      return node.icon;
    }
  }

  /** @internal */
  onDblClickTreeNode(event: MouseEvent): void {
    this.zone.run(() => {
      if (event.currentTarget != null) {
        this.setFocusItem(event.currentTarget as HTMLElement);
        const toggle = this.focusedElement?.querySelector('[matTreeNodeToggle]') as HTMLElement;
        if (toggle) {
          toggle.click();
        }
      }
    });
  }

  /** @internal */
  onClickOkButton() {
    this.okClick.emit(this.selected_node);
  }

  /** @internal */
  onClickCancelButton() {
    this.cancelClick.emit(this.selected_node);
  }

  /** @internal */
  hasChild = (_: number, node: TreeNode) => node.isContainer;

  /** @internal */
  private async initializeTreeAsync(rootNodes: TreeNodeEx[], node: string | TreeNodeEx): Promise<void> {
    let ancestors = await this.getAncestorNodesAsync(this.treeService, node);
    if (ancestors.length === 0) {
      if (rootNodes.length === 0) {
        console.warn('No ancestors and no root nodes');
        return;
      }
      ancestors = [rootNodes[0]];
    }

    const targetNode = ancestors[0];
    await this.expandAncestorsAsync(ancestors);
    this.selectNode(targetNode);
    const preFocusedElement = document.getElementsByClassName('lf-mat-tree-node')[0];
    this.focusedElement = preFocusedElement as HTMLElement;
  }

  /** @internal */
  private async expandAncestorsAsync(ancestors: TreeNodeEx[]): Promise<void> {
    let subscription: Subscription | undefined;
    await new Promise<void>((resolve, reject) => {
      let ancestor: TreeNodeEx | undefined = ancestors.pop(); // first pop() returns root node
      subscription = this.dataSource.dataChange.subscribe((updatedNodes: TreeNodeEx[]) => {
        const foundAncestor = updatedNodes.find(node => node.id === ancestor?.id);
        if (foundAncestor) {
          if (ancestors.length > 0) {
            ancestor = ancestors.pop();
            // triggers another dataChange that will recursively call this code
            this.expand(foundAncestor);
          } else {
            resolve();
          }
        } else {
          console.warn('expand ancestors failed');
          reject();
        }
      });
    });
    subscription?.unsubscribe();
  }

  /** @internal */
  private expand(node: TreeNodeEx) {
    const dataNode: TreeNodeEx | undefined = this.treeControl.dataNodes.find(
      nodeInTreeControl => nodeInTreeControl.id === node.id
    );
    if (dataNode) {
      this.treeControl.expand(dataNode);
    }
  }

  /**
   * @internal
   * Returns [node, parentNode, grandparentNode, ...]
   */
  private async getAncestorNodesAsync(treeService: LfTreeService, node: string | TreeNodeEx): Promise<TreeNodeEx[]> {
    let startNode: TreeNode | undefined;
    if (typeof node === 'string') {
      startNode = await treeService.getNodeByIdAsync(node);
    } else {
      startNode = node;
    }

    if (!startNode) {
      return [];
    }

    const ancestors: TreeNode[] = [startNode];
    while (true) {
      const currentNode = ancestors[ancestors.length - 1];
      const parentNode = await treeService.getParentNodeAsync(currentNode);
      if (!parentNode) {
        break;
      }
      ancestors.push(parentNode);
    }

    const leveled = this.addLevelToNodes(ancestors);

    return leveled;
  }

  private addLevelToNodes(ancestors: TreeNode[]) {
    let level: 1;
    const nodesWithLevel = ancestors.map((node) => {
      const newNode: TreeNodeEx = { ...node, level };
      ++level;
      return newNode;
    });
    return nodesWithLevel;
  }

  /** @internal */
  private selectNode(node: TreeNode): void {
    const nodeToSelect: TreeNode | undefined = node.isSelectable ? node : undefined;
    this.selectNodeForce(nodeToSelect);
  }

  /** @internal */
  private selectNodeForce(node: TreeNode | undefined) {
    this.selected_node = node;
    this.nodeSelected.emit(node);
  }

  /** @internal */
  ngOnDestroy() {
    this.dataSourceSub?.unsubscribe();
  }
}

/** @internal */
export class DynamicDataSource implements DataSource<TreeNodeEx> {
  dataChange = new BehaviorSubject<TreeNodeEx[]>([]);

  get data(): TreeNodeEx[] {
    return this.dataChange.value;
  }
  set data(value: TreeNodeEx[]) {
    this.treeControl.dataNodes = value;
    this.dataChange.next(value);
  }

  constructor(private treeControl: FlatTreeControl<TreeNodeEx, TreeNodeEx>, private treeService: LfTreeService) { }

  connect(collectionViewer: CollectionViewer): Observable<TreeNodeEx[]> {
    this.treeControl.expansionModel.changed.subscribe((change) => {
      if ((change as SelectionChange<TreeNodeEx>).added || (change as SelectionChange<TreeNodeEx>).removed) {
        this.handleTreeControl(change as SelectionChange<TreeNodeEx>);
      }
    });

    return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
  }

  disconnect(collectionViewer: CollectionViewer): void { }

  /** Handle expand/collapse behaviors */
  handleTreeControl(change: SelectionChange<TreeNodeEx>) {
    if (change.added) {
      change.added.forEach(async (node) => await this.toggleNode(node, true));
    }
    if (change.removed) {
      change.removed
        .slice()
        .reverse()
        .forEach(async (node) => await this.toggleNode(node, false));
    }
  }

  /**
   * Toggle the node, remove from display list
   */
  async toggleNode(node: TreeNodeEx, expand: boolean) {

    const index = this.data.indexOf(node);
    if (index < 0) {
      return;
    }

    if (expand && node.isContainer) {
      this.data[index].isLoadingChildren = true;
      await TimeUtils.yieldAsync();
      const children = await this.getChildrenAsync(node);
      this.data[index].isLoadingChildren = false;
      await TimeUtils.yieldAsync();
      if (!children) {
        return;
      }
      if (children.length === 0) {
        this.data[index].isContainer = false;
        return;
      }
      // Do not add children if they already were added (if user clicked too many times too fast)
      if (children[0]?.id === this.data[index + 1]?.id) {
        return;
      }
      const nodes: TreeNodeEx[] = children.map((nodeNext) => {
        nodeNext.level = node.level + 1;
        return nodeNext;
      });
      this.data.splice(index + 1, 0, ...nodes);
    } else {
      let count = 0;
      for (let i = index + 1; i < this.data.length && this.data[i].level > node.level; i++, count++) { }
      this.data.splice(index + 1, count);
    }

    // notify the change
    this.dataChange.next(this.data);
  }

  async getChildrenAsync(node: TreeNodeEx): Promise<TreeNodeEx[]> {
    const nodes = await this.treeService.getChildrenAsync(node);
    const parentLevel = node.level;
    const childrenLevel = parentLevel + 1;
    const nodesWithLevel = nodes.map((node) => {
      const newNode: TreeNodeEx = {
        ...node,
        level: childrenLevel
      };
      return newNode;
    });
    return nodesWithLevel;
  }
}
