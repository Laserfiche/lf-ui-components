export interface TreeNode {
    id: string;
    icon: string | string[];
    isContainer: boolean;
    isLeaf: boolean;
    isSelectable: boolean;
    name: string;
    path: string;
}

export interface TreeNodePage {
    page: TreeNode[];
    nextPage: string | undefined;
}

export interface LfTreeNodeService {

    /**
     * Gets entry data for the lf-repository-browser to display
     * @param folder: string that represents the ID of the folder to get data from
     * @param nextPage: 
     * @param params: object that can be used to pass extra parameters. Currently is only passed filter text (Example: {filter: 'test'})
     * returns - Promise with a list of Entry items that are in the associated folder
    **/
    getFolderChildrenAsync(folder: TreeNode, nextPage?: string, params?: {filter: string}): Promise<TreeNodePage>;

    /** 
     * Returns the root entry
    */
    getRootTreeNodeAsync(): Promise<TreeNode | undefined>;

    /**
     * Gets the parent Entry of the passed in node
     * @param treeNode: Entry object to get the parent of
     * returns - Promise with the parent of the parameter entry or undefined if its the root of the entry does not have a parent
    */
    getParentTreeNodeAsync(treeNode: TreeNode): Promise<TreeNode | undefined>;

    /**
     * Gets the full Entry data of an entry id
     * @param id: string that represents the id of an Entry to get
     * returns - Entry associated with the id parameter or undefined if the entry does not exist
     */
    getTreeNodeByIdAsync(id: string): Promise<TreeNode | undefined>;
}
