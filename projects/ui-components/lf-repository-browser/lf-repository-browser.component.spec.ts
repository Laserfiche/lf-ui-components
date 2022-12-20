import { ChangeDetectorRef, NgZone } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync, TestModuleMetadata } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { LfBreadcrumbsComponent } from '../shared/lf-shared-public-api';
import { MatDialog } from '@angular/material/dialog';
import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';
import { LfTreeNodeService, LfTreeNode } from './ILfTreeNodeService';
import { LfSelectionListModule } from '../lf-selection-list/lf-selection-list.module';
import { AppLocalizationService, LfLoaderComponent } from '../internal-shared/internal-shared-public-api';
import { ILfSelectable } from '../shared/LfSelectable';

const rootTreeNode: LfTreeNode = {
  icon: '',
  id: '1',
  isContainer: true,
  isLeaf: false,
  name: 'root',
  path: '',
};

const rootTreeNodeChildren: LfTreeNode[] = [
  {
    icon: '',
    id: '2',
    isContainer: false,
    isLeaf: false,
    name: 'tree node (2)',
    path: '',
  },
  {
    icon: '',
    id: '3',
    isContainer: true,
    isLeaf: false,
    name: 'tree folder (3)',
    path: '',
  },
];

const moduleDef: TestModuleMetadata = {
  imports: [
    MatListModule,
    MatIconModule,
    FormsModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatDialogModule,
    LfSelectionListModule,
  ],
  declarations: [LfRepositoryBrowserComponent, LfBreadcrumbsComponent, LfLoaderComponent],
};

