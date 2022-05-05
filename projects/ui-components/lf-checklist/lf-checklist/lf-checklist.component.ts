import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgZone,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { ItemsComponent } from '../items/items.component';
import { Checklist } from '../checklist';
import { LfChecklistService } from '../lf-checklist.service';

export interface LfChecklistProviders {
  checklistService: LfChecklistService;
}

@Component({
  selector: 'lf-checklist-component',
  templateUrl: './lf-checklist.component.html',
  styleUrls: ['./lf-checklist.component.css'],
})
export class LfChecklistComponent {

  @Input() action_button_text: string | undefined;

  @Input() cancel_button_text: string | undefined;

  @Output() checklistChanged: EventEmitter<Checklist[]> = new EventEmitter();

  @Output() actionClick: EventEmitter<Checklist[]> = new EventEmitter();

  @Output() cancelClick: EventEmitter<Checklist[]> = new EventEmitter();

  /** @internal */
  @ViewChildren(ItemsComponent) private itemsComponents!: QueryList<ItemsComponent>;


  /** @internal */
  checklists: Checklist[] = [];

  /** @internal */
  constructor(
    /** @internal */
    private zone: NgZone
  ) { }

  @Input() initAsync = async (
    providers: LfChecklistProviders
  ): Promise<void> => {
    return new Promise((resolve) => {
      this.zone.run(() => {
        requestAnimationFrame(async () => {
          this.checklists =
            await providers.checklistService.loadChecklistsAsync();
          this.itemsComponents?.forEach((component) =>
            component.refreshChecklistItems()
          );
          this.checklistChanged.emit(this.checklists);
          resolve();
        });
      });
    });
  };

  @Input() forceValidation = (): boolean => {
    let isValid = true;
    this.itemsComponents.forEach((component) => {
      if (!component.forceValidation()) {
        isValid = false;
      }
    });
    return isValid;
  };

  /** @internal */
  onActionButtonClicked(): void {
    this.actionClick.emit(this.checklists);
  }

  /** @internal */
  onCancelButtonClicked(): void {
    this.cancelClick.emit(this.checklists);
  }

  /** @internal */
  emitChecklistChanges(): void {
    this.checklistChanged.emit(this.checklists);
  }
}
