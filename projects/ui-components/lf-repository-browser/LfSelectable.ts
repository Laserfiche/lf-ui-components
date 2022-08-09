export interface ILfSelectable {
  id: string;
  isSelectable: boolean;
  isSelected: boolean;
}

export class Selectable {
  multiSelectable: boolean = false;
  get selectedItems(): ILfSelectable[] {
    return this._selectedItems;
  }

  private _selectedItems: ILfSelectable[] = [];
  callback?: () => Promise<ILfSelectable[] | undefined>;
  private lastSelectedIndex: number = 0;
  private selectedItemsIndices: number[] = [];
  setSelectedValues(selected: ILfSelectable[], list: ILfSelectable[], lastCheckedIdx: number = 0) {
    // should it clear all the other items or just add?
    for (let index = 0; index < list.length; index++) {
      const value = list[index + lastCheckedIdx];
      for (let i = 0; i < selected.length; i++) {
        const toSelect = selected[i];
        if (value.id === toSelect.id) {
          if(value.isSelectable) {
            // TODO if it doesn't already exist?
            this.selectedItemsIndices.push(index + lastCheckedIdx);
            this._selectedItems.push(toSelect);
            value.isSelected = true;
            selected.splice(i, 1);
          }
        }
      }
    }
    lastCheckedIdx = list.length - 1;
    // If not all items are found then call the callback to let provider know it needs more data
    if (selected.length > 0) {
      if (this.callback) {
        this.callback().then((value: any[] | undefined) => {
          if (value == null || value.length === 0) {
            return;
          }
          this.setSelectedValues(selected, value, lastCheckedIdx);
        });
      } else {
        // how do we get more data?
      }
    }
  }
  onItemClicked(event: MouseEvent | KeyboardEvent, item: ILfSelectable, list: ILfSelectable[], allowMultiple: boolean = false) {
    const itemIndex = list.findIndex((val) => val.id === item.id);
    if (!this.multiSelectable) {
      this.clearAllSelectedItems(list);
      const itemInList = list[itemIndex];
      if (itemInList.isSelectable) {
        this.addSelectedItem(item, itemIndex);
        this.lastSelectedIndex = itemIndex;
      }
      return;
    }
    if (event?.ctrlKey || (!event?.ctrlKey && !event?.shiftKey && allowMultiple)) {
      const itemInList = list[itemIndex];
      if (itemInList.isSelected) {
        this.unselectItem(item, itemInList);
      } else {
        if (itemInList.isSelectable) {
          this.addSelectedItem(item, itemIndex);
          this.lastSelectedIndex = itemIndex;
        }
      }
    } else if (event.shiftKey) {
      const lower = this.lastSelectedIndex <= itemIndex ? this.lastSelectedIndex : itemIndex;
      const upper = this.lastSelectedIndex > itemIndex ? this.lastSelectedIndex : itemIndex;
      this.clearAllSelectedItems(list);
      for (let i = lower; i <= upper; i++) {
        const value = list[i];
        if (value.isSelectable) {
          this.addSelectedItem(value, i);
        }
      }
    } else if (!allowMultiple) {
      this.clearAllSelectedItems(list);
      setTimeout(() => {
        const itemInList = list[itemIndex];
        if (itemInList.isSelectable) {
          this.addSelectedItem(itemInList, itemIndex);
          this.lastSelectedIndex = itemIndex;
        }
      });
    }
  }

  private unselectItem(item: ILfSelectable, itemInList: ILfSelectable) {
    const index = this._selectedItems.findIndex((value) => value.id === item.id);
    this._selectedItems.splice(index, 1);
    const indexIndex = this.selectedItemsIndices.findIndex((value) => value.toString() === item.id);
    this.selectedItemsIndices.splice(indexIndex, 1);
    itemInList.isSelected = false;
  }

  private clearAllSelectedItems(list: ILfSelectable[]) {
    this.selectedItemsIndices.forEach((val) => {
      list[val].isSelected = false;
    });
    this.selectedItemsIndices = [];
    this._selectedItems = [];
  }

  private addSelectedItem(itemInList: ILfSelectable, itemIndex: number) {
    itemInList.isSelected = true;
    this._selectedItems.push(itemInList);
    this.selectedItemsIndices.push(itemIndex);
  }
}
