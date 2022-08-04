import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Entry, LfRepositoryService } from 'projects/ui-components/lf-repository-browser/ILFRepositoryService';
import { LfRepositoryBrowserComponent } from 'projects/ui-components/projects';

class DemoRepoService implements LfRepositoryService {
  breadCrumb: Entry[] = [];
  currentFolder: Entry | undefined;
  list: Entry[] = [];

  _rootEntry: Entry = {icon: 'folder', id: '1', isContainer: true, isLeaf: false, isSelectable: true, name: 'root', path: ''};
  _entries: {[key: string]: Entry} = {
    '2': {icon: 'folder', id: '2', isContainer: true, isLeaf: false, isSelectable: true, name: 'folder2', path: '1'},
    '3': {icon: 'file', id: '3', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry1', path: '1'},
    '4': {icon: 'folder', id: '4', isContainer: true, isLeaf: false, isSelectable: true, name: 'folder3', path: '1'},
    '5': {icon: 'file', id: '5', isContainer: false, isLeaf: true, isSelectable: true, 
            name: 'LongNameToCheckHowTheComponentHandledFileLongNamesLongNameToCheckHowTheComponentHandledFileLongNames', path: '1'},
    '6': {icon: 'file', id: '6', isContainer: false, isLeaf: true, isSelectable: true, name: '3', path: '2'},
    '7': {icon: 'file', id: '7', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry4', path: '2'},
    '8': {icon: 'file', id: '8', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry5', path: '2'},
    '9': {icon: 'file', id: '9', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry6', path: '2'},
    '10': {icon: 'file', id: '10', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry7', path: '2'},
    '11': {icon: 'file', id: '11', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry8', path: '2'},
    '12': {icon: 'file', id: '12', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry9', path: '2'},
    '13': {icon: 'file', id: '13', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry10', path: '2'},
    '14': {icon: 'file', id: '14', isContainer: false, isLeaf: true, isSelectable: true, name: 'entry11', path: '2'},
    '15': {icon: 'folder', id: '15', isContainer: true, isLeaf: false, isSelectable: true, name: 'folder4', path: '2'},
  }
  _testData: {[key: string]: Entry[]} = {
    '1': [
      this._entries['2'],
      this._entries['3'],
      this._entries['4'],
      this._entries['5'],
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
    ]
  }
  
  getData(folderId: string | null, filterText: string | undefined, refresh?: boolean | undefined): Promise<Entry[]> {
    if (folderId != null && this._testData[folderId]) {
      return Promise.resolve(this._testData[folderId].filter((value: Entry) => {
        if (!filterText) { return true; }
        return value.name.indexOf(filterText) >= 0;
      }));
    }
    return Promise.reject();
  }
  getRootEntryAsync(): Promise<Entry | undefined> {
    return Promise.resolve(this._rootEntry);
  }
  getParentEntryAsync(entry: Entry): Promise<Entry | undefined> {
    return Promise.resolve(this._entries[entry.path]);
  }
  getEntryByIdAsync(id: string): Promise<Entry | undefined> {
    return Promise.resolve(this._entries[id]);
  }
  
}

@Component({
  selector: 'lf-repository-browser-documentation',
  templateUrl: './lf-repository-browser-documentation.component.html',
  styleUrls: ['./lf-repository-browser-documentation.component.css']
})
export class LfRepositoryBrowserDocumentationComponent implements AfterViewInit {
  @ViewChild(LfRepositoryBrowserComponent) repoBrowser: LfRepositoryBrowserComponent | undefined;
  
  dataService: DemoRepoService = new DemoRepoService();

  constructor() { }

  ngAfterViewInit(): void {
    this.repoBrowser?.initAsync({dataService: this.dataService});
  }

}
