export interface TreeNode {
  id: string;
  icon: string | string[];
  isContainer: boolean;
  isLeaf: boolean;
  isSelectable: boolean;
  name: string;
  path: string;
  isLoadingChildren?: boolean;
}

export interface LfTreeProviders {
  treeService: LfTreeService;
}

/**
 * Database for dynamic data. When expanding a node in the tree, the data source will need to fetch
 * the descendants data from the database.
 */
export interface LfTreeService {

  getChildrenAsync(node: TreeNode): Promise<TreeNode[]>;

  getRootNodesAsync(): Promise<TreeNode[]>;

  getParentNodeAsync(node: TreeNode): Promise<TreeNode | undefined>;

  getNodeByIdAsync(id: string): Promise<TreeNode | undefined>;

  addNewFolderAsync?(parentNode: TreeNode, folderName: string): Promise<void>;

  refreshAsync?(node: TreeNode): Promise<TreeNode[]>;
}

