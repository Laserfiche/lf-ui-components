// import { ComponentFixture, TestBed, waitForAsync, TestModuleMetadata } from '@angular/core/testing';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatDialogModule } from '@angular/material/dialog';
// import { FormsModule } from '@angular/forms';
// import { MatIconModule } from '@angular/material/icon';
// import { MatListModule } from '@angular/material/list';
// import { MatMenuModule } from '@angular/material/menu';
// import { LfBreadcrumbsComponent, LfLoaderComponent } from '../shared/lf-shared-public-api';
// import { TreeNode, LfTreeNodeService, TreeNodePage } from './ILFRepositoryService';

// import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';

// import { IconUtils } from '@laserfiche/lf-js-utils';

// class TestRepoService implements LfTreeNodeService {
  
//   getFolderChildrenAsync(folder: TreeNode, nextPage?: string): Promise<TreeNodePage> {
//     throw new Error('Method not implemented.');
//   }
//   getRootTreeNodeAsync(): Promise<TreeNode | undefined> {
//     throw new Error('Method not implemented.');
//   }
//   getParentTreeNodeAsync(treeNode: TreeNode): Promise<TreeNode | undefined> {
//     throw new Error('Method not implemented.');
//   }
//   getTreeNodeByIdAsync(id: string): Promise<TreeNode | undefined> {
//     throw new Error('Method not implemented.');
//   }
// }


// const moduleDef: TestModuleMetadata = {
//   imports: [
//     MatListModule,
//     MatIconModule,
//     FormsModule,
//     MatMenuModule,
//     MatButtonToggleModule,
//     MatDialogModule
//   ],
//   declarations: [
//     LfRepositoryBrowserComponent,
//     LfBreadcrumbsComponent,
//     LfLoaderComponent
//   ]
// };
// const repoService: LfTreeNodeService = new TestRepoService();
// const FILE_SVG = IconUtils.getDocumentIconUrlFromIconId('document-20');
// const FOLDER_SVG = IconUtils.getDocumentIconUrlFromIconId('folder-20');
// const rootNode: TreeNode = {
//   name: 'Repository 1',
//   id: 'Repository 1',
//   path: 'Repository 1',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const nested1Node: TreeNode = {
//   name: 'Nested1',
//   id: 'Repository 1/Nested1',
//   path: 'Repository 1/Nested1',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const errorNode: TreeNode = {
//   name: 'Wait 3 seconds, then throw an error!',
//   id: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
//   path: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const emptyFolderNode: TreeNode = {
//   name: 'Nothing in here',
//   id: 'Repository 1/Nested1/Nothing in here',
//   path: 'Repository 1/Nested1/Nothing in here',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const nested2Node: TreeNode = {
//   name: 'Nested2',
//   id: 'Repository 1/Nested1/Nested2',
//   path: 'Repository 1/Nested1/Nested2',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const nested3Node: TreeNode = {
//   name: 'Nested3',
//   id: 'Repository 1/Nested1/Nested2/Nested3',
//   path: 'Repository 1/Nested1/Nested2/Nested3',
//   icon: FOLDER_SVG,
//   isContainer: true,
//   isSelectable: false,
//   isLeaf: false,
  
// };
// const nested4Node: TreeNode = {
//   name: 'Nested4',
//   id: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
//   path: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
//   icon: FILE_SVG,
//   isContainer: false,
//   isSelectable: true,
//   isLeaf: true,
  
// };

// describe('')

// describe('LfRepositoryBrowserComponent - no selected node', () => {
//   let component: LfRepositoryBrowserComponent;
//   let fixture: ComponentFixture<LfRepositoryBrowserComponent>;

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule(moduleDef)
//     .compileComponents();
//   }));

//   beforeEach(async () => {
//     fixture = TestBed.createComponent(LfRepositoryBrowserComponent);
//     component = fixture.componentInstance;
//     await component.initAsync(repoService);
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('initAsync should be called with no selected node', async () => {
//     // Arrange
//     spyOn(component, 'initAsync');

//     // Act
//     await component.initAsync(repoService);
//     fixture.detectChanges();

//     // Assert
//     expect(component.initAsync).toHaveBeenCalledWith(repoService);
//   });

//   // it('initAsync with no selectedNode should display children of root node', async () => {
//   //   // Arrange
//   //   const rootNodeChildren = await repoService.getFolderChildrenAsync(rootNode);

//   //   // Act
//   //   // Assert
//   //   expect(component).toEqual(rootNodeChildren);
//   // });

//   it('initAsync with no selectedNode should have root node in breadcrumbs', async () => {
//     // Arrange
//     // Act
//     // Assert
//     expect(component.breadcrumbs).toEqual([rootNode]);
//   });

// });

// describe('LfFileExplorerComponent - valid selected node', () => {
//   let component: LfRepositoryBrowserComponent;
//   let fixture: ComponentFixture<LfRepositoryBrowserComponent>;
//   const selectedNodeId: string = 'Repository 1/Nested1/Nested2';

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule(moduleDef)
//     .compileComponents();
//   }));

//   beforeEach(async () => {
//     fixture = TestBed.createComponent(LfRepositoryBrowserComponent);
//     component = fixture.componentInstance;
//     await component.initAsync(repoService, selectedNodeId);
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('initAsync should be called with a valid selectedNode', async () => {
//     // Arrange
//     // Act
//     spyOn(component, 'initAsync');
//     await component.initAsync(repoService, selectedNodeId);
//     fixture.detectChanges();

//     // Assert
//     expect(component.initAsync).toHaveBeenCalledWith(repoService, selectedNodeId);
//   });

//   it('should update breadcrumbs and displayed nodes when selecting root node in breadcrumbs', async () => {
//     // Act
//     await component.onBreadcrumbClicked({breadcrumbs: [rootNode], selected: rootNode});
//     fixture.detectChanges();

//     // Assert
    
//     const expectedBreadcrumbs: TreeNode[] = [rootNode];

//     expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
//   });

//   it('should update breadcrumbs and displayed nodes when selecting grandparent in breadcrumbs', async () => {
//     // Act
//     await component.onBreadcrumbClicked({breadcrumbs: [nested1Node, rootNode], selected: nested1Node});
//     fixture.detectChanges();

//     // Assert
//     // const expectedDisplayedNodes: TreeNode[] = [nested2Node, emptyFolderNode, errorNode];
//     const expectedBreadcrumbs: TreeNode[] = [nested1Node, rootNode];
//     // expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
//     expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
//   });

//   it('should update breadcrumbs and displayed nodes when double clicking on a displayed container node', async () => {
//     // Arrange

//     // Act
//     await component.openChildFolderAsync(nested3Node);
//     fixture.detectChanges();

//     // Assert
//     // const expectedDisplayedNodes: TreeNode[] = [nested4Node];
//     const expectedBreadcrumbs: TreeNode[] = [nested3Node, nested2Node, nested1Node, rootNode];
//     // expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
//     expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
//   });
// });