describe('LfRepositoryBrowserComponent', () => {
  let component: LfRepositoryBrowserComponent;
  let fixture: ComponentFixture<LfRepositoryBrowserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(moduleDef).compileComponents();
  }));

  beforeEach(async () => {
    changeRefMock = jasmine.createSpyObj('changeDetectorRef', ['detectChanges']);
    localizeServiceMock = jasmine.createSpyObj('localizeion', {
      getStringLaserficheObservable: (value: string) => value,
    });
    matDialogMock = jasmine.createSpyObj('matDialog', ['open']);
    ngZoneMock = jasmine.createSpyObj('ngZone', {
      run: (cb: Function) => cb(),
    });

    fixture = TestBed.createComponent(LfRepositoryBrowserComponent);
    component = fixture.componentInstance;
    // await component.initAsync(repoService);
    fixture.detectChanges();
  });

  let changeRefMock: ChangeDetectorRef;
  const dataServiceMock: jasmine.SpyObj<LfTreeNodeService> = jasmine.createSpyObj('dataService', [
    'getFolderChildrenAsync',
    'getRootTreeNodeAsync',
    'getParentTreeNodeAsync',
    'getTreeNodeByIdAsync',
  ]);
  let localizeServiceMock: AppLocalizationService;
  let matDialogMock: MatDialog;
  let ngZoneMock: NgZone;

  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });

  describe('initAsync', () => {
    it('should get the rootEntry and its folder data when no parameter is passed', async () => {
      // Arrange
      dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
      dataServiceMock.getFolderChildrenAsync.and.returnValue(
        Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
      );
      dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

      // Act
      await component.initAsync(dataServiceMock);

      // Assert
      expect(component.breadcrumbs[0]).toEqual(rootTreeNode);
      expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
        rootTreeNodeChildren
      );
    });

    it('should use the entry passed to selectedEntry parameter as the root', async () => {
      // Arrange
      const id = '3';
      const entryToGet: LfTreeNode = {
        icon: '',
        id,
        isContainer: true,
        isLeaf: false,
        name: 'test entry (3)',
        path: '',
      };
      dataServiceMock.getFolderChildrenAsync.and.returnValue(
        Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
      );
      dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

      // Act
      await component.initAsync(dataServiceMock, entryToGet);

      // Assert
      expect(component.breadcrumbs[0]).toEqual(entryToGet);
      expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
        rootTreeNodeChildren
      );
    });

    it('should use the parent entry of the passed in entry if it is not a container entry', async () => {
      // Arrange
      const id = '4';
      const parentId = '5';
      const entry: LfTreeNode = {
        icon: '',
        id,
        isContainer: false,
        isLeaf: false,
        name: 'test entry (4)',
        path: '5',
      };
      const parentEntry: LfTreeNode = {
        icon: '',
        id: parentId,
        isContainer: true,
        isLeaf: false,
        name: 'parent entry',
        path: '',
      };
      dataServiceMock.getFolderChildrenAsync.and.returnValue(
        Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
      );
      dataServiceMock.getParentTreeNodeAsync.and.callFake((entry: LfTreeNode) => {
        if (entry.id === id) {
          return Promise.resolve(parentEntry);
        }
        return Promise.resolve(undefined);
      });

      // Act
      await component.initAsync(dataServiceMock, entry);

      // Assert
      expect(component.breadcrumbs[0]).toEqual(parentEntry);
      expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
        rootTreeNodeChildren
      );
    });

    it('should be in an erorr state when there is no root tree node found when being called without the selectedEntry parameter', async () => {
      // Arrange
      dataServiceMock.getRootTreeNodeAsync.and.rejectWith('error');

      // Act
      await component.initAsync(dataServiceMock);

      // Assert
      expect(component.hasError).toBeTrue();
    });

    it('should setup the repository browser with the root entry returned by the dataService', async () => {
      // Arrange
      dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
      dataServiceMock.getFolderChildrenAsync.and.returnValue(
        Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
      );

      // Act
      await component.initAsync(dataServiceMock);

      // Assert
      expect(component.breadcrumbs[0]).toEqual(rootTreeNode);
      expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
        rootTreeNodeChildren
      );
    });

    it('should update the breadcrumbs and get new data for the selected entry', async () => {
      // Arrange
      const id = '7';
      const entry: LfTreeNode = {
        icon: '',
        id,
        isContainer: true,
        isLeaf: true,
        name: 'test entry (7)',
        path: '8',
      };
      const parent: LfTreeNode = {
        icon: '',
        id: '8',
        isContainer: true,
        isLeaf: false,
        name: 'test entry (8)',
        path: '',
      };
      const newBreadCrumbs = [entry, parent];
      dataServiceMock.getFolderChildrenAsync.and.returnValue(
        Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
      );
      dataServiceMock.getParentTreeNodeAsync.and.callFake((treeNode: LfTreeNode) => {
        if (treeNode.id === id) {
          return Promise.resolve(parent);
        }
        return Promise.resolve(undefined);
      });

      // Act
      await component.initAsync(dataServiceMock, entry);

      // Assert
      expect(component.breadcrumbs).toEqual(newBreadCrumbs);
      expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
        rootTreeNodeChildren
      );
    });
  });

  it('openChildFolderAsync should update the breadcrumbs and get new data for the passed in entry', async () => {
    // Arrange
    const entry: LfTreeNode = {
      icon: '',
      id: '9',
      isContainer: true,
      isLeaf: false,
      name: 'test entry (9)',
      path: '',
    };
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    component.treeNodeService = dataServiceMock;
    // Act
    await component.openChildFolderAsync(entry);

    // Assert
    expect(component.breadcrumbs).toEqual([entry]);
    expect(component.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(
      rootTreeNodeChildren
    );
  });

  it('openChildFolderAsync should correctly append the new entry to the breadcrumbs', async () => {
    // Arrange
    const parent: LfTreeNode = {
      icon: '',
      id: '9',
      isContainer: true,
      isLeaf: false,
      name: 'test entry (9)',
      path: '',
    };
    const entry: LfTreeNode = {
      icon: '',
      id: '10',
      isContainer: true,
      isLeaf: true,
      name: 'test entry (10)',
      path: '9',
    };
    dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({ nextPage: undefined, page: [] }));

    component.treeNodeService = dataServiceMock;

    // Act
    await component.openChildFolderAsync(parent);
    await component.openChildFolderAsync(entry);

    // Assert
    expect(component.breadcrumbs).toEqual([entry, parent]);
  });

  it('entrySelected should not emit if node was last selected', async () => {
    spyOn(component.entrySelected, 'emit');
    const selectedItems = [{
        isSelected: true,
        isSelectable: true,
        value: {
        icon: '',
        id: '10',
        isContainer: true,
        isLeaf: true,
        name: 'test entry (10)',
        path: '9',
      }}];
    await component.onItemSelected({
        selected: selectedItems[0],
        selectedItems
    });

    expect(component.entrySelected.emit).toHaveBeenCalledTimes(1);

    await component.onItemSelected({
        selected: selectedItems[0],
        selectedItems
    });

    expect(component.entrySelected.emit).toHaveBeenCalledTimes(1);
  });

  it('openChildFolderAsync should do nothing if the entry is not a container', async () => {
    // Arrange
    const entry: LfTreeNode = {
      icon: '',
      id: '11',
      isContainer: false,
      isLeaf: true,
      name: 'test entry (11)',
      path: '',
    };
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    component.treeNodeService = dataServiceMock;

    // Act
    await component.openChildFolderAsync(entry);

    // Assert
    expect(component.currentFolderChildren.length).toBe(0);
  });

  it('openSelectedItemsAsync should emit event if document selected', async () => {
    // Arrange
    dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

    // Act
    await component.initAsync(dataServiceMock);
    // @ts-ignore
    component.selectedItems = [
      {
        name: 'Test doc',
        icon: '',
        id: '2',
        isContainer: false,
        isLeaf: true,
        path: '',
      },
    ];
    spyOn(component.entryDblClicked, 'emit');
    await component.openSelectedItemsAsync();
    expect(component.currentFolder).toBe(rootTreeNode);
    expect(component.entryDblClicked.emit).toHaveBeenCalled();
  });

  it('openSelectedItemsAsync should emit event if different entry types selected without changing current folder', async () => {
    // Arrange
    dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));
    spyOn(component.entryDblClicked, 'emit');

    // Act
    await component.initAsync(dataServiceMock);
    // @ts-ignore
    component.selectedItems = [
      {
        name: 'Test doc',
        icon: '',
        id: '2',
        isContainer: false,
        isLeaf: true,
        path: '',
      },
      {
        name: 'Test folder',
        icon: '',
        id: '3',
        isContainer: true,
        isLeaf: false,
        path: '',
      },
    ];
    expect(component.currentFolder).toBe(rootTreeNode);
    await component.openSelectedItemsAsync();
    expect(component.currentFolder).toBe(rootTreeNode);
    expect(component.entryDblClicked.emit).toHaveBeenCalled();
  });

  it('openSelectedItemsAsync should emit event if multiple folders selected', async () => {
        // Arrange
        dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
        dataServiceMock.getFolderChildrenAsync.and.returnValue(
          Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
        );
        dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

        // Act
        await component.initAsync(dataServiceMock);
        // @ts-ignore
        component.selectedItems = [
          {
            name: 'Test folder 2',
            icon: '',
            id: '4',
            isContainer: true,
            isLeaf: false,
            path: '',
          },
          {
            name: 'Test folder',
            icon: '',
            id: '3',
            isContainer: true,
            isLeaf: false,
            path: '',
          },
        ];
        spyOn(component.entryDblClicked, 'emit');
        await component.openSelectedItemsAsync();
        expect(component.currentFolder).toBe(rootTreeNode);
        expect(component.entryDblClicked.emit).toHaveBeenCalled();
  });

  it('openSelectedItemsAsync should emit event and open folder if single folder selected', async () => {
    // Arrange
    dataServiceMock.getRootTreeNodeAsync.and.returnValue(Promise.resolve(rootTreeNode));
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    dataServiceMock.getParentTreeNodeAsync.and.returnValue(Promise.resolve(undefined));

    // Act
    await component.initAsync(dataServiceMock);
    // @ts-ignore
    component.selectedItems = [rootTreeNodeChildren[1]];
    spyOn(component.entryDblClicked, 'emit');
    await component.openSelectedItemsAsync();
    expect(component.currentFolder).toBe(rootTreeNodeChildren[1]);
    expect(component.entryDblClicked.emit).toHaveBeenCalled();
  });

  it('setSelectedNodesAsync should clear previous selected nodes that are not in the nodesToSelect param', async () => {
    // Arrange
    const id = '7';
    const entry: LfTreeNode = {
      icon: '',
      id,
      isContainer: true,
      isLeaf: true,
      name: 'test entry (7)',
      path: '8',
    };
    const parent: LfTreeNode = {
      icon: '',
      id: '8',
      isContainer: true,
      isLeaf: false,
      name: 'test entry (8)',
      path: '',
    };
    dataServiceMock.getFolderChildrenAsync.and.returnValue(
      Promise.resolve({ nextPage: undefined, page: rootTreeNodeChildren })
    );
    dataServiceMock.getParentTreeNodeAsync.and.callFake((treeNode: LfTreeNode) => {
      if (treeNode.id === id) {
        return Promise.resolve(parent);
      }
      return Promise.resolve(undefined);
    });
    await component.initAsync(dataServiceMock, entry);

    // Act
    await component.setSelectedNodesAsync([]);

    // Assert
    // @ts-ignore
    expect(component.selectedItems).toEqual([]);

  });
  // describe('setNodeAsParentAsync', () => {
  //     const parent: TreeNode = {
  //         icon: '',
  //         id: '13',
  //         isContainer: true,
  //         isLeaf: false,
  //         name: 'test entry (13)',
  //         path: ''
  //     };
  //     const entryId = '12';
  //     const entry: TreeNode = {
  //         icon: '',
  //         id: entryId,
  //         isContainer: true,
  //         isLeaf: true,
  //         name: 'test entry (12)',
  //         path: ''
  //     };

  //     it('should build the breadcrumbs from the passed in parentEntry', async () => {
  //         Arrange
  //         dataServiceMock.getParentTreeNodeAsync.and.callFake((entry: TreeNode) => {
  //             if (entry.id !== entryId) {
  //                 return Promise.resolve(undefined);
  //             }
  //             return Promise.resolve(parent);
  //         });

  //         directive.treeNodeService = dataServiceMock;

  //         Act
  //         await directive.setNodeAsParentAsync(entry);

  //         Assert
  //         expect(directive.breadcrumbs).toEqual([entry, parent]);
  //     });

  //     it('should set the breadcrumbs to be the be the parentEntry plus the listOfAncestorEntries', async () => {
  //         Arrange
  //         directive.treeNodeService = dataServiceMock;

  //         Act
  //         await directive.setNodeAsParentAsync(entry, [parent]);

  //         Assert
  //         expect(directive.breadcrumbs).toEqual([entry, parent]);
  //     });

  //     it('should get the new data when called', async () => {
  //         Arrange
  //         dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
  //         directive.treeNodeService = dataServiceMock;
  //         directive.currentFolderChildren = [{
  //             isSelectable: true,
  //             isSelected: false,
  //             value: entry
  //         }];

  //         Act
  //         await directive.setNodeAsParentAsync(parent);

  //         Assert
  //         expect(directive.currentFolderChildren.map((lfSelectable: ILfSelectable) => lfSelectable.value)).toEqual(rootTreeNodeChildren);
  //     });

  //     it('should not attempt to get any new data when the parentEntry is not a container', async () => {
  //         Arrange
  //         const notContainer: TreeNode = {
  //             icon: '',
  //             id: '16',
  //             isContainer: false,
  //             isLeaf: true,
  //             name: 'test entry (16)',
  //             path: ''
  //         };
  //         dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: rootTreeNodeChildren}));
  //         directive.treeNodeService = dataServiceMock;
  //         directive.currentFolderChildren = [{
  //             isSelectable: true,
  //             isSelected: false,
  //             value: entry
  //         }];

  //         Act
  //         await directive.setNodeAsParentAsync(notContainer);

  //         Assert
  //         expect(directive.currentFolderChildren).toEqual([{
  //             isSelectable: true,
  //             isSelected: false,
  //             value: entry
  //         }]);
  //     });
  // });

  // describe('updateAllPossibleEntriesAsync', () => {
  //     let entry: TreeNode;
  //     beforeEach(() => {
  //         entry = {
  //             icon: '',
  //             id: '17',
  //             isContainer: true,
  //             isLeaf: true,
  //             name: 'test entry (17)',
  //             path: ''
  //         };
  //     });
  //     it('should set the component to error state when dataService has an error', async () => {
  //         Arrange
  //         dataServiceMock.getFolderChildrenAsync.and.rejectWith(Promise.reject());
  //         directive.treeNodeService = dataServiceMock;

  //         Act
  //         await directive.updateAllPossibleEntriesAsync(entry);

  //         Assert
  //         expect(directive.hasError).toBeTrue();
  //     });

  //     it('should not be loading or errored when the dataService returns data', async () => {
  //         Arrange
  //         dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: []}));
  //         directive.treeNodeService = dataServiceMock;

  //         Act
  //         await directive.updateAllPossibleEntriesAsync(entry);

  //         Assert
  //         expect(directive.hasError).toBeFalse();
  //         expect(directive.isLoading).toBeFalse();
  //     });

  //     it('should reset the selection when call to dataService errors', async () => {
  //         // Arrange
  //         const resetSpy = jasmine.createSpy('reset');
  //         dataServiceMock.getFolderChildrenAsync.and.rejectWith(Promise.reject());
  //         directive.treeNodeService = dataServiceMock;
  //         directive.resetSelection = resetSpy;

  //         // Act
  //         await directive.updateAllPossibleEntriesAsync(entry);

  //         // Assert
  //         expect(resetSpy).toHaveBeenCalledOnceWith();
  //     });

  //     it('should reset the selection when dataService retrives the data', async () => {
  //         const resetSpy = jasmine.createSpy('reset');
  //         dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: undefined, page: []}));
  //         directive.treeNodeService = dataServiceMock;
  //         directive.resetSelection = resetSpy;

  //         await directive.updateAllPossibleEntriesAsync(entry);

  //         expect(resetSpy).toHaveBeenCalledOnceWith();
  //     });

  //     it('should update the nextPage when called multiple times', async () => {
  //         const nextPageLink = 'test.com/nextpage';
  //         dataServiceMock.getFolderChildrenAsync.and.returnValue(Promise.resolve({nextPage: nextPageLink, page: []}));
  //         directive.treeNodeService = dataServiceMock;

  //         await directive.updateAllPossibleEntriesAsync(entry);

  //         expect(directive.nextPage).toBe(nextPageLink);
  //     });
  // });
});
