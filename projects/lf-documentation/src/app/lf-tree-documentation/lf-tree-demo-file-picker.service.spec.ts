import { LfTreeDemoFilePickerService } from './lf-tree-demo-file-picker.service';

describe('LfTreeDemoFilePickerService', () => {
  let service: LfTreeDemoFilePickerService;

  beforeEach(() => {
    service = new LfTreeDemoFilePickerService();
  });

  it('can get existing folder node', async () => {
    const result = await service.getNodeByIdAsync('Random/Even More Random');
    expect(result?.path).toEqual('Random/Even More Random');
    expect(result?.isLeaf).toBeFalse();
  });

  it('can get existing leaf node', async () => {
    const result = await service.getNodeByIdAsync('Random/Even More Random/eVENmORErAnDOm');
    expect(result?.path).toEqual('Random/Even More Random/eVENmORErAnDOm');
    expect(result?.isLeaf).toBeTrue();
  });

  it('cannot get non-existent node', async () => {
    const result = await service.getNodeByIdAsync('Random/Even More Random/non-existent');
    expect(result).toBeUndefined();
  });

  it('can get parent path of nested item', () => {
    const result = service.getParentPath('hello/world');
    expect(result).toEqual('hello');
  });

  it('cannot get parent path of top level item', () => {
    const result = service.getParentPath('hello');
    expect(result).toBeUndefined();
  });

  it('can get name from path', () => {
    // Arrange
    const expectedOutputByInput: { [key: string]: string } = {
      'Public/Andrew': 'Andrew',
      Public: 'Public',
      'Public/': 'Public',
      'Public/Andrew/': 'Andrew',
    };

    for (const input in expectedOutputByInput) {
      // Act
      const result = service.getName(input);

      // Assert
      expect(result).toEqual(expectedOutputByInput[input]);
    }
  });
});
