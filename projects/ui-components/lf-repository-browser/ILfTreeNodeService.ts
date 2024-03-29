// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ColumnOrderBy } from '@laserfiche/lf-ui-components/lf-selection-list';
import { PropertyValue } from '@laserfiche/lf-ui-components/shared';
export interface LfTreeNode {
  id: string;
  icon: string | string[];
  isContainer: boolean;
  isLeaf: boolean;
  name: string;
  path: string;
  attributes?: Map<string, PropertyValue>;
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
  getFolderChildrenAsync(folder: LfTreeNode, nextPage?: string, orderBy?: ColumnOrderBy): Promise<LfTreeNodePage>;

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
   * Gets the LfTreeNode referenced by the identifier. This can be specific to the implementation of the service (i.e. id, path, etc.)
   * @param identifier Identifier for the LfTreeNode.
   */
  getTreeNodeByIdentifierAsync?(identifier: string): Promise<LfTreeNode | undefined>;
}
