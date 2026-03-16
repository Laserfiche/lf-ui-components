// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ColumnDef } from './../../../../ui-components/lf-selection-list/lf-selection-list-public-api';
import {
  LfTreeNode,
  LfRepositoryBrowserComponent,
} from './../../../../ui-components/lf-repository-browser/lf-repository-browser-public-api';
import { DemoRepoService, propIdCreateDate, propIdNameCol, propIdNumberCol } from './demo-repo-service';
import { ToolbarOption } from './../../../../ui-components/shared/lf-toolbar/lf-toolbar-public-api';
import { IconUtils } from '@laserfiche/lf-js-utils';
import { CardComponent } from '../card/card.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const CREATE_COL: ColumnDef = {
  id: propIdCreateDate,
  displayName: 'Creation Date',
  defaultWidth: 'auto',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};
const NUMBER_COL: ColumnDef = {
  id: propIdNumberCol,
  displayName: 'Number Column',
  defaultWidth: 'auto',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};
const NAME_COL: ColumnDef = {
  id: propIdNameCol,
  displayName: 'Name',
  defaultWidth: 'auto',
  minWidthPx: 100,
  resizable: true,
  sortable: true,
};

@Component({
  selector: 'app-lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css', '../app.component.css'],
  standalone: true,
  imports: [CardComponent, MatCheckboxModule, FormsModule, CommonModule, LfRepositoryBrowserComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfRepositoryBrowserDocumentationComponent implements AfterViewInit {
  @ViewChild('repoBrowser') repoBrowser?: LfRepositoryBrowserComponent;
  @ViewChild('singleSelectRepoBrowser') singleSelectRepoBrowser?: LfRepositoryBrowserComponent;
  allSelectable: boolean = true;
  dataService: DemoRepoService = new DemoRepoService();
  selectable = this._selectable.bind(this);
  singleSelectDataService: DemoRepoService = new DemoRepoService();

  elementToolbarOptions: ToolbarOption[] = [
    { name: 'Refresh', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'New Folder', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Download', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Scan', disabled: true, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Rename', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
    { name: 'Share', disabled: false, icon: IconUtils.getDocumentIconUrlFromIconId('document-20') },
  ];

  elementSelectedEntry: LfTreeNode[] | undefined;

  creation_col_single: boolean = true;
  number_col_single: boolean = false;
  creation_col_multi: boolean = false;
  number_col_multi: boolean = false;

  constructor() {}

  async ngAfterViewInit() {
    setTimeout(async () => {
      if (!this.repoBrowser) {
        throw new Error('repoBrowser is undefined');
      }
      await this.repoBrowser.initAsync(this.dataService, this.dataService._entries['21']);
      this.repoBrowser.always_show_header = true;
      this.multiColChange();
      if (this.repoBrowser != null) {
        this.repoBrowser.focus();
      }
    }, 1000);

    if (!this.singleSelectRepoBrowser) {
      throw new Error('repoBrowser is undefined');
    }
    this.singleColChange();
    await this.singleSelectRepoBrowser?.initAsync(this.singleSelectDataService);
    this.singleSelectRepoBrowser.column_order_by = { columnId: 'name', isDesc: false };
  }

  onEntrySelected(entries: LfTreeNode[] | undefined) {
    console.debug('entry selected', entries);
    this.elementSelectedEntry = entries;
  }

  onEntryOpened(entries: LfTreeNode[] | undefined) {
    console.debug('entry double clicked', entries);
  }

  onEntryFocused(entry: LfTreeNode | undefined) {
    console.debug('entry focused', entry);
  }

  onRefresh() {
    this.repoBrowser?.refreshAsync();
  }

  singleColChange() {
    const columns = [NAME_COL];

    if (this.creation_col_single) {
      columns.push(CREATE_COL);
    }
    if (this.number_col_single) {
      columns.push(NUMBER_COL);
    }
    this.singleSelectRepoBrowser!.setColumnsToDisplay(columns);
  }

  multiColChange() {
    const columns = [];
    if (this.creation_col_multi) {
      columns.push(CREATE_COL);
    }
    if (this.number_col_multi) {
      columns.push(NUMBER_COL);
    }
    this.repoBrowser!.setColumnsToDisplay(columns);
  }

  private _selectable(node: LfTreeNode): Promise<boolean> {
    if (this.allSelectable) {
      return Promise.resolve(true);
    }
    if (node.isContainer) {
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }

  toggleSelectable() {
    this.allSelectable = !this.allSelectable;
    this.dataService = new DemoRepoService();
    this.repoBrowser?.initAsync(this.dataService);
  }

  async setSelectedValue() {
    const selectedValues = [
      this.dataService._entries['2'],
      this.dataService._entries['3'],
      this.dataService._entries['7'],
      this.dataService._entries['60'],
      this.dataService._entries['1000'],
    ];
    await this.repoBrowser?.setSelectedNodesAsync(selectedValues as LfTreeNode[]);
  }
}
