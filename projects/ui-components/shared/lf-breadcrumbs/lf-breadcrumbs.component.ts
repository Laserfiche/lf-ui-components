// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
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

  @ViewChild('dropdownMenuButton') dropdownMenuButton!: ElementRef<HTMLButtonElement>;

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

    onKeydown(event: KeyboardEvent, node: LfBreadcrumb) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.onBreadcrumbSelected(node);
    }
  }

  onDropdownMenuSelected() {
    setTimeout(() => this.dropdownMenuButton.nativeElement.focus());
  }
}
