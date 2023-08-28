import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LfBreadcrumb } from './lf-breadcrumbs-types';

@Component({
  selector: 'lf-breadcrumbs-component',
  templateUrl: './lf-breadcrumbs.component.html',
  styleUrls: ['./lf-breadcrumbs.component.css']
})
export class LfBreadcrumbsComponent {
  @Input() breadcrumbs: LfBreadcrumb[] = [];

  @Output() breadcrumbSelected = new EventEmitter<LfBreadcrumb | undefined>();
  @Output() breadcrumbClicked = new EventEmitter<{
    selected: LfBreadcrumb;
    breadcrumbs: LfBreadcrumb[];
  }>();

  /** @internal */
  constructor() { }

  /** @internal */
  onBreadcrumbSelected(node: LfBreadcrumb): void {
    this.breadcrumbSelected.emit(node);
    let crumbId = -1;
    for(let idx = 0; idx < this.breadcrumbs.length; idx++) {
      if (this.breadcrumbs[idx].id === node.id) {
        crumbId = idx;
        break;
      }
    }
    if (crumbId === -1) {
      return;
    }
    const newBreadcrumbs = this.breadcrumbs.slice(crumbId);
    this.breadcrumbClicked.emit({breadcrumbs: newBreadcrumbs, selected: node});
  }

}
