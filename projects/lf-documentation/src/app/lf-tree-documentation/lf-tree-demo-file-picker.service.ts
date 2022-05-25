import { Injectable } from '@angular/core';
import { IconUtils } from '@laserfiche/lf-js-utils';
import { LfTreeService, TreeNode } from '@laserfiche/types-lf-ui-components';
import { LfTreeDemoService } from './lf-tree-demo.service';

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({ providedIn: 'root' })
export class LfTreeDemoFilePickerService extends LfTreeDemoService implements LfTreeService {
  readonly rootNodesKey = 'Roots';
  folderSvg: string = IconUtils.getDocumentIconUrlFromIconId('folder-20');
  fileSvg: string = IconUtils.getDocumentIconUrlFromIconId('document-20');

  folderStructure: Record<string, string[]> = {
    [this.rootNodesKey]: ['Repository 1', 'Root Folder 2'],
    'Root Folder 2': [],
    'Repository 1': ['Public', 'Random', 'Nested1', 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'],
    Public: ['Alex', 'Andrew', 'Harry', 'Ian', 'Lee', 'Paolo', 'Quinn'],
    Alex: [],
    Andrew: [],
    Random: ['Even More Random'],
    Nested1: ['Nested2', 'Nothing in here', this.ERROR_NODE_DISPLAY_NAME],
    'Nothing in here': [],
    [this.ERROR_NODE_DISPLAY_NAME]: [],
    Nested2: ['Nested3'],
    Nested3: ['Nested4'],
    'Even More Random': ['eVENmORErAnDOm'],
    OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW: ['OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW2'],
    OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW2: ['Not overflowing'],
  };

  createLeafNode(name: string, path: string): TreeNode {
    const pathArray = path.split('/');
    const leafNode: TreeNode = {
      name,
      path,
      id: path,
      icon: this.fileSvg,
      isContainer: false,
      isSelectable: true,
      isLeaf: true
    };
    return leafNode;
  }

  createFolderNode(name: string, path: string): TreeNode {
    const pathArray = path.split('/');
    const folderNode: TreeNode = {
      name,
      path,
      id: path,
      icon: this.folderSvg,
      isContainer: true,
      isSelectable: false,
      isLeaf: false
    };
    return folderNode;
  }
}
