import { ILfSelectable, Selectable } from './LfSelectable';

class SelectionTesting {
  testItems: { [key: string]: ILfSelectable } = {
    selectable: {
      isSelectable: true,
      isSelected: false,
      value: { id: '' },
    },
    notSelectable: {
      isSelectable: false,
      isSelected: false,
      value: { id: '' },
    },
  };

  getItem(name: string): ILfSelectable {
    if (this.testItems[name] == null) {
      throw new Error(`${name} was not found`);
    }
    const test = this.testItems[name];
    test.value.id = `${Math.floor(Math.random() * 100000) + 1}`;
    return JSON.parse(JSON.stringify(test));
  }
}

describe('LfListComponent single select', () => {
  let underTest: Selectable;
  const valueFactory = new SelectionTesting();

  beforeEach(async () => {
    underTest = new Selectable();
  });

  describe('onItemClicked single select', () => {
    it('should select the item that was passed', () => {
      // Arrange
      const toSelect = valueFactory.getItem('selectable');
      const list = [toSelect];

      // Act
      underTest.onItemClicked(new MouseEvent('click'), toSelect, list);

      // Assert
      expect(underTest.selectedItems).toContain(toSelect);
      expect(toSelect.isSelected).toBeTrue();
    });

    it('should select the current item when also holding ctrl', () => {
      // Arrange
      const toSelect = valueFactory.getItem('selectable');
      const list = [toSelect];

      // Act
      underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), toSelect, list);

      // Assert
      expect(underTest.selectedItems).toContain(toSelect);
      expect(toSelect.isSelected).toBeTrue();
    });

    it('should not multi-select when holding ctrl', () => {
      // Arrange
      const toSelectFirst = valueFactory.getItem('selectable');
      const toSelectSecond = valueFactory.getItem('selectable');
      const list = [toSelectFirst, toSelectSecond];

      underTest.onItemClicked(new MouseEvent('click'), toSelectFirst, list);

      expect(underTest.selectedItems[0]).toEqual(toSelectFirst);

      // Act
      underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), toSelectSecond, list);

      //Assert
      expect(underTest.selectedItems[0]).toBe(toSelectSecond);
      expect(toSelectFirst.isSelected).toBeFalse();
    });

    it('should select the current item when also holding shift', () => {
      // Arrange
      const toSelect = valueFactory.getItem('selectable');
      const list = [toSelect];

      // Act
      underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

      // Assert
      expect(underTest.selectedItems).toContain(toSelect);
      expect(toSelect.isSelected).toBeTrue();
    });

    it('should not multi-select when holding shift', () => {
      // Arrange
      const toSelectFirst = valueFactory.getItem('selectable');
      const toSelectSecond = valueFactory.getItem('selectable');
      const list = [toSelectFirst, toSelectSecond];

      underTest.onItemClicked(new MouseEvent('click'), toSelectFirst, list);

      expect(underTest.selectedItems[0]).toEqual(toSelectFirst);

      // Act
      underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelectSecond, list);

      //Assert
      expect(underTest.selectedItems[0]).toBe(toSelectSecond);
      expect(toSelectFirst.isSelected).toBeFalse();
    });

    it('should clear all other selected items when selecting the new item', () => {
      // Arrange
      const toSelectFirst = valueFactory.getItem('selectable');
      const toSelectSecond = valueFactory.getItem('selectable');
      const list = [toSelectFirst, toSelectSecond];

      underTest.onItemClicked(new MouseEvent('click'), toSelectFirst, list);

      expect(underTest.selectedItems[0]).toEqual(toSelectFirst);

      // Act
      underTest.onItemClicked(new MouseEvent('click'), toSelectSecond, list);

      //Assert
      expect(underTest.selectedItems[0]).toBe(toSelectSecond);
      expect(toSelectFirst.isSelected).toBeFalse();
    });

    it('should not select a new item that is not selectable', () => {
      // Arrange
      const cannotSelect = valueFactory.getItem('notSelectable');
      const list = [cannotSelect];

      // Act
      underTest.onItemClicked(new MouseEvent('click'), cannotSelect, list);

      //Assert
      expect(underTest.selectedItems.length).toBe(0);
      expect(cannotSelect.isSelected).toBeFalse();
    });

    it('should not de-select an item that was already selected when a not selectable item is clicked', () => {
      // Arrange
      const cannotSelect = valueFactory.getItem('notSelectable');
      const toSelect = valueFactory.getItem('selectable');
      const list = [cannotSelect, toSelect];

      underTest.onItemClicked(new MouseEvent('click'), toSelect, list);
      expect(toSelect.isSelected).toBeTrue();
      // Act
      underTest.onItemClicked(new MouseEvent('click'), cannotSelect, list);

      //Assert
      expect(underTest.selectedItems.length).toBe(0);
      expect(toSelect.isSelected).toBeFalse();
    });
  });

  describe('onItemClicked multi-select', () => {
    beforeEach(() => {
      underTest.multiSelectable = true;
    });

    describe('with just mouse click', () => {
      it('should select a single item with a mouse click', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [toSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(toSelect.isSelected).toBeTrue();
      });

      it('should de-select other selected items and select the new passed in item', () => {
        // Arrange
        const toSelectFirst = valueFactory.getItem('selectable');
        const toSelectSecond = valueFactory.getItem('selectable');
        const list = [toSelectFirst, toSelectSecond];

        underTest.onItemClicked(new MouseEvent('click'), toSelectFirst, list);

        expect(underTest.selectedItems[0]).toEqual(toSelectFirst);

        // Act
        underTest.onItemClicked(new MouseEvent('click'), toSelectSecond, list);

        //Assert
        expect(underTest.selectedItems[0]).toEqual(toSelectSecond);
        expect(toSelectFirst.isSelected).toBeFalse();
      });

      it('should not select a new item that is not selectable', () => {
        // Arrange
        const cannotSelect = valueFactory.getItem('notSelectable');
        const list = [cannotSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), cannotSelect, list);

        //Assert
        expect(underTest.selectedItems.length).toBe(0);
        expect(cannotSelect.isSelected).toBeFalse();
      });
    });

    describe('with mouse click + ctlr key', () => {
      it('should select the passed in item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [toSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(toSelect.isSelected).toBeTrue();
      });

      it('should append the new item that was clicked into the list of selected items', () => {
        // Arrange
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[1], list);

        // Assert
        expect(underTest.selectedItems.length).toBe(2);
        expect(list[0].isSelected).toBeTrue();
        expect(list[1].isSelected).toBeTrue();
        expect(list[2].isSelected).toBeFalse();
      });

      it('should de-select the same item if its clicked on twice', () => {
        // Arrange
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);
        expect(list[0].isSelected).toBeTrue();
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);

        // Assert
        expect(underTest.selectedItems.length).toBe(0);
        expect(list[0].isSelected).toBeFalse();
      });

      it('should de-select an item that was already selected', () => {
        // Arrange
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[1], list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);

        // Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(list[0].isSelected).toBeFalse();
        expect(list[1].isSelected).toBeTrue();
      });

      it('should not select a new item that is not selectable', () => {
        // Arrange
        const cannotSelect = valueFactory.getItem('notSelectable');
        const list = [cannotSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), cannotSelect, list);

        //Assert
        expect(underTest.selectedItems.length).toBe(0);
        expect(cannotSelect.isSelected).toBeFalse();
      });

      it('should not remove other selected items when clicking on a non-selecatable item', () => {
        // Arrange
        const cannotSelect = valueFactory.getItem('notSelectable');
        const list = [valueFactory.getItem('selectable'), cannotSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), list[0], list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true }), cannotSelect, list);

        //Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(list[0].isSelected).toBeTrue();
      });
    });

    describe('with mouse click + shift key', () => {
      it('should select the passed in item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [toSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(toSelect.isSelected).toBeTrue();
      });

      it('should select all the items from the start of the list to the passed item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          toSelect,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(5);
        list.forEach((item: ILfSelectable) => {
          expect(item.isSelected).toBeTrue();
        });
      });

      it('should select all items from the last clicked item to the passed in item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const firstClickItem = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          firstClickItem,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          toSelect,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), firstClickItem, list);
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(4);
        list.forEach((item: ILfSelectable, index: number) => {
          if (index <= 1) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should select all items from the last clicked item to the passed in item (second item is earlier in the list)', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const firstClickItem = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          toSelect,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          firstClickItem,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), firstClickItem, list);
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(4);
        list.forEach((item: ILfSelectable, index: number) => {
          if (index <= 1) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should only select the two items above the initial selected item after shift clicking an item below', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const pivotItem = valueFactory.getItem('selectable');
        const firstShiftClickItem = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          toSelect,
          valueFactory.getItem('selectable'),
          pivotItem,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          firstShiftClickItem,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), pivotItem, list);
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), firstShiftClickItem, list);
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(3);
        list.forEach((item: ILfSelectable, index: number) => {
          if ([1, 2, 3].indexOf(index) === -1) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should not select a new item that is not selectable', () => {
        // Arrange
        const cannotSelect = valueFactory.getItem('notSelectable');
        const list = [cannotSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), cannotSelect, list);

        //Assert
        expect(underTest.selectedItems.length).toBe(0);
        expect(cannotSelect.isSelected).toBeFalse();
      });

      it('should not select a any items that are not selectable', () => {
        // Arrange

        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('notSelectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), list[2], list);

        //Assert
        expect(underTest.selectedItems.length).toBe(2);
        list.forEach((item: ILfSelectable) => {
          if (!item.isSelectable) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should not select a any items that are not selectable (inital selected is after the selected)', () => {
        // Arrange

        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('notSelectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), list[2], list);
        underTest.onItemClicked(new MouseEvent('click', { shiftKey: true }), list[0], list);

        //Assert
        expect(underTest.selectedItems.length).toBe(2);
        list.forEach((item: ILfSelectable) => {
          if (!item.isSelectable) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });
    });

    describe('with mouse click + ctrl and shift keys', () => {
      it('should select the passed in item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [toSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(1);
        expect(toSelect.isSelected).toBeTrue();
      });

      it('should select all the items from the start of the list to the passed item', () => {
        // Arrange
        const toSelect = valueFactory.getItem('selectable');
        const list = [valueFactory.getItem('selectable'), valueFactory.getItem('selectable'), toSelect];

        // Act
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(3);
        list.forEach((item: ILfSelectable) => {
          expect(item.isSelected).toBeTrue();
        });
      });

      it('should select all items from the last clicked item to the passed in item', () => {
        // Arrange
        const firstClickedItem = valueFactory.getItem('selectable');
        const toSelect = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          firstClickedItem,
          valueFactory.getItem('selectable'),
          toSelect,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), firstClickedItem, list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(3);
        list.forEach((item: ILfSelectable, index: number) => {
          if (index === 0) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should add the new selected items to the list without removing any when other items are already selected', () => {
        // Arrange
        const firstClickedItem = valueFactory.getItem('selectable');
        const secondClickedItem = valueFactory.getItem('selectable');
        const thirdClickedItem = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          thirdClickedItem,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
          firstClickedItem,
          valueFactory.getItem('selectable'),
          secondClickedItem,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('selectable'),
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), firstClickedItem, list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), secondClickedItem, list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), thirdClickedItem, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(6);
        list.forEach((item: ILfSelectable, index: number) => {
          if (index <= 2 || index > 8) {
            expect(item.isSelected).toBeFalse();
          } else {
            expect(item.isSelected).toBeTrue();
          }
        });
      });

      it('should not select a new item that is not selectable', () => {
        // Arrange
        const firstClickedItem = valueFactory.getItem('selectable');
        const toSelect = valueFactory.getItem('selectable');
        const list = [
          valueFactory.getItem('selectable'),
          firstClickedItem,
          valueFactory.getItem('selectable'),
          valueFactory.getItem('notSelectable'),
          valueFactory.getItem('notSelectable'),
          toSelect,
        ];

        // Act
        underTest.onItemClicked(new MouseEvent('click'), firstClickedItem, list);
        underTest.onItemClicked(new MouseEvent('click', { ctrlKey: true, shiftKey: true }), toSelect, list);

        // Assert
        expect(underTest.selectedItems.length).toBe(3);
        list.forEach((item: ILfSelectable, index: number) => {
          if (index === 0) {
            expect(item.isSelected).toBeFalse();
          } else {
            if (item.isSelectable) {
              expect(item.isSelected).toBeTrue();
            } else {
              expect(item.isSelected).toBeFalse();
            }
          }
        });
      });
    });
  });
});
