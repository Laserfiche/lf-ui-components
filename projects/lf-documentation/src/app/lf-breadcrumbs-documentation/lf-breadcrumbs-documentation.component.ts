import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { LfBreadcrumbsComponent } from './../../../../ui-components/shared/lf-shared-public-api';
import { TreeNode } from './../../../../ui-components/tree-components/lf-tree-components-public-api';

@Component({
  selector: 'app-lf-breadcrumbs-documentation',
  templateUrl: './lf-breadcrumbs-documentation.component.html',
  styleUrls: ['./lf-breadcrumbs-documentation.component.css', './../app.component.css']
})
export class LfBreadcrumbsDocumentationComponent implements AfterViewInit {

  @ViewChild('breadcrumbs') elementBreadcrumbs!: ElementRef<NgElement & WithProperties<LfBreadcrumbsComponent>>;

  selectedElementBreadcrumb: string | undefined;

  elementBreadcrumbOptions: TreeNode[] = [
    {
      id: 'E',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder E',
      path: 'Folder A/Folder B/Folder C/Folder D/Folder E'
    },
    {
      id: 'D',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder D',
      path: 'Folder A/Folder B/Folder C/Folder D'
    },
    {
      id: 'C',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder C',
      path: 'Folder A/Folder B/Folder C'
    },
    {
      id: 'B',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder B',
      path: 'Folder A/Folder B'
    },
    {
      id: 'A',
      icon: '',
      isContainer: true,
      isLeaf: false,
      isSelectable: false,
      name: 'Folder A',
      path: 'Folder A'
    }
  ];

  constructor() { }

  ngAfterViewInit() {
    this.elementBreadcrumbs.nativeElement.breadcrumbs = this.elementBreadcrumbOptions;
    this.elementBreadcrumbs.nativeElement.addEventListener('breadcrumbSelected', (event) => {
      this.onElementBreadcrumbSelected(event as CustomEvent<TreeNode>);
    });
  }

  onElementBreadcrumbSelected(event: CustomEvent<TreeNode>) {
    this.selectedElementBreadcrumb = JSON.stringify(event.detail, null, 2);
  }

}
