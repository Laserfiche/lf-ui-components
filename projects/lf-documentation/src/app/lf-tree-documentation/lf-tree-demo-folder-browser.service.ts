import { Injectable } from '@angular/core';
import { LfTreeService, TreeNode } from '@laserfiche/types-laserfiche-ui-components';
import { LfTreeDemoService } from './lf-tree-demo.service';

const FILE_SVG = `./file.svg`;
const FOLDER_SVG = `./folder.svg`;
/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
@Injectable({ providedIn: 'root' })
export class LfTreeDemoFolderBrowserService extends LfTreeDemoService implements LfTreeService {
  readonly rootNodesKey = 'Roots';
  folderStructure: Record<string, string[]> = {
    [this.rootNodesKey]: ['Documents'],
    Documents: ['Public', 'Random', 'Nested1', 'OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW'],
    Public: ['Alex', 'Andrew', 'Harry', 'Ian', 'Lee', 'Paolo', 'Quinn'],
    Random: ['Even More Random'],
    Nested1: ['Nested2', 'Nothing in here', 'Nothing in here either', this.ERROR_NODE_DISPLAY_NAME],
    'Nothing in here': [],
    'Nothing in here either': [],
    [this.ERROR_NODE_DISPLAY_NAME]: [],
    Nested2: ['Nested3'],
    Nested3: ['Nested4'],
    'Even More Random': ['eVENmORErAnDOm'],
    OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW: ['OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW2'],
    OVERFLOWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW2: ['Not overflowing']
  };

  createLeafNode(name: string, path: string): TreeNode {
    const pathArray = path.split('/');
    const leafNode: TreeNode = {
      name,
      path,
      id: path,
      icon: FILE_SVG,
      isContainer: false,
      isSelectable: false,
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
      icon: FOLDER_SVG,
      isContainer: true,
      isSelectable: true,
      isLeaf: false
    };
    return folderNode;
  }
}

