import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IconUtils } from '@laserfiche/lf-js-utils';
import { TreeNode, LfTreeNodeService, TreeNodePage } from 'projects/ui-components/lf-repository-browser/ILfTreeNodeService';
import { LfRepositoryBrowserComponent } from 'projects/ui-components/lf-repository-browser/lf-repository-browser.component';

class DemoRepoService implements LfTreeNodeService {
  breadCrumb: TreeNode[] = [];
  currentFolder: TreeNode | undefined;

  _rootEntry: TreeNode = {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '1', isContainer: true, isLeaf: false, isSelectable: false, name: 'root', path: ''};
  _entries: {[key: string]: TreeNode} = {
    '2': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '2', isContainer: true, isLeaf: false, isSelectable: false, name: 'folder2', path: '1'},
    '3': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '3', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry1', path: '1'},
    '4': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '4', isContainer: true, isLeaf: false, isSelectable: false, name: 'folder3', path: '1'},
    '5': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '5', isContainer: false, isLeaf: true, isSelectable: false, 
            name: 'LongNameToCheckHowTheComponentHandledFileLongNamesLongNameToCheckHowTheComponentHandledFileLongNames', path: '1'},
    '6': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '6', isContainer: false, isLeaf: true, isSelectable: true, name: '3', path: '2'},
    '7': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '7', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry4', path: '2'},
    '8': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '8', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry5', path: '2'},
    '9': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '9', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry6', path: '2'},
    '10': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '10', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry7', path: '2'},
    '11': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '11', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry8', path: '2'},
    '12': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '12', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry9', path: '2'},
    '13': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '13', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry10', path: '2'},
    '14': {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: '14', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry11', path: '2'},
    '15': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '15', isContainer: true, isLeaf: false, isSelectable: false, name: 'folder4', path: '2'},
    '16': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '16', isContainer: true, isLeaf: false, isSelectable: false, name: 'error folder', path: '1'},
    '17': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '17', isContainer: true, isLeaf: false, isSelectable: false, name: 'folder with 10000 entries', path: '1'},
    '18': {icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'), id: '18', isContainer: true, isLeaf: false, isSelectable: false, name: 'dynamicly loaded entries', path: '1'}
  }
  _testData: {[key: string]: TreeNode[]} = {
    '1': [
      this._entries['2'],
      this._entries['3'],
      this._entries['4'],
      this._entries['5'],
      this._entries['16'],
      this._entries['17'],
      this._entries['18']
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
    '18': []
  }

  private lastFolder: string | undefined;

  constructor() {
    for(let i = 0; i < 10000; i++) {
      this._testData['17'].push(
        {icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: i.toString(), isContainer: false, isLeaf: true, isSelectable: true, name: `generated entry ${i}`, path: '17'}
      )
    }
  }
  
  getFolderChildrenAsync(folder: TreeNode, nextPage?: string): Promise<TreeNodePage> {
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
        const newEntries: TreeNode[] = this.createDynamicItems(nextPage);
        return Promise.resolve({
          page: newEntries,
          nextPage: (Number.parseInt(nextPage ?? '0', 10) + 20).toString()
        });
      }

      if (this.lastFolder != null && this.lastFolder === folderId) {
        return Promise.resolve({
          page: [],
          nextPage: undefined
        });
      }
      this.lastFolder = folderId;
      const testData = this._testData[folderId];
      return Promise.resolve({
        page: testData,
        nextPage: undefined
      });
    }
    return Promise.reject();
  }
  getRootTreeNodeAsync(): Promise<TreeNode | undefined> {
    return Promise.resolve(this._rootEntry);
  }
  getParentTreeNodeAsync(entry: TreeNode): Promise<TreeNode | undefined> {
    return Promise.resolve(this._entries[entry.path]);
  }
  getTreeNodeByIdAsync(id: string): Promise<TreeNode | undefined> {
    return Promise.resolve(this._entries[id]);
  }
  
  private createDynamicItems(nextPage?: string): TreeNode[] {
    const entries = [];
    const pageStart = nextPage ? Number.parseInt(nextPage, 10) : 0;
    for(let i = pageStart; i < pageStart + 20; i++) {
      entries.push(
        {
          icon: IconUtils.getDocumentIconUrlFromIconId('document-20'), id: (i).toString(), 
        isContainer: false, isLeaf: true, isSelectable: true, name: `dynamic entry ${(i).toString()}`, path: '18', isSelected: false}
      )
    }
    return entries;
  }
}

@Component({
  selector: 'lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css']
})
export class LfRepositoryBrowserDocumentationComponent implements AfterViewInit {
  @ViewChild('repoBrowser') repoBrowser?: ElementRef<LfRepositoryBrowserComponent>;
  
  dataService: DemoRepoService = new DemoRepoService();
  elementSelectedEntry: TreeNode[] | undefined;

  constructor() { }

  ngAfterViewInit(): void {
    this.repoBrowser?.nativeElement?.initAsync(this.dataService);
  }

  onEntrySelected(event: CustomEvent<TreeNode[] | undefined>) {
    this.elementSelectedEntry = event.detail;
  }

}
