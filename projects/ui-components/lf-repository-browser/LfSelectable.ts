export interface ILfSelectable {
  id: string;
  isSelectable: boolean;
  isSelected: boolean;
}

export class Selectable {
  multiSelectable: boolean = false;
  get selectedItems(): ILfSelectable[] {
    // how do we get the selectedItems if we don't know the list??

    return [];
  }
  private _selectedItems: ILfSelectable[] = [];
  callback?: () => Promise<any[]>;
  private lastSelectedIndex: number = 0;
  private selectedItemsIndices: number[] = [];
  setSelectedValues(selected: ILfSelectable[], list: ILfSelectable[], lastCheckedIdx: number = 0) {
    // Look through the list for the selected items
    list.forEach((value, index) => {
      for (let i = 0; i < selected.length; i++) {
        const toSelect = selected[i];
        if (value.id === toSelect.id) {
          this.selectedItemsIndices.push(index + lastCheckedIdx);
          value.isSelected = true;
          // remove an item from selected list
        }
      }
    });
    lastCheckedIdx = list.length - 1;
    // If not all items are found then call the callback to let provider know it needs more data
    if (selected.length > 0) {
      if (this.callback) {
        this.callback().then((value: any[]) => {
          if (value == null || value.length === 0) {
            return;
          }
          this.setSelectedValues(selected, list, lastCheckedIdx);
        });
      } else {
        // how do we get more data?
      }
    }
  }
  onItemClicked(event: MouseEvent, item: ILfSelectable, list: ILfSelectable[], allowMultiple: boolean = false) {
    const itemIndex = list.findIndex((val) => val.id === item.id);
    if (!this.multiSelectable) {
      const itemInList = list[itemIndex];
      itemInList.isSelected = true;
      this.selectedItemsIndices.forEach((val) => {
        list[val].isSelected = false;
      });
      this.selectedItemsIndices = [];
      this._selectedItems = [];
      this._selectedItems.push(item);
      this.selectedItemsIndices.push(itemIndex);

      this.lastSelectedIndex = itemIndex;
      return;
    }
    if (event.ctrlKey || (!event.ctrlKey && !event.shiftKey && allowMultiple)) {
      this._selectedItems.push(item);
      this.selectedItemsIndices.push(itemIndex);
      const itemInList = list[itemIndex];
      itemInList.isSelected = true;
      this.lastSelectedIndex = itemIndex;
    } else if (event.shiftKey) {
      const lower = this.lastSelectedIndex <= itemIndex ? this.lastSelectedIndex : itemIndex;
      const upper = this.lastSelectedIndex > itemIndex ? this.lastSelectedIndex : itemIndex;
      this.selectedItemsIndices.forEach((vale) => {
        const item = list[vale];
        item.isSelected = false;
      });
      this.selectedItemsIndices = [];
      this._selectedItems = [];
      for(let i = lower; i<=upper; i++) {
        const value = list[i];
        this.selectedItemsIndices.push(i);
        this._selectedItems.push(value);
        value.isSelected = true;
      };
      console.log(this.selectedItemsIndices, list)
    } else if (!allowMultiple) {
      const itemInList = list[itemIndex];
      itemInList.isSelected = true;
      this.selectedItemsIndices.forEach((val) => {
        list[val].isSelected = false;
      });
      this.selectedItemsIndices = [];
      this._selectedItems = [];
      this._selectedItems.push(item);
      this.selectedItemsIndices.push(itemIndex);
      this.lastSelectedIndex = itemIndex;

      return;
    }
  }
//   onItemClicked(event: MouseEvent, item: ILfSelectable, list: ILfSelectable[], add: boolean = false): ILfSelectable[] {
//     const itemIndex = list.findIndex((val) => val.id === item.id);
//     if (!this.multiSelectable) {
//       const itemInList = list[itemIndex];
//       itemInList.isSelected = true;

//       this.lastSelectedIndex = itemIndex;
//       return list;
//     }
//     if (event.ctrlKey || (!event.ctrlKey && !event.shiftKey && add)) {
//       // this.selectedItems.push(indexOfItem);
//       const itemInList = list[itemIndex];
//       itemInList.isSelected = true;
//       this.lastSelectedIndex = itemIndex;
//     } else if (event.shiftKey) {
//       const lower = this.lastSelectedIndex <= itemIndex ? this.lastSelectedIndex : itemIndex;
//       const upper = this.lastSelectedIndex > itemIndex ? this.lastSelectedIndex : itemIndex;
//       // clear all other options
//       // select options from lower to upper (inclusive)
//       for(let i = 0; i<list.length; i++) {
//         const value = list[i];
//         if(i>=lower && i<=upper) {
//             value.isSelected = true;
//         }
//         else {
//             value.isSelected = false;
//         }
//       };
//       console.log(this.selectedItemsIndices, list)
//     } else if (!add) {
//       for(const item of list) {
//         item.isSelected = false;
//       }
//       const itemInList = list[itemIndex];
//       itemInList.isSelected = true;
//       this.lastSelectedIndex = itemIndex;

//     }
//     return list;
//   }
}
