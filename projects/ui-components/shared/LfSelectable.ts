/**
 * @internal
 */
export interface ItemWithId {
  id: string;
  attributes?: Map<string, PropertyValue>;
}

export interface PropertyValue {
  value?: string | Date | number;
  displayValue?: string;
}

/**
 * @internal
 */
export interface ILfSelectable {
  value: ItemWithId;
  isSelectable: boolean;
  isSelected: boolean;
}

/**
 * @internal
 */
export class Selectable {
  multiSelectable: boolean = false;
  get selectedItems(): ILfSelectable[] {
    return this._selectedItems;
  }
  callback?: () => Promise<ILfSelectable[] | undefined>;

  private _selectedItems: ILfSelectable[] = [];
  private lastSelectedIndex: number = 0;
  private selectedItemsIndices: number[] = [];

  toSelect: Set<string> = new Set<string>();

  clearSelectedValues(list: ILfSelectable[], clearCached?: boolean) {
    this.clearAllSelectedItems(list, clearCached);
  }

  async setSelectedNodesAsync(
    selected: Set<string>,
    list: ILfSelectable[],
    maxFetchIterations: number,
    lastCheckedIdx: number = 0
  ) {
    const allToSelect = selected;
    this.toSelect?.forEach(v => allToSelect.add(v));
    for (let index = 0; index < list.length; index++) {
      const selectableItem = list[index];
      const wantToSelect = allToSelect.has(selectableItem.value.id);
      if (wantToSelect) {
        if (selectableItem.isSelectable) {
          const findValue = this._selectedItems.find((value) => value.value.id === selectableItem.value.id);
          if (!findValue) {
            this.selectedItemsIndices.push(index + lastCheckedIdx);
            this._selectedItems.push(selectableItem);
          }
          selectableItem.isSelected = true;
          allToSelect.delete(selectableItem.value.id);
        }
      }
    }
    lastCheckedIdx += list.length;
    if (allToSelect.size > 0) {
      if (this.callback) {
        if (maxFetchIterations > 0) {
          --maxFetchIterations;
          const value = await this.callback();
          if (!value || value.length === 0) {
            return;
          }
          await this.setSelectedNodesAsync(allToSelect, value, maxFetchIterations, lastCheckedIdx);
        } else {
          console.debug('MaxFetchIterations reached. Not all nodes selected');
        }
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
    if (!item.isSelectable) {
      if (event.ctrlKey || event.shiftKey) {
        return;
      }
      this.clearAllSelectedItems(list);
      this.lastSelectedIndex = 0;
      return;
    }
    const itemIndex = list.findIndex((selectable) => selectable.value.id === item.value.id);
    if (!this.multiSelectable) {
      // clear all selectedItems doesn't work if list has been reordered
      this.clearAllSelectedItems(list);
      const itemInList = list[itemIndex];
      if (itemInList.isSelectable) {
        this.addSelectedItem(item, itemIndex);
        this.lastSelectedIndex = itemIndex;
      }
      return;
    }
    if (event?.ctrlKey && event?.shiftKey) {
      onlyAdd = true;
    }
    if ((event?.ctrlKey && !event.shiftKey) || (!event?.ctrlKey && !event?.shiftKey && allowMultiple)) {
      const itemInList = list[itemIndex];
      if (itemInList.isSelected) {
        this.unselectItem(list, itemInList);
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
        if (value.isSelectable && !value.isSelected) {
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

  /** @internal */
  private unselectItem(list: ILfSelectable[], itemInList: ILfSelectable) {
    const index = this._selectedItems.findIndex((selectable) => selectable.value.id === itemInList.value.id);
    this._selectedItems.splice(index, 1);
    const indexIndex = this.selectedItemsIndices.findIndex(
      (selectable) => list[selectable].value.id === itemInList.value.id
    );

    this.selectedItemsIndices.splice(indexIndex, 1);
    this.toSelect?.delete(itemInList.value.id);
    itemInList.isSelected = false;
  }

  /** @internal */
  private clearAllSelectedItems(list: ILfSelectable[], clearAll: boolean = true) {
    this.selectedItemsIndices.forEach((val) => {
      if (list[val]) {
        list[val].isSelected = false;
      }
    });
    this.selectedItemsIndices = [];
    this._selectedItems = [];
    if (clearAll) {
      this.toSelect?.clear();
    }
  }

  /** @internal */
  private addSelectedItem(itemInList: ILfSelectable, itemIndex: number) {
    if (!itemInList.isSelectable) {
      return;
    }
    itemInList.isSelected = true;
    this._selectedItems.push(itemInList);
    this.selectedItemsIndices.push(itemIndex);
    this.toSelect?.delete(itemInList.value.id);
  }
}
