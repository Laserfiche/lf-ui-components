import { ChangeDetectorRef, NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { AppLocalizationService } from "../shared/app-localization.service";
import { ILfSelectable } from "../shared/LfSelectable";
import { TreeNode, LfTreeNodeService } from "./ILfTreeNodeService";
import { RepositoryBrowserDirective } from "./repository-browser.directive";

class RepoBrowserDirectiveTest extends RepositoryBrowserDirective {
    resetSelection(): void {
        return;
    }
}

const rootTreeNode: TreeNode = {
    icon: '',
    id: '1',
    isContainer: true,
    isLeaf: false,
    name: 'root',
    path: ''
};
const rootTreeNodeChildren: TreeNode[] = [
    {
        icon: '',
        id: '2',
        isContainer: false,
        isLeaf: false,
        name: 'tree node (2)',
        path: ''
    },
    {
        icon: '',
        id: '3',
        isContainer: true,
        isLeaf: false,
        name: 'tree folder (3)',
        path: ''
    }
];

describe('RepositoryBrowserDirective', () => {
    let directive: RepositoryBrowserDirective;

    let changeRefMock: ChangeDetectorRef;
    const dataServiceMock: jasmine.SpyObj<LfTreeNodeService> = jasmine.createSpyObj('dataService', 
        [ 'getFolderChildrenAsync', 'getRootTreeNodeAsync', 
        'getParentTreeNodeAsync', 'getTreeNodeByIdAsync']
    );
    let localizeServiceMock: AppLocalizationService;
    let matDialogMock: MatDialog;
    let ngZoneMock: NgZone;
    
    beforeEach(() => {
        changeRefMock = jasmine.createSpyObj('changeDetectorRef', ['detectChanges']);
        localizeServiceMock = jasmine.createSpyObj('localizeion', {
            getStringObservable: (value: string) => value
        });
        matDialogMock = jasmine.createSpyObj('matDialog', ['open']);
        ngZoneMock = jasmine.createSpyObj('ngZone', {
            run: (cb: Function) => cb()
        });

        directive = new RepoBrowserDirectiveTest(changeRefMock, matDialogMock, ngZoneMock, localizeServiceMock);
    });

    it('should create an instance', () => {
      expect(directive).toBeTruthy();
    });

    describe('initializeAsync', () => {

        it('should throw error when no dataService is defined', async () => {
            // Arrange
            let error;

            // Act
            try {
                await directive.initializeAsync();
            } catch(er) {
                error = er;
            }

            // Assert
            expect(error).not.toBeUndefined();
            expect(directive.hasError).toBeTrue();
        });
    
        it('should get the rootEntry and its folder data when no parameter is passed', async () => {
            // Arrange
            dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));
      
            directive.treeNodeService = dataServiceMock;
    
            // Act
            await directive.initializeAsync();
    
            // Assert
            expect(directive.breadcrumbs[0]).toEqual(rootTreeNode);
            expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
        });

        it('should be in an erorr state when there is no root tree node found when being called without the currentIdOrEntry parameter', async () => {
            // Arrange
            dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.initializeAsync();

            // Assert
            expect(directive.hasError).toBeTrue();
        });
    
        it('should get the entry associated with the string passed to currentIdOrEntry parameter', async () => {
            // Arrange
            const id = '2';
            const entryToGet: TreeNode = {
                icon: '',
                id,
                isContainer: true,
                isLeaf: false,
                name: 'test entry (2)',
                path: ''
            };
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            dataServiceMock.getTreeNodeByIdAsync.and.returnValue(Promise.resolve(entryToGet));
            dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.initializeAsync(id);

            // Assert
            expect(directive.breadcrumbs[0]).toEqual(entryToGet);
            expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
        });

        it('should use the entry passed to currentIdOrEntry parameter as the root', async () => {
            // Arrange
            const id = '3';
            const entryToGet: TreeNode = {
                icon: '',
                id,
                isContainer: true,
                isLeaf: false,
                name: 'test entry (3)',
                path: ''
            };
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.initializeAsync(entryToGet);

            // Assert
            expect(directive.breadcrumbs[0]).toEqual(entryToGet);
            expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
        });

        it('should use the parent entry of the passed in entry if it is not a container entry', async () => {
            // Arrange
            const id = '4';
            const parentId = '5';
            const entry: TreeNode = {
                icon: '',
                id,
                isContainer: false,
                isLeaf: false,
                name: 'test entry (4)',
                path: '5'
            };
            const parentEntry: TreeNode = {
                icon: '',
                id: parentId,
                isContainer: true,
                isLeaf: false,
                name: 'parent entry',
                path: ''
            };
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            dataServiceMock.getParentTreeNodeAsync.and.callFake((entry: TreeNode) => {
                if (entry.id === id) {
                    return Promise.resolve(parentEntry);
                }
                return Promise.resolve(undefined);
            });

            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.initializeAsync(entry);

            // Assert
            expect(directive.breadcrumbs[0]).toEqual(parentEntry);
            expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
        });
    });

    it('initializeWithRootOpenAsync should throw an error when no dataService is defined', async () => {
        // Arrange
        let error;

        // Act
        try {
            await directive.initializeWithRootOpenAsync();
        } catch(er) {
            error = er;
        }

        // Assert
        expect(error).not.toBeUndefined();
        expect(directive.hasError).toBeTrue();
    });

    it('initializeWithRootOpenAsync should have an error if the dataService does not return a root entry', async () => {
        // Arrange
        dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(undefined));
        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.initializeWithRootOpenAsync();
       
        // Assert
        expect(directive.hasError).toBeTrue();
    });

    it('initializeWithRootOpenAsync should setup the repository browser with the root entry returned by the dataService', async () => {
        // Arrange
        dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
        dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));

        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.initializeWithRootOpenAsync();

        // Assert
        expect(directive.breadcrumbs[0]).toEqual(rootTreeNode);
        expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
    });

    it('onBreadcrumbSelected should update the breadcrumbs and get new data for the selected entry', async () => {
        // Arrange
        const id = '7';
        const entry: TreeNode = {
            icon: '',
            id,
            isContainer: true,
            isLeaf: true,
            name: 'test entry (7)',
            path: '8'
        };
        const parent: TreeNode = {
            icon: '',
            id: '8',
            isContainer: true,
            isLeaf: false,
            name: 'test entry (8)',
            path: ''
        };
        const newBreadCrumbs = [entry, parent];
        dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.onBreadcrumbClicked({breadcrumbs: newBreadCrumbs, selected: entry});

        // Assert
        expect(directive.breadcrumbs).toEqual(newBreadCrumbs);
        expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
    });

    it('openChildFolderAsync should update the breadcrumbs and get new data for the passed in entry', async () => {
        // Arrange
        const entry: TreeNode = {
            icon: '',
            id: '9',
            isContainer: true,
            isLeaf: false,
            name: 'test entry (9)',
            path: ''
        };
        dataServiceMock.getFolderChildrenAsync.and.returnValue(
            Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));

        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.openChildFolderAsync(entry);

        // Assert
        expect(directive.breadcrumbs).toEqual([entry]);
        expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
    });

    it('openChildFolderAsync should correctly append the new entry to the breadcrumbs', async () => {
        // Arrange
        const parent: TreeNode = {
            icon: '',
            id: '9',
            isContainer: true,
            isLeaf: false,
            name: 'test entry (9)',
            path: ''
        };
        const entry: TreeNode = {
            icon: '',
            id: '10',
            isContainer: true,
            isLeaf: true,
            name: 'test entry (10)',
            path: '9'
        };
        dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: []}));

        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.openChildFolderAsync(parent);
        await directive.openChildFolderAsync(entry);

        // Assert
        expect(directive.breadcrumbs).toEqual([entry, parent]);
    });

    it('openChildFolderAsync should do nothing if the entry is not a container', async () => {
        // Arrange
        const entry: TreeNode = {
            icon: '',
            id: '11',
            isContainer: false,
            isLeaf: true,
            name: 'test entry (11)',
            path: ''
        };
        dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
        directive.treeNodeService = dataServiceMock;

        // Act
        await directive.openChildFolderAsync(entry);

        // Assert
        expect(directive.currentFolderChildren.length).toBe(0);
    });

    describe('setNodeAsParentAsync', () => {
        const parent: TreeNode = {
            icon: '',
            id: '13',
            isContainer: true,
            isLeaf: false,
            name: 'test entry (13)',
            path: ''
        };
        const entryId = '12';
        const entry: TreeNode = {
            icon: '',
            id: entryId,
            isContainer: true,
            isLeaf: true,
            name: 'test entry (12)',
            path: ''
        };

        it('should build the breadcrumbs from the passed in parentEntry', async () => {
            // Arrange
            dataServiceMock.getParentTreeNodeAsync.and.callFake((entry: TreeNode) => {
                if (entry.id !== entryId) {
                    return Promise.resolve(undefined);
                }
                return Promise.resolve(parent);
            });

            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.setNodeAsParentAsync(entry);

            // Assert
            expect(directive.breadcrumbs).toEqual([entry, parent]);
        });

        it('should set the breadcrumbs to be the be the parentEntry plus the listOfAncestorEntries', async () => {
            // Arrange
            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.setNodeAsParentAsync(entry, [parent]);

            // Assert
            expect(directive.breadcrumbs).toEqual([entry, parent]);
        });

        it('should get the new data when called', async () => {
            // Arrange
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            directive.treeNodeService = dataServiceMock;
            directive.currentFolderChildren = [{
                isSelectable: true,
                isSelected: false,
                value: entry
            }];

            // Act
            await directive.setNodeAsParentAsync(parent);

            // Assert
            expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
        });

        it('should not attempt to get any new data when the parentEntry is not a container', async () => {
            // Arrange
            const notContainer: TreeNode = {
                icon: '',
                id: '16',
                isContainer: false,
                isLeaf: true,
                name: 'test entry (16)',
                path: ''
            };
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
            directive.treeNodeService = dataServiceMock;
            directive.currentFolderChildren = [{
                isSelectable: true,
                isSelected: false,
                value: entry
            }];

            // Act
            await directive.setNodeAsParentAsync(notContainer);

            // Assert
            expect(directive.currentFolderChildren).toEqual([{
                isSelectable: true,
                isSelected: false,
                value: entry
            }]);
        });
    });

    describe('updateAllPossibleEntriesAsync', () => {
        let entry: TreeNode;
        beforeEach(() => {
            entry = {
                icon: '',
                id: '17',
                isContainer: true,
                isLeaf: true,
                name: 'test entry (17)',
                path: ''
            };
        });
        it('should set the component to error state when dataService has an error', async () => {
            // Arrange
            dataServiceMock.getFolderChildrenAsync.and.rejectWith(Promise.reject());
            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.updateAllPossibleEntriesAsync(entry);

            // Assert
            expect(directive.hasError).toBeTrue();
        });

        it('should not be loading or errored when the dataService returns data', async () => {
            // Arrange
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: []}));
            directive.treeNodeService = dataServiceMock;

            // Act
            await directive.updateAllPossibleEntriesAsync(entry);

            // Assert
            expect(directive.hasError).toBeFalse();
            expect(directive.isLoading).toBeFalse();
        });

        // it('should reset the selection when call to dataService errors', async () => {
        //     // Arrange
        //     const resetSpy = jasmine.createSpy('reset');
        //     dataServiceMock.getFolderChildrenAsync.and.rejectWith(Promise.reject());
        //     directive.treeNodeService = dataServiceMock;
        //     directive.resetSelection = resetSpy;

        //     // Act
        //     await directive.updateAllPossibleEntriesAsync(entry);

        //     // Assert
        //     expect(resetSpy).toHaveBeenCalledOnceWith();
        // });

        // it('should reset the selection when dataService retrives the data', async () => {
        //     const resetSpy = jasmine.createSpy('reset');
        //     dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: []}));
        //     directive.treeNodeService = dataServiceMock;
        //     directive.resetSelection = resetSpy;

        //     await directive.updateAllPossibleEntriesAsync(entry);

        //     expect(resetSpy).toHaveBeenCalledOnceWith();
        // });

        it('should update the nextPage when called multiple times', async () => {
            const nextPageLink = 'test.com/nextpage';
            dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: nextPageLink, page: []}));
            directive.treeNodeService = dataServiceMock;

            await directive.updateAllPossibleEntriesAsync(entry);

            expect(directive.nextPage).toBe(nextPageLink);
        });
    });
});
