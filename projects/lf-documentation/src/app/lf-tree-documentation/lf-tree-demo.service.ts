import { LfTreeService, TreeNode } from "./../../../../ui-components/tree-components/lf-tree-components-public-api";

export abstract class LfTreeDemoService implements LfTreeService {
  abstract get rootNodesKey(): string;
  abstract get folderStructure(): Record<string, string[]>;

  abstract createLeafNode(name: string, path: string): TreeNode;
  abstract createFolderNode(name: string, path: string): TreeNode;

  ERROR_NODE_DISPLAY_NAME = 'Wait 3 seconds, then throw an error!';

  constructor() { }

  async refreshAsync(node: TreeNode): Promise<TreeNode[]> {
    // Add timeout to immitate refreshing
    await this.timeoutAsync(300);
    return await this.getChildrenAsync(node);
  }

  async addNewFolderAsync(parentNode: TreeNode, folderName: string): Promise<void> {
    if (this.folderStructure[parentNode.name].includes(folderName)) {
      throw new Error('Folder exists');
    }
    this.folderStructure[parentNode.name].push(folderName);
    this.folderStructure[folderName] = [];
  }

  async getChildrenAsync(node: TreeNode): Promise<TreeNode[]> {
    if (node.name === this.ERROR_NODE_DISPLAY_NAME) {
      await this.timeoutAsync(3000);
      throw new Error(`Hey! You clicked on '${this.ERROR_NODE_DISPLAY_NAME}'`);
    }
    const nodeName = node.name;
    const nodePath = node.path;
    const children = this.folderStructure[nodeName];
    const dataMap: TreeNode[] = [];
    for (const child of children) {
      const path = `${nodePath}/${child}`;
      if (this.isNodeAFolder(child)) {
        dataMap.push(this.createFolderNode(child, path));
      } else {
        dataMap.push(this.createLeafNode(child, path));
      }
    }
    return dataMap;
  }

  async getRootNodesAsync(): Promise<TreeNode[]> {
    const dataMap: TreeNode[] = [];

    if (!this.folderStructure[this.rootNodesKey]) {
      return dataMap;
    }

    for (const folderName of this.folderStructure[this.rootNodesKey]) {
      const path = `${folderName}`;
      const folderNode: TreeNode = this.createFolderNode(folderName, path);
      dataMap.push(folderNode);
    }
    return dataMap;
  }

  async getParentNodeAsync(node: TreeNode): Promise<TreeNode | undefined> {
    const parentPath = this.getParentPath(node.path);
    if (parentPath === undefined) {
      return undefined;
    }
    return await this.getNodeByIdAsync(parentPath);
  }

  async getNodeByIdAsync(id: string): Promise<TreeNode | undefined> {
    const path = id;
    const name = this.getName(path);
    if (this.isNodeAFolder(path)) {
      return this.createFolderNode(name, path);
    } else if (this.isNodeALeaf(path)) {
      return this.createLeafNode(name, path);
    } else {
      return undefined;
    }
  }

  isNodeAFolder(path: string): boolean {
    const pathPieces = path.split('/');
    for (const piece of pathPieces) {
      if (this.folderStructure[piece] === undefined) {
        return false;
      }
    }
    return true;
  }

  isNodeALeaf(path: string): boolean {
    const parentPath = this.getParentPath(path);
    const nodeName = this.getName(path);
    if (parentPath === undefined) {
      return nodeName in this.folderStructure;
    }

    const isParentPathValid = this.isNodeAFolder(parentPath);
    if (!isParentPathValid) {
      throw new Error(`parent path ${parentPath} is not a valid folder`);
    }
    const parentName = this.getName(parentPath);
    const parentChildren = this.folderStructure[parentName];
    return parentChildren.includes(nodeName);
  }

  getParentPath(path: string): string | undefined {
    const parentEndIndex = path.lastIndexOf('/');
    const parentPath = path.substring(0, parentEndIndex);
    if (parentPath.length === 0) {
      return undefined;
    }
    return parentPath;
  }

  getName(path: string): string {
    let lastNonSlashIndex = path.length - 1;
    for (; lastNonSlashIndex >= 0; lastNonSlashIndex--) {
      if (path[lastNonSlashIndex] !== '/') {
        break;
      }
    }

    const startIndex = path.lastIndexOf('/', lastNonSlashIndex);
    return path.substring(startIndex + 1, lastNonSlashIndex + 1);
  }

  private async timeoutAsync(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
