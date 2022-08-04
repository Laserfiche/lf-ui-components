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

  /** @internal */
  constructor() { }

  /** @internal */
  onBreadcrumbSelected(node: LfBreadcrumb): void {
    this.breadcrumbSelected.emit(node);
  }

}
