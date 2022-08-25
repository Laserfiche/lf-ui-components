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

export interface LfTreeNodeService {

    /**
     * Gets LfTreeNode data for the lf-repository-browser to display
     * @param folder: string that represents the ID of the folder to get data from
     * @param nextPage: string representing the next page requested
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
