import { waitForAsync, ComponentFixture, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { LfFileExplorerComponent } from './lf-file-explorer.component';
import { LfBreadcrumbsComponent } from './../lf-breadcrumbs/lf-breadcrumbs.component';
import { LfToolbarComponent } from '../lf-toolbar/lf-toolbar.component';
import { LfLoaderComponent } from '@laserfiche/laserfiche-ui-components/shared';
import { LfTreeProviders, TreeNode } from '../../utils/lf-tree.service';
import { LfTreeDemoFilePickerService } from './../../../../lf-documentation/src/app/lf-tree-documentation/lf-tree-demo-file-picker.service';

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
    LfFileExplorerComponent,
    LfBreadcrumbsComponent,
    LfToolbarComponent,
    LfLoaderComponent
  ]
};
const providers: LfTreeProviders = { treeService: new LfTreeDemoFilePickerService() };
const FILE_SVG = `./file.svg`;
const FOLDER_SVG = `./folder.svg`;
const rootNode: TreeNode = {
  name: 'Repository 1',
  id: 'Repository 1',
  path: 'Repository 1',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const nested1Node: TreeNode = {
  name: 'Nested1',
  id: 'Repository 1/Nested1',
  path: 'Repository 1/Nested1',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const errorNode: TreeNode = {
  name: 'Wait 3 seconds, then throw an error!',
  id: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
  path: 'Repository 1/Nested1/Wait 3 seconds, then throw an error!',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const emptyFolderNode: TreeNode = {
  name: 'Nothing in here',
  id: 'Repository 1/Nested1/Nothing in here',
  path: 'Repository 1/Nested1/Nothing in here',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const nested2Node: TreeNode = {
  name: 'Nested2',
  id: 'Repository 1/Nested1/Nested2',
  path: 'Repository 1/Nested1/Nested2',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const nested3Node: TreeNode = {
  name: 'Nested3',
  id: 'Repository 1/Nested1/Nested2/Nested3',
  path: 'Repository 1/Nested1/Nested2/Nested3',
  icon: FOLDER_SVG,
  isContainer: true,
  isSelectable: false,
  isLeaf: false
};
const nested4Node: TreeNode = {
  name: 'Nested4',
  id: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
  path: 'Repository 1/Nested1/Nested2/Nested3/Nested4',
  icon: FILE_SVG,
  isContainer: false,
  isSelectable: true,
  isLeaf: true
};

describe('LfFileExplorerComponent - no selected node', () => {
  let component: LfFileExplorerComponent;
  let fixture: ComponentFixture<LfFileExplorerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(moduleDef)
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfFileExplorerComponent);
    component = fixture.componentInstance;
    await component.initAsync(providers);
    component.ok_button_text = 'OK';
    component.cancel_button_text = 'CANCEL';
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
    const rootNodeChildren = await providers.treeService.getChildrenAsync(rootNode);

    // Act
    // Assert
    expect(component.displayedNodes).toEqual(rootNodeChildren);
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
      isSelectable: false
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
      isSelectable: true
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
      isSelectable: true
    }];

    // Act
    component.selected_nodes = selectableLeafNode;
    component.ok_button_disabled = true;
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
  let component: LfFileExplorerComponent;
  let fixture: ComponentFixture<LfFileExplorerComponent>;
  const selectedNodeId: string = 'Repository 1/Nested1/Nested2';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule(moduleDef)
    .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfFileExplorerComponent);
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
    expect(component.displayedNodes).toEqual(expectedDisplayedNodes);
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
    const expectedDisplayedNodes: TreeNode[] = await component.treeService.getChildrenAsync(rootNode);
    const expectedBreadcrumbs: TreeNode[] = [rootNode];
    expect(component.displayedNodes).toEqual(expectedDisplayedNodes);
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });

  it('should update breadcrumbs and displayed nodes when selecting grandparent in breadcrumbs', async () => {
    // Act
    await component.onBreadcrumbSelected(nested1Node);
    fixture.detectChanges();

    // Assert
    const expectedDisplayedNodes: TreeNode[] = [nested2Node, emptyFolderNode, errorNode];
    const expectedBreadcrumbs: TreeNode[] = [nested1Node, rootNode];
    expect(component.displayedNodes).toEqual(expectedDisplayedNodes);
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
    expect(component.displayedNodes).toEqual(expectedDisplayedNodes);
    expect(component.breadcrumbs).toEqual(expectedBreadcrumbs);
  });
});
