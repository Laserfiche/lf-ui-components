import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IconUtils } from '@laserfiche/lf-js-utils';
import { LfTreeNode, LfTreeNodeService, LfTreeNodePage } from 'projects/ui-components/lf-repository-browser/ILfTreeNodeService';
import { LfRepositoryBrowserComponent } from 'projects/ui-components/lf-repository-browser/lf-repository-browser.component';

class DemoRepoService implements LfTreeNodeService {
  breadCrumb: LfTreeNode[] = [];
  currentFolder: LfTreeNode | undefined;

  filter: string = '';

  _rootEntry: LfTreeNode = {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '1', isContainer: true, isLeaf: false, name: 'root', path: ''};
  _entries: {[key: string]: LfTreeNode} = {
    '2': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '2', isContainer: true, isLeaf: false, name: 'folder2', path: '1'},
    '3': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '3', isContainer: false, isLeaf: true, name: 'entry1', path: '1'},
    '4': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '4', isContainer: true, isLeaf: false, name: 'folder3', path: '1'},
    '5': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '5', isContainer: false, isLeaf: true, 
            name: 'LongNameToCheckHowTheComponentHandledFileLongNamesLongNameToCheckHowTheComponentHandledFileLongNames', path: '1'},
    '6': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '6', isContainer: false, isLeaf: true, name: '3', path: '2'},
    '7': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '7', isContainer: false, isLeaf: true, name: 'entry4', path: '2'},
    '8': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '8', isContainer: false, isLeaf: true, name: 'entry5', path: '2'},
    '9': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '9', isContainer: false, isLeaf: true, name: 'entry6', path: '2'},
    '10': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '10', isContainer: false, isLeaf: true, name: 'entry7', path: '2'},
    '11': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '11', isContainer: false, isLeaf: true, name: 'entry8', path: '2'},
    '12': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '12', isContainer: false, isLeaf: true, name: 'entry9', path: '2'},
    '13': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '13', isContainer: false, isLeaf: true, name: 'entry10', path: '2'},
    '14': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '14', isContainer: false, isLeaf: true, name: 'entry11', path: '2'},
    '15': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '15', isContainer: true, isLeaf: false, name: 'folder4', path: '2'},
    '16': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '16', isContainer: true, isLeaf: false, name: 'error folder', path: '1'},
    '17': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '17', isContainer: true, isLeaf: false, name: 'folder with 10000 entries', path: '1'},
    '18': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '18', isContainer: true, isLeaf: false, name: 'dynamicly loaded entries', path: '1'},
    '60': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '60', isContainer: false, isLeaf: true, name: 'dynamic entry 60', path: '18'},
    '19': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '19', isContainer: true, isLeaf: true, name: 'slow loading folder', path: '1'},
    '20': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '20', isContainer: true, isLeaf: true, 
            name: 'ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumbReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb', path: '1'},
    '21': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '21', isContainer: true, isLeaf: true, 
            name: 'ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumbReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb', path: '20'},
    '1000': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '1000', isContainer: false, isLeaf: true, name: 'dynamic entry 1000', path: '18'},
  };
  _testData: {[key: string]: LfTreeNode[]} = {
    '1': [
      this._entries['2'],
      this._entries['3'],
      this._entries['4'],
      this._entries['5'],
      this._entries['16'],
      this._entries['17'],
      this._entries['18'],
      this._entries['19'],
      this._entries['20']
    ],
    '2': [
      this._entries['6'],
      this._entries['7'],
      this._entries['8'],
      this._entries['9'],
      this._entries['10'],
      this._entries['11'],
      this._entries['12'],
      this._entries['13'],
      this._entries['14'],
      this._entries['15']
    ],
    '4': [],
    '15': [],
    '16': [],
    '17': [],
    '18': [],
    '19': [],
    '20': [this._entries['21']],
    '21': []
  };

  private lastFolder: string | undefined;

  constructor() {
    for(let i = 0; i < 10000; i++) {
      this._testData['17'].push(
        {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: i.toString(), isContainer: false, isLeaf: true, name: `generated entry ${i}`, path: '17' }
      );
    }
  }
  
  getFolderChildrenAsync(folder: LfTreeNode, nextPage?: string): Promise<LfTreeNodePage> {
    const folderId: string = folder.id;
    if (folderId != null && this._testData[folderId]) {
      
      if (folderId === '16') {
        this.lastFolder = folderId;
        return Promise.reject();
      }
      if (folderId === '18') {
        if (this.lastFolder != null && this.lastFolder !== folderId) {
          Promise.resolve({
            page: undefined,
            nextPage: undefined
          });
        }
        this.lastFolder = folderId;
        const newEntries: LfTreeNode[] = this.createDynamicItems(nextPage);
        return Promise.resolve({
          page: newEntries,
          nextPage: (Number.parseInt(nextPage ?? '0', 10) + 20).toString()
        });
      }
      if (folderId === '19') {
        if (this.lastFolder != null && this.lastFolder === folderId) {
          return Promise.resolve({
            page: [],
            nextPage: undefined
          });
        }
        this.lastFolder = folderId;
        const newEntries: LfTreeNode[] = this.createDynamicItems(nextPage);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              page: newEntries,
              nextPage: undefined
            });
          }, 5000);
          
        });
      }

      this.lastFolder = folderId;
      const testData = this._testData[folderId].filter((data: LfTreeNode) => 
      {
        return data.name.indexOf(this.filter) >= 0;
      });
      return Promise.resolve({
        page: testData,
        nextPage: undefined
      });
    }
    return Promise.reject();
  }
  getRootTreeNodeAsync(): Promise<LfTreeNode | undefined> {
    return Promise.resolve(this._rootEntry);
  }
  getParentTreeNodeAsync(entry: LfTreeNode): Promise<LfTreeNode | undefined> {
    return Promise.resolve(this._entries[entry.path]);
  }
  getTreeNodeByIdAsync(id: string): Promise<LfTreeNode | undefined> {
    return Promise.resolve(this._entries[id]);
  }
  
  private createDynamicItems(nextPage?: string): LfTreeNode[] {
    const entries = [];
    const pageStart = nextPage ? Number.parseInt(nextPage, 10) : 0;
    for(let i = pageStart; i < pageStart + 20; i++) {
      entries.push(
        {
          icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: (i).toString(), 
        isContainer: false, isLeaf: true, isSelectable: true, name: `dynamic entry ${(i).toString()}`, path: '18', isSelected: false}
      );
    }
    return entries;
  }
}

