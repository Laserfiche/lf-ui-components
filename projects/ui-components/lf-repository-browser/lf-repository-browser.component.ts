import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatList, MatListOption, MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import { CoreUtils } from '@laserfiche/lf-js-utils';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';

import { RepositoryBrowserDirective } from './repository-browser.directive';
import { Entry, LfRepositoryProviders } from './ILFRepositoryService';

@Component({
  selector: 'lf-repository-browser',
  templateUrl: './lf-repository-browser.component.html',
  styleUrls: ['./lf-repository-browser.component.css']
})
export class LfRepositoryBrowserComponent extends RepositoryBrowserDirective {
  @ViewChild(MatSelectionList) entryList: MatSelectionList | undefined;
  @Input() multiple: boolean = false;

  @Output() entrySelected = new EventEmitter<Entry[] | undefined>();

  /** @internal */
  _focused_node: Entry | undefined;

  /** @internal */
  constructor(
    /** @internal */
    public ref: ChangeDetectorRef,
    /** @internal */
    public popupDialog: MatDialog,
    /** @internal */
    public zone: NgZone,
    /** @internal */
    public localizationService: AppLocalizationService) {
    super(ref, popupDialog, zone, localizationService);
  }

  /**
   * function to initialize the lf-file-explorer component
   * @param provider LfRepositoryService service
   * @param selectedNode the id of the node to select, or a Entry[] starting from the selected node to the root node
   */
  @Input() initAsync = async (providers: LfRepositoryProviders, selectedNode?: string | Entry[]): Promise<void> => {
    await this.zone.run(async () => {
      try {
        this.dataService = CoreUtils.validateDefined(providers.dataService, 'dataService');
      } catch(error) {
        console.error(error);
        return;
      }
      await this.initializeAsync(selectedNode);
    });
  };

  @Input() openSelectedNodeAsync = async () => {
    await this.zone.run(async () => {
      await this.openChildFolderAsync(this.focused_node);
    });
  };

  /** @internal */
  async onPressEnterAsync() {
    await this.openChildFolderAsync(this._focused_node);
  }

  /** @internal */
  onSelectionChange(allSelectedOptions: MatListOption[] | undefined, changes: MatSelectionListChange): void {
    const changedOptions: MatListOption[] = changes.options;
    this._focused_node = changedOptions?.length === 1 ? changedOptions[0].value : undefined;
    const selectedNodes: Entry[] | undefined = allSelectedOptions?.map(selection => selection.value);
    const selectableSelectedNodes: Entry[] | undefined = selectedNodes?.filter(selection => selection.isSelectable);
    this.ref.detectChanges();
    this.entrySelected.emit(selectableSelectedNodes);
  }

  /** @internal */
  resetSelection(): void {
    this._focused_node = undefined;
    this.entryList?.deselectAll();
    this.entrySelected.emit(this.entryList?.selectedOptions.selected
      .map((listOption: MatListOption) => listOption.value));
  }

  @Input() get focused_node(): Entry | undefined {
    return this._focused_node;
  };
}
