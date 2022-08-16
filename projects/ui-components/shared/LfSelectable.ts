import { CoreUtils } from '@laserfiche/lf-js-utils';

export interface ItemWithId {
  id: string;
}

export interface ILfSelectable {
  value: ItemWithId;
  isSelectable: boolean;
  isSelected: boolean;
}

export class Selectable {
  multiSelectable: boolean = false;
  get selectedItems(): ILfSelectable[] {
    return this._selectedItems;
  }
  callback?: () => Promise<ILfSelectable[] | undefined>;

  private _selectedItems: ILfSelectable[] = [];
  private lastSelectedIndex: number = 0;
  private selectedItemsIndices: number[] = [];

  clearSelectedValues(list: ILfSelectable[]) {
    this.clearAllSelectedItems(list);
  }

  async setSelectedValuesAsync(selected: ILfSelectable[], list: ILfSelectable[], lastCheckedIdx: number = 0) {
    // TODO should it clear all the other items or just add?
    for (let index = 0; index < list.length; index++) {
      const selectableItem = list[index];
      let selectedLength = selected.length;
      for (let i = 0; i < selectedLength; i++) {
        const toSelect = selected[i];
        if (selectableItem.value.id === toSelect.value.id) {
          if (selectableItem.isSelectable) {
            const findValue = this._selectedItems.find((value) => value.value.id === toSelect.value.id);
            if (!findValue) {
              this.selectedItemsIndices.push(index + lastCheckedIdx);
              this._selectedItems.push(toSelect);
            }
            selectableItem.isSelected = true;
            selected.splice(i, 1);
            --selectedLength;
          }
        }
      }
    }
    lastCheckedIdx += list.length;
    if (selected.length > 0) {
      if (this.callback) {
        const value = await this.callback();
        if (value == null || value.length === 0) {
          return;
        }
        await this.setSelectedValuesAsync(selected, value, lastCheckedIdx);
      }
    } else {
      return;
    }
  }

  onItemClicked(
    event: MouseEvent | KeyboardEvent,
    item: ILfSelectable,
    list: ILfSelectable[],
    allowMultiple: boolean = false,
    onlyAdd: boolean = false
  ) {
    if (!item.isSelectable) { return; }
    const itemIndex = list.findIndex((selectable) => selectable.value.id === item.value.id);
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
      // TODO this isn't consistent, we don't know if the default action has taken place
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
      if (!onlyAdd) { 
        this.clearAllSelectedItems(list);
      }
      
      for (let i = lower; i <= upper; i++) {
        const value = list[i];
        if (value.isSelectable) {
          this.addSelectedItem(value, i);
        }
      }
    } else if (!allowMultiple) {
      this.clearAllSelectedItems(list);
      const itemInList = list[itemIndex];
      if (itemInList.isSelectable) {
        this.addSelectedItem(itemInList, itemIndex);
        this.lastSelectedIndex = itemIndex;
      }
    }
  }

  private unselectItem(item: ILfSelectable, itemInList: ILfSelectable) {
    const index = this._selectedItems.findIndex((selectable) => selectable.value.id === item.value.id);
    this._selectedItems.splice(index, 1);
    const indexIndex = this.selectedItemsIndices.findIndex((selectable) => selectable.toString() === item.value.id);
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
    if (!itemInList.isSelectable) { return; }
    itemInList.isSelected = true;
    this._selectedItems.push(itemInList);
    this.selectedItemsIndices.push(itemIndex);
  }
}