@Component({
  selector: 'app-lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css']
})
export class LfRepositoryBrowserDocumentationComponent implements AfterViewInit {
  @ViewChild('repoBrowser') repoBrowser?: LfRepositoryBrowserComponent;
  @ViewChild('singleSelectRepoBrowser') singleSelectRepoBrowser?: ElementRef<LfRepositoryBrowserComponent>;
  
  allSelectable: boolean = true;
  dataService: DemoRepoService = new DemoRepoService();
  selectable = this._selectable.bind(this);
  singleSelectDataService: DemoRepoService = new DemoRepoService();
  filter: string = '';

  elementSelectedEntry: LfTreeNode[] | undefined;

  constructor() { }

  ngAfterViewInit(): void {
    this.repoBrowser?.initAsync(this.dataService);
    this.singleSelectRepoBrowser?.nativeElement?.initAsync(this.singleSelectDataService);

    if (this.repoBrowser != null) {
      this.repoBrowser.focus();
    }
  }

  onEntrySelected(event: LfTreeNode[] | undefined) {
    this.elementSelectedEntry = event;
  }

  onFilterChange(event: any) {
    this.filter = event.target.value;
    this.dataService.filter = this.filter;
    this.repoBrowser?.refresh();
  }

  onRefresh() {
    this.repoBrowser?.refresh();
  }

  private _selectable(node: LfTreeNode): Promise<boolean> {
    if (this.allSelectable) { return Promise.resolve(true); } 
    if (node.isContainer) { return Promise.resolve(false); }
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
      this.dataService._entries['1000']
    ];
    await this.repoBrowser?.setSelectedValuesAsync(selectedValues as LfTreeNode[]);
  }
}
