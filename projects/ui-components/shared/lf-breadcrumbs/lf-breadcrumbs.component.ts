// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { LfBreadcrumb } from './lf-breadcrumbs-types';

@Component({
  selector: 'lf-breadcrumbs-component',
  templateUrl: './lf-breadcrumbs.component.html',
  styleUrls: ['./lf-breadcrumbs.component.css'],
  standalone: true,
  imports: [CommonModule, MatMenuModule, MatButtonToggleModule],
})
export class LfBreadcrumbsComponent {
  @Input() breadcrumbs: LfBreadcrumb[] = [];

  @Output() breadcrumbSelected = new EventEmitter<LfBreadcrumb | undefined>();
  @Output() breadcrumbClicked = new EventEmitter<{
    selected: LfBreadcrumb;
    breadcrumbs: LfBreadcrumb[];
  }>();

  /** @internal */
  constructor() {}

  /** @internal */
  onBreadcrumbSelected(node: LfBreadcrumb): void {
    this.breadcrumbSelected.emit(node);
    let crumbId = -1;
    for (let idx = 0; idx < this.breadcrumbs.length; idx++) {
      if (this.breadcrumbs[idx].id === node.id) {
        crumbId = idx;
        break;
      }
    }
    if (crumbId === -1) {
      return;
    }
    const newBreadcrumbs = this.breadcrumbs.slice(crumbId);
    this.breadcrumbClicked.emit({ breadcrumbs: newBreadcrumbs, selected: node });
  }

  /** @internal */
  onDropdownMenuSelected(button: HTMLButtonElement) {
    setTimeout(() => button.focus());
  }
}
