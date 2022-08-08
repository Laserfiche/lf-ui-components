import { ComponentFixture, TestBed, waitForAsync, TestModuleMetadata } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { LfBreadcrumbsComponent, LfLoaderComponent } from '../shared/lf-shared-public-api';
import { TreeNode, LfRepositoryProviders, LfRepositoryService } from './ILFRepositoryService';

import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';

import { IconUtils } from '@laserfiche/lf-js-utils';

class TestRepoService implements LfRepositoryService {
  
  breadCrumb: TreeNode[] = [];
  currentFolder: TreeNode | undefined;
  currentFolderChildren: TreeNode[] = [];

  getFolderChildrenAsync(folderId: string | null, filterText: string | undefined, refresh?: boolean | undefined): Promise<TreeNode[]> {
    throw new Error('Method not implemented.');
  }
  getRootEntryAsync(): Promise<TreeNode | undefined> {
    throw new Error('Method not implemented.');
  }
  getParentEntryAsync(entry: TreeNode): Promise<TreeNode | undefined> {
    throw new Error('Method not implemented.');
  }
  getEntryByIdAsync(id: string): Promise<TreeNode | undefined> {
    throw new Error('Method not implemented.');
  }
}


const moduleDef: TestModuleMetadata = {
  imports: [
    MatListModule,
    MatIconModule,
    FormsModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatDialogModule
  ],
  declarations: [
    LfRepositoryBrowserComponent,
    LfBreadcrumbsComponent,
    LfLoaderComponent
  ]
};
const providers: LfRepositoryProviders = { dataService: new TestRepoService()};
const FILE_SVG = IconUtils.getDocumentIconUrlFromIconId('document-20');
const FOLDER_SVG = IconUtils.getDocumentIconUrlFromIconId('folder-20');
const rootNode: TreeNode = {
  name: 'Repository 1',
  id: 'Repository 1',
  path: 'Repository 1',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const nested1Node: TreeNode = {
  name: 'Nested1',
  id: 'Repository 1/Nested1',
  path: 'Repository 1/Nested1',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const errorNode: TreeNode = {
  name: 'Wait 3 seconds, then throw an error!',
  id: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
  path: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const emptyFolderNode: TreeNode = {
  name: 'Nothing in here',
  id: 'Repository 1/Nested1/Nothing in here',
  path: 'Repository 1/Nested1/Nothing in here',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const nested2Node: TreeNode = {
  name: 'Nested2',
  id: 'Repository 1/Nested1/Nested2',
  path: 'Repository 1/Nested1/Nested2',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const nested3Node: TreeNode = {
  name: 'Nested3',
  id: 'Repository 1/Nested1/Nested2/Nested3',
  path: 'Repository 1/Nested1/Nested2/Nested3',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false,
  
};
const nested4Node: TreeNode = {
  name: 'Nested4',
  id: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
  path: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
  icon: FILE_SVG,
  isContainer: false,
  isSelectable: true,
  isLeaf: true,
  
};

describe('LfRepositoryBrowserComponent - no selected node', () => {
  let component: LfRepositoryBrowserComponent;
  let fixture: ComponentFixture<LfRepositoryBrowserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(moduleDef)
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfRepositoryBrowserComponent);
    component = fixture.componentInstance;
    await component.initAsync(providers);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initAsync should be called with no selected node', async () => {
    // Arrange
    spyOn(component, 'initAsync');

    // Act
    await component.initAsync(providers);
    fixture.detectChanges();

    // Assert
    expect(component.initAsync).toHaveBeenCalledWith(providers);
  });

  it('initAsync with no selectedNode should display children of root node', async () => {
    // Arrange
    const rootNodeChildren = await providers.dataService.getFolderChildrenAsync(rootNode.id, '');

    // Act
    // Assert
    expect(component).toEqual(rootNodeChildren);
  });

  it('initAsync with no selectedNode should have root node in breadcrumbs', async () => {
    // Arrange
    // Act
    // Assert
    expect(component.breadcrumbs).toEqual([rootNode]);
  });

  it('should enable OPEN button when focused node is container', async () => {
    // Arrange
    const nonSelectableContainerNode: TreeNode = {
      name: 'dummy-name',
      id: 'dummy-id',
      path: 'dummy-path',
      icon: 'dummy-icon',
      isLeaf: false,
      isContainer: true,
      isSelectable: false,
      
    };

    // Act
    component._focused_node = nonSelectableContainerNode;
    fixture.detectChanges();

    // Assert
    const openButton: HTMLButtonElement | undefined = document.getElementById('openButton') as HTMLButtonElement;
    const okButton: HTMLButtonElement | undefined = document.getElementById('okButton') as HTMLButtonElement;
    expect(openButton).toBeTruthy();
    expect(okButton).toBeFalsy();
  });

  it('should enable OK button when selectedNodes is not empty', async () => {
    // Arrange
    const selectableLeafNode: TreeNode[] = [{
      name: 'dummy-name',
      id: 'dummy-id',
      path: 'dummy-path',
      icon: 'dummy-icon',
      isLeaf: true,
      isContainer: false,
      isSelectable: true,
      
    }];

    // Act
    component.selected_nodes = selectableLeafNode;
    fixture.detectChanges();

    // Assert
    const openButton: HTMLButtonElement | undefined = document.getElementById('openButton') as HTMLButtonElement;
    const okButton: HTMLButtonElement | undefined = document.getElementById('okButton') as HTMLButtonElement;
    expect(openButton).toBeFalsy();
    expect(okButton).toBeTruthy();
    expect(okButton.disabled).toBeFalse();
  });

  it('should disable OK button when okButtonDisabled is set to true', async () => {
    // Arrange
    const selectableLeafNode: TreeNode[] = [{
      name: 'dummy-name',
      id: 'dummy-id',
      path: 'dummy-path',
      icon: 'dummy-icon',
      isLeaf: true,
      isContainer: false,
      isSelectable: true,
      
    }];

    // Act
    component.selected_nodes = selectableLeafNode;
    fixture.detectChanges();

    // Assert
    const openButton: HTMLButtonElement | undefined = document.getElementById('openButton') as HTMLButtonElement;
    const okButton: HTMLButtonElement | undefined = document.getElementById('okButton') as HTMLButtonElement;
    expect(openButton).toBeFalsy();
    expect(okButton).toBeTruthy();
    expect(okButton.disabled).toBeTrue();
  });
});

describe('LfFileExplorerComponent - valid selected node', () => {
  let component: LfRepositoryBrowserComponent;
  let fixture: ComponentFixture<LfRepositoryBrowserComponent>;
  const selectedNodeId: string = 'Repository 1/Nested1/Nested2';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(moduleDef)
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfRepositoryBrowserComponent);
    component = fixture.componentInstance;
    await component.initAsync(providers, selectedNodeId);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initAsync should be called with a valid selectedNode', async () => {
    // Arrange
    // Act
    spyOn(component, 'initAsync');
    await component.initAsync(providers, selectedNodeId);
    fixture.detectChanges();

    // Assert
    expect(component.initAsync).toHaveBeenCalledWith(providers, selectedNodeId);
  });

  it('initAsync with a valid selectedNode should return children', async () => {
    // Arrange
    // Act
    // Assert
    const expectedDisplayedNodes: TreeNode[] = [nested3Node];
    expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
  });

  it('initAsync with a valid selectedNode should return selectedNode and ancestors in breadcrumbs', async () => {
    // Arrange
    // Act
    // Assert
    const expectedBreadcrumbs: TreeNode[] = [nested2Node, nested1Node, rootNode];
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });

  it('should update breadcrumbs and displayed nodes when selecting root node in breadcrumbs', async () => {
    // Act
    await component.onBreadcrumbSelected(rootNode);
    fixture.detectChanges();

    // Assert
    const expectedDisplayedNodes: TreeNode[] = await component.treeNodeService.getFolderChildrenAsync(rootNode.id);
    const expectedBreadcrumbs: TreeNode[] = [rootNode];
    expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });

  it('should update breadcrumbs and displayed nodes when selecting grandparent in breadcrumbs', async () => {
    // Act
    await component.onBreadcrumbSelected(nested1Node);
    fixture.detectChanges();

    // Assert
    const expectedDisplayedNodes: TreeNode[] = [nested2Node, emptyFolderNode, errorNode];
    const expectedBreadcrumbs: TreeNode[] = [nested1Node, rootNode];
    expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });

  it('should update breadcrumbs and displayed nodes when double clicking on a displayed container node', async () => {
    // Arrange

    // Act
    await component.openChildFolderAsync(nested3Node);
    fixture.detectChanges();

    // Assert
    const expectedDisplayedNodes: TreeNode[] = [nested4Node];
    const expectedBreadcrumbs: TreeNode[] = [nested3Node, nested2Node, nested1Node, rootNode];
    expect(component.displayedEntries).toEqual(expectedDisplayedNodes);
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });
});
