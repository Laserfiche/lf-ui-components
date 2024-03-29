// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

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
    return [...this.allSelected.values()];
  }

  callback?: () => Promise<ILfSelectable[] | undefined>;

  private lastSelectedIndex: number = 0;
  private selectedItemsIndices: number[] = [];

  allSelected: Map<string, ILfSelectable> = new Map<string, ILfSelectable>();

  clearSelectedValues(list: ILfSelectable[], clearCached?: boolean) {
    this.clearAllSelectedItems(list, clearCached);
  }

  async setSelectedNodesAsync(
    selected: Map<string, ILfSelectable>,
    list: ILfSelectable[],
    maxFetchIterations: number,
    lastCheckedIdx: number = 0
  ) {
    for (let index = 0; index < list.length; index++) {
      const selectableItem = list[index];
      const wantToSelect = selected.has(selectableItem.value.id) || this.allSelected.has(selectableItem.value.id);
      if (wantToSelect) {
        if (selectableItem.isSelectable) {
          const findValue = this.selectedItemsIndices.find((value) => value === index + lastCheckedIdx);
          if (!findValue) {
            this.selectedItemsIndices.push(index + lastCheckedIdx);
          }
          this.allSelected.set(selectableItem.value.id, selectableItem);
          selectableItem.isSelected = true;
          selected.delete(selectableItem.value.id);
        }
      }
    }
    lastCheckedIdx += list.length;
    if (selected.size > 0) {
      if (this.callback) {
        if (maxFetchIterations > 0) {
          --maxFetchIterations;
          const value = await this.callback();
          if (!value || value.length === 0) {
            return;
          }
          await this.setSelectedNodesAsync(selected, value, maxFetchIterations, lastCheckedIdx);
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
    const indexIndex = this.selectedItemsIndices.findIndex(
      (selectable) => list[selectable].value.id === itemInList.value.id
    );

    this.selectedItemsIndices.splice(indexIndex, 1);
    this.allSelected.delete(itemInList.value.id);
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
    if (clearAll) {
      this.allSelected.clear();
    }
  }

  /** @internal */
  private addSelectedItem(itemInList: ILfSelectable, itemIndex: number) {
    if (!itemInList.isSelectable) {
      return;
    }
    itemInList.isSelected = true;
    this.selectedItemsIndices.push(itemIndex);
    this.allSelected.set(itemInList.value.id, itemInList);
  }
}
