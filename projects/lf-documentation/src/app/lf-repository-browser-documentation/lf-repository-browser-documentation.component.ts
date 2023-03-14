import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ColumnDef } from '@laserfiche/lf-ui-components/lf-selection-list';
import {
  LfTreeNode,
  LfRepositoryBrowserComponent,
} from './../../../../ui-components/lf-repository-browser/lf-repository-browser-public-api';
import { DemoRepoService, propIdCreateDate, propIdNameCol, propIdNumberCol } from './demo-repo-service';



const CREATE_COL: ColumnDef = { id: propIdCreateDate, displayName: 'Creation Date', defaultWidth: '30%', minWidth: 200, resizable: true };
const NUMBER_COL: ColumnDef = { id: propIdNumberCol, displayName: 'Number Column', defaultWidth: '60%', minWidth: 100, resizable: true, sortable: true  };
const NAME_COL: ColumnDef = { id: propIdNameCol, displayName: 'Name', defaultWidth: '50%', minWidth: 100, resizable: true, sortable: true  };

@Component({
  selector: 'app-lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css', '../app.component.css'],
})
export class LfRepositoryBrowserDocumentationComponent implements AfterViewInit {
  @ViewChild('repoBrowser') repoBrowser?: ElementRef<LfRepositoryBrowserComponent>;
  @ViewChild('singleSelectRepoBrowser') singleSelectRepoBrowser?: ElementRef<LfRepositoryBrowserComponent>;
  allSelectable: boolean = true;
  dataService: DemoRepoService = new DemoRepoService();
  selectable = this._selectable.bind(this);
  singleSelectDataService: DemoRepoService = new DemoRepoService();
  filter: string = '';

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
      await this.repoBrowser.nativeElement.initAsync(this.dataService, this.dataService._entries['21']);
      this.multiColChange() ;
      if (this.repoBrowser != null) {
        this.repoBrowser.nativeElement.focus();
      }
    }, 1000);
    
    if (!this.singleSelectRepoBrowser) {
      throw new Error('repoBrowser is undefined');
    }
    this.singleColChange();
    await this.singleSelectRepoBrowser.nativeElement?.initAsync(this.singleSelectDataService);
    this.singleSelectRepoBrowser.nativeElement.columnOrderBy = {columnId: 'name', isDesc: false};
    this.singleSelectRepoBrowser.nativeElement.alwaysShowHeader = true;
  }

  onEntrySelected(event: CustomEvent<LfTreeNode[] | undefined>) {
    console.debug('entry selected', event.detail);
    this.elementSelectedEntry = event.detail;
  }

  onEntryOpened(event: CustomEvent<LfTreeNode[] | undefined>) {
    console.debug('entry double clicked', event.detail);
  }

  onEntryFocused(event: CustomEvent<LfTreeNode | undefined>) {
    console.debug('entry focused', event.detail);
  }

  onFilterChange(event: any) {
    this.filter = event.target.value;
    this.dataService.filter = this.filter;
    this.repoBrowser?.nativeElement.refreshAsync();
  }

  onRefresh() {
    this.repoBrowser?.nativeElement.refreshAsync();
  }

  singleColChange() {
    const columns = [NAME_COL];

    if (this.creation_col_single) {
      columns.push(CREATE_COL);
    }
    if (this.number_col_single) {
      columns.push(NUMBER_COL);
    }
    this.singleSelectRepoBrowser!.nativeElement.setAdditionalColumnsToDisplay(columns);
  }

  multiColChange() {
    const columns = [];
    if (this.creation_col_multi) {
      columns.push(CREATE_COL);
    }
    if (this.number_col_multi) {
      columns.push(NUMBER_COL);
    }
    this.repoBrowser!.nativeElement.setAdditionalColumnsToDisplay(columns);
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
    this.repoBrowser?.nativeElement.initAsync(this.dataService);
  }

  async setSelectedValue() {
    const selectedValues = [
      this.dataService._entries['2'],
      this.dataService._entries['3'],
      this.dataService._entries['7'],
      this.dataService._entries['60'],
      this.dataService._entries['1000'],
    ];
    await this.repoBrowser?.nativeElement.setSelectedNodesAsync(selectedValues as LfTreeNode[]);
  }
}
