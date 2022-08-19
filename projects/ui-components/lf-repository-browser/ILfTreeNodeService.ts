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
     * Gets entry data for the lf-repository-browser to display
     * @param folder: string that represents the ID of the folder to get data from
     * @param nextPage: string representing the next page requested
    **/
    getFolderChildrenAsync(folder: LfTreeNode, nextPage?: string): Promise<LfTreeNodePage>;

    /** 
     * Returns the root entry
    */
    getRootTreeNodeAsync(): Promise<LfTreeNode | undefined>;

    /**
     * Gets the parent Entry of the passed in node
     * @param treeNode: Entry object to get the parent of
     * returns - Promise with the parent of the parameter entry or undefined if its the root of the entry does not have a parent
    */
    getParentTreeNodeAsync(treeNode: LfTreeNode): Promise<LfTreeNode | undefined>;

    /**
     * Gets the full Entry data of an entry id
     * @param id: string that represents the id of an Entry to get
     * returns - Entry associated with the id parameter or undefined if the entry does not exist
     */
    getTreeNodeByIdAsync(id: string): Promise<LfTreeNode | undefined>;
}
