// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  LfBreadcrumb,
  LfBreadcrumbsComponent,
} from './../../../../ui-components/shared/lf-breadcrumbs/lf-breadcrumbs-public-api';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-breadcrumbs-documentation',
  templateUrl: './lf-breadcrumbs-documentation.component.html',
  styleUrls: ['./lf-breadcrumbs-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfBreadcrumbsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfBreadcrumbsDocumentationComponent implements AfterViewInit {
  @ViewChild('breadcrumbs') elementBreadcrumbs!: LfBreadcrumbsComponent;

  selectedElementBreadcrumb: string | undefined;

  elementBreadcrumbOptions = [
    {
      id: 'E',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder E',
      path: 'Folder A/Folder B/Folder C/Folder D/Folder E',
    },
    {
      id: 'D',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder D',
      path: 'Folder A/Folder B/Folder C/Folder D',
    },
    {
      id: 'C',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder C',
      path: 'Folder A/Folder B/Folder C',
    },
    {
      id: 'B',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder B',
      path: 'Folder A/Folder B',
    },
    {
      id: 'A',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder A',
      path: 'Folder A',
    },
  ];

  constructor() {}

  ngAfterViewInit() {
    this.elementBreadcrumbs.breadcrumbs = this.elementBreadcrumbOptions;
    this.elementBreadcrumbs.breadcrumbSelected.subscribe((breadcrumb: LfBreadcrumb) => {
      this.onElementBreadcrumbSelected(breadcrumb);
    });
  }

  onElementBreadcrumbSelected(breadcrumb: LfBreadcrumb) {
    this.selectedElementBreadcrumb = JSON.stringify(breadcrumb, null, 2);
  }
}
