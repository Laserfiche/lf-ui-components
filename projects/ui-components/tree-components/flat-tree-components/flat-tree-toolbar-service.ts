import { ToolbarOption, LfToolbarService } from "@laserfiche/lf-ui-components/shared";

export class FlatTreeToolBarService implements LfToolbarService {
  _toolbarOptions: ToolbarOption[] = [
    {
      name: 'refresh',
      disabled: false,
      tag: 'REFRESH',
      handler: this.refreshTreeAsync,
    },
    {
      name: 'new folder',
      disabled: false,
      tag: 'NEW_FOLDER',
      handler: this.addNewFolderAsync
    }
  ];
  getToolbarOptions() {
    return this._toolbarOptions;
  }

  async addNewFolderAsync(event: any) {
    console.log('add new folder');
  }
  async refreshTreeAsync(event: any) {
    console.log('refresh');
  }


}
