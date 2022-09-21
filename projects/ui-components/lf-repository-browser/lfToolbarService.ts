import { DemoRepoService } from "projects/lf-documentation/src/app/lf-repository-browser-documentation/demo-repo-service";
import { ToolbarOption } from "../tree-components/lf-tree-components-public-api";
import { LfTreeNodeService } from "./ILfTreeNodeService";


export declare interface LfToolbarService {
  getToolbarOptions(): ToolbarOption[];
}


export class LfToolbarDemoService implements LfToolbarService {
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
