import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LfTreeNode, LfRepositoryBrowserComponent } from './../../../../ui-components/lf-repository-browser/lf-repository-browser-public-api';
import { DemoRepoService } from './demo-repo-service';

@Component({
  selector: 'app-lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css', '../app.component.css']
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

  constructor() { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.repoBrowser?.nativeElement.initAsync(this.dataService, this.dataService._entries['21']);
      if (this.repoBrowser != null) {
        this.repoBrowser.nativeElement.focus();
      }
    }, 1000);
    
    this.singleSelectRepoBrowser?.nativeElement?.initAsync(this.singleSelectDataService);
  }

  onEntrySelected(event: CustomEvent<LfTreeNode[] | undefined>) {
    console.debug('entry selected', event.detail);
    this.elementSelectedEntry = event.detail;
  }

  onEntryOpened(event: CustomEvent<LfTreeNode[] | undefined>) {
    console.debug('entry double clicked', event.detail);
  }

  onEntryFocused(event: CustomEvent<LfTreeNode | undefined>) {
    console.log('entry focused', event.detail);
  }

  onFilterChange(event: any) {
    this.filter = event.target.value;
    this.dataService.filter = this.filter;
    this.repoBrowser?.nativeElement.refreshAsync();
  }

  onRefresh() {
    this.repoBrowser?.nativeElement.refreshAsync();
  }

  private _selectable(node: LfTreeNode): Promise<boolean> {
    if (this.allSelectable) { return Promise.resolve(true); }
    if (node.isContainer) { return Promise.resolve(false); }
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
      this.dataService._entries['1000']
    ];
    await this.repoBrowser?.nativeElement.setSelectedValuesAsync(selectedValues as LfTreeNode[]);
  }
}
