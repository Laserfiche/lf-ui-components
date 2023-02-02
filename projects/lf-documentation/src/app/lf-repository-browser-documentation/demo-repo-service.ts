import { IconUtils } from '@laserfiche/lf-js-utils';
import { ColumnOrderBy } from './../../../../ui-components/lf-selection-list/lf-selection-list-public-api';
import {
  LfTreeNodeService,
  LfTreeNode,
  LfTreeNodePage,
  PropertyValue,
} from './../../../../ui-components/lf-repository-browser/lf-repository-browser-public-api';

export const propIdCreateDate: string = 'create_date';
export const propIdNumberCol: string = 'number_col';

export class DemoRepoService implements LfTreeNodeService {
  breadCrumb: LfTreeNode[] = [];
  currentFolder: LfTreeNode | undefined;

  filter: string = '';

  _rootEntry: LfTreeNode = {
    icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
    id: '1',
    isContainer: true,
    isLeaf: false,
    name: 'root',
    path: '/',
  };
  currentDate = Date.now();
  _entries: { [key: string]: LfTreeNode } = {
    '2': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '2',
      isContainer: true,
      isLeaf: false,
      name: 'folder2',
      path: '/2',
      attributes: new Map<string, PropertyValue>([
        [propIdCreateDate, { value: this.currentDate, displayValue: Intl.DateTimeFormat().format(this.currentDate) }],
      ]),
    },
    '3': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '3',
      isContainer: false,
      isLeaf: true,
      name: 'entry1',
      path: '/3',
    },
    '4': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '4',
      isContainer: true,
      isLeaf: false,
      name: 'folder3',
      path: '/4',
    },
    '5': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '5',
      isContainer: false,
      isLeaf: true,
      name: 'LongNameToCheckHowTheComponentHandledFileLongNamesLongNameToCheckHowTheComponentHandledFileLongNames',
      path: '/5',
    },
    '6': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '6',
      isContainer: false,
      isLeaf: true,
      name: '3',
      path: '/2/6',
    },
    '7': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '7',
      isContainer: false,
      isLeaf: true,
      name: 'entry4',
      path: '/2/7',
    },
    '8': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '8',
      isContainer: false,
      isLeaf: true,
      name: 'entry5',
      path: '/2/8',
    },
    '9': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '9',
      isContainer: false,
      isLeaf: true,
      name: 'entry6',
      path: '/2/9',
    },
    '10': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '10',
      isContainer: false,
      isLeaf: true,
      name: 'entry7',
      path: '/2/10',
    },
    '11': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '11',
      isContainer: false,
      isLeaf: true,
      name: 'entry8',
      path: '/2/11',
    },
    '12': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '12',
      isContainer: false,
      isLeaf: true,
      name: 'entry9',
      path: '/2/12',
    },
    '13': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '13',
      isContainer: false,
      isLeaf: true,
      name: 'entry10',
      path: '/2/13',
    },
    '14': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '14',
      isContainer: false,
      isLeaf: true,
      name: 'entry11',
      path: '/2/14',
    },
    '15': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '15',
      isContainer: true,
      isLeaf: false,
      name: 'folder4',
      path: '/2/15',
    },
    '16': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '16',
      isContainer: true,
      isLeaf: false,
      name: 'error folder',
      path: '/2/16',
    },
    '17': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '17',
      isContainer: true,
      isLeaf: false,
      name: 'folder with 10000 entries',
      path: '/17',
    },
    '18': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '18',
      isContainer: true,
      isLeaf: false,
      name: 'dynamicly loaded entries',
      path: '/18',
    },
    '60': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '60',
      isContainer: false,
      isLeaf: true,
      name: 'dynamic entry 60',
      path: '18',
    },
    '19': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '19',
      isContainer: true,
      isLeaf: true,
      name: 'slow loading folder',
      path: '/19',
    },
    '20': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '20',
      isContainer: true,
      isLeaf: true,
      name: 'ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumbReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb',
      path: '/20',
    },
    '21': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '21',
      isContainer: true,
      isLeaf: true,
      name: 'ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumbReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb ReallyLongFolderNameToSeeHowItIsHandledInTheBreadcrumb',
      path: '/20/21',
    },
    '1000': {
      icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
      id: '1000',
      isContainer: false,
      isLeaf: true,
      name: 'dynamic entry 1000',
      path: '/18/1000',
    },
    '1900': {
      icon: IconUtils.getDocumentIconUrlFromIconId('folder-20'),
      id: '1900',
      isContainer: true,
      isLeaf: false,
      name: 'folder',
      path: '/',
    },
  };
  _testData: { [key: string]: LfTreeNode[] } = {
    '1': [
      this._entries['2'],
      this._entries['3'],
      this._entries['4'],
      this._entries['5'],
      this._entries['16'],
      this._entries['17'],
      this._entries['18'],
      this._entries['19'],
      this._entries['20'],
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
      this._entries['15'],
    ],
    '4': [],
    '15': [],
    '16': [],
    '17': [],
    '18': [],
    '19': [this._entries['1900']],
    '20': [this._entries['21']],
    '21': [],
    '1900': [],
  };

  private lastFolder: string | undefined;

  constructor() {
    for (let i = 0; i < 10000; i++) {
      const number = i%1000;
      this._testData['17'].push({
        icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
        id: i.toString(),
        isContainer: false,
        isLeaf: true,
        name: `generated entry ${i}`,
        path: `/17/${i}`,
        attributes: new Map<string, PropertyValue>([
          [propIdNumberCol, { value: number, displayValue: `${number}` }],
        ]),
      });
    }
  }

  getFolderChildrenAsync(folder: LfTreeNode, nextPage?: string, sort?: ColumnOrderBy): Promise<LfTreeNodePage> {
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
            nextPage: undefined,
          });
        }
        this.lastFolder = folderId;
        const newEntries: LfTreeNode[] = this.createDynamicItems(nextPage);
        const sorted = this.sortItems(newEntries, sort);
        return Promise.resolve({
          page: sorted,
          nextPage: (Number.parseInt(nextPage ?? '0', 10) + 20).toString(),
        });
      }
      if (folderId === '19') {
        if (this.lastFolder != null && this.lastFolder === folderId) {
          return Promise.resolve({
            page: [],
            nextPage: undefined,
          });
        }
        this.lastFolder = folderId;
        const testData = this._testData['19'].filter((data: LfTreeNode) => {
          return data.name.indexOf(this.filter) >= 0;
        });
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve({
              page: testData,
              nextPage: undefined,
            });
          }, 5000);
        });
      }

      this.lastFolder = folderId;
      const testData = this._testData[folderId].filter((data: LfTreeNode) => {
        return data.name.indexOf(this.filter) >= 0;
      });
      const sortData = this.sortItems(testData, sort);
      return Promise.resolve({
        page: sortData,
        nextPage: undefined,
      });
    }
    return Promise.reject();
  }
  getRootTreeNodeAsync(): Promise<LfTreeNode> {
    return Promise.resolve(this._rootEntry);
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  sortItems(data: LfTreeNode[], sortState: ColumnOrderBy | undefined) {
    if (!sortState) {
      return data;
    }
    const sortedData = data?.sort((a, b) => {
      const isAsc = !sortState.isDesc;
      if (sortState.columnId === 'name') {
        return this.compare(a.name.toLowerCase(), b.name.toLowerCase(), isAsc);
      } else if (sortState.columnId !== undefined) {
        const aVal = a.attributes?.get(sortState?.columnId)?.value;
        const bVal = b.attributes?.get(sortState?.columnId)?.value;
        // hp tp sort if undefined..
        if (Object.prototype.toString.call(aVal) === '[object Date]') {
          return this.compare((aVal as Date).getTime(), (bVal as Date)?.getTime(), isAsc);
        } else if (typeof aVal === 'number') {
          return this.compare(aVal, bVal as number, isAsc);
        } else if (typeof aVal === 'string') {
          return this.compare(aVal.toLowerCase(), (bVal as string).toLowerCase(), isAsc);
        } else {
          // err -- not valid?
          // or just do straight comparison?
        }
        // sort based on a.value.properties[{{sort.active}}].value
        // if Date sort by date, if number sort by number etc.
        return 0;
      } else {
        return 0;
      }
    });
    return sortedData;
  }

  async getParentTreeNodeAsync(entry: LfTreeNode): Promise<LfTreeNode | undefined> {
    if (entry.path === '/') {
      return undefined;
    }
    const path = entry.path.split('/');
    path.pop(); // remove self
    const parentId = path.pop();
    const parent = parentId ? this._entries[parentId] : this._rootEntry;
    return Promise.resolve(parent ?? undefined);
  }

  private createDynamicItems(nextPage?: string): LfTreeNode[] {
    const entries = [];
    const pageStart = nextPage ? Number.parseInt(nextPage, 10) : 0;
    for (let i = pageStart; i < pageStart + 20; i++) {
      entries.push({
        icon: IconUtils.getDocumentIconUrlFromIconId('document-20'),
        id: i.toString(),
        isContainer: false,
        isLeaf: true,
        name: `dynamic entry ${i.toString()}`,
        path: `/18/${i}`,
        isSelected: false,
      });
    }
    return entries;
  }
}
