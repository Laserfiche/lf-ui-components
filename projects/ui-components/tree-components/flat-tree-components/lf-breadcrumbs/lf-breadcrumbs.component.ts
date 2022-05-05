import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from '../../utils/lf-tree.service';

@Component({
  selector: 'lf-breadcrumbs-component',
  templateUrl: './lf-breadcrumbs.component.html',
  styleUrls: ['./lf-breadcrumbs.component.css']
})
export class LfBreadcrumbsComponent {

  @Input() breadcrumbs: TreeNode[] = [];
  @Output() breadcrumbSelected = new EventEmitter<TreeNode | undefined>();

  /** @internal */
  constructor() { }

  /** @internal */
  onBreadcrumbSelected(node: TreeNode): void {
    this.breadcrumbSelected.emit(node);
  }

}
