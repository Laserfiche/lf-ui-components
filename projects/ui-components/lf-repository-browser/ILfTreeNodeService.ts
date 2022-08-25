export interface LfTreeNode {
  id: string;
  icon: string | string[];
  isContainer: boolean;
  isLeaf: boolean;
  name: string;
  path: string;
}

export interface LfTreeNodePage {
  page: LfTreeNode[];
  nextPage: string | undefined;
}

/**
 * A tree data structure provider that can be used as a data source for UI components, such as the lf-repository-browser component, to navigate a tree structure.
 */
export interface LfTreeNodeService {
  /**
   * Returns a page containing the children or the parent tree node. The implementation may provide expose ordering and filtering functionality.
   * @param folder: string that represents the ID of the folder to get data from
   * @param nextPage: string representing the next page requested. If undefined, the first page is returned
   **/
  getFolderChildrenAsync(folder: LfTreeNode, nextPage?: string): Promise<LfTreeNodePage>;

  /**
   * Returns the root LfTreeNode
   */
  getRootTreeNodeAsync(): Promise<LfTreeNode>;

  /**
   * Gets the parent LfTreeNode of the passed in node
   * @param treeNode: LfTreeNode object to get the parent of
   * returns - Promise with the parent of the parameter LfTreeNode or undefined if its the root LfTreeNode and does not have a parent
   */
  getParentTreeNodeAsync(treeNode: LfTreeNode): Promise<LfTreeNode | undefined>;

  /**
   * Gets the full LfTreeNode data of an entry id
   * @param id: string that represents the id of an LfTreeNode to get
   * returns - LfTreeNode associated with the id parameter or undefined if the LfTreeNode does not exist
   */
  getTreeNodeByIdAsync(id: string): Promise<LfTreeNode | undefined>;
}
