import { Injectable } from '@angular/core';
import { AdhocFieldInfo } from './lf-field-adhoc-container-types';

/** @internal */
@Injectable({
  providedIn: 'root'
})
export class AdhocFieldConnectorService {

  private selectedFieldIds = new Set<number>();
  private allFieldInfos: AdhocFieldInfo[] = [];
  constructor() { }

  setSelectedFieldIds(selectedFields: Set<number>) {
    this.selectedFieldIds = selectedFields;
  }

  getSelectedFieldIds(): Set<number> {
    return new Set<number>(this.selectedFieldIds);
  }

  setAllFieldInfos(fieldInfos: AdhocFieldInfo[]) {
    this.allFieldInfos = fieldInfos;
  }

  getAllFieldInfos(): AdhocFieldInfo[] {
    return this.allFieldInfos;
  }
}
