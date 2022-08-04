export interface Entry {
    id: string;
    icon: string | string[];
    isContainer: boolean;
    isLeaf: boolean;
    isSelectable: boolean;
    name: string;
    path: string;
}

export interface LfRepositoryProviders {
    dataService: LfRepositoryService;
}
  
export interface LfRepositoryService {
    breadCrumb: Entry[];
    currentFolder: Entry | undefined;
    list: Entry[];

    /**
     * Gets entry data for the lf-repository-browser to display
     * @param folderId: string that represents the ID of the folder to get data from, a null value should be handled as the "root" folder
     * @param refresh: Boolean value that should be used to indicate if the data for a folder should be pulled from the server even if cached
     * returns - Promise with a list of Entry items that are in the associated folder
    **/
    getData(folderId: string | null, filterText: string | undefined, refresh?: boolean): Promise<Entry[]>;

    /** 
     * 
     * 
    */
    getRootEntryAsync(): Promise<Entry | undefined>;

    /**
     * Gets the parent Entry of the passed in node
     * @param entry: Entry object to get the parent of
     * returns - Promise with the parent of the parameter entry or undefined if its the root of the entry does not have a parent
    */
    getParentEntryAsync(entry: Entry): Promise<Entry | undefined>;

    /**
     * Gets the full Entry data of an entry id
     * @param id: string that represents the id of an Entry to get
     * returns - Entry assocaited with the id paramater or undefined if the entry does not exist
     */
    getEntryByIdAsync(id: string): Promise<Entry | undefined>;
}