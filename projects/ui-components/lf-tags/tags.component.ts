// Copyright Laserfiche.

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { map, Observable, of, startWith, Subscription } from 'rxjs';
import { ILfTagsService, LfTagDefinition } from './ILfTagsService';

@Component({
  selector: 'lf-tags-component',
  templateUrl: './tags.component.html',
  styleUrl: './tags.component.css',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
})
export class LfTagsComponent implements OnDestroy, AfterViewInit {
  private localizationService = inject(AppLocalizationService);

  @Input() initialTags: string[] = [];
  @Input() tagsService: ILfTagsService | undefined;
  @Output() selectedTagsChanged = new EventEmitter<string[]>();

  TAGS = this.localizationService.getResourceStringComponents('TAGS');
  ADD_TAGS = this.localizationService.getResourceStringComponents('ADD_TAGS');
  ADD_MORE_TAGS = this.localizationService.getResourceStringComponents('ADD_MORE_TAGS');
  NO_TAGS_AVAILABLE = this.localizationService.getResourceStringComponents('NO_TAGS_AVAILABLE');

  private componentSub: Subscription = new Subscription();
  private openPanelTimeout: ReturnType<typeof setTimeout> | undefined;
  tagDefinitions: LfTagDefinition[] = [];
  selectedTags: LfTagDefinition[] = [];
  filteredTags$: Observable<LfTagDefinition[]> = of([]);

  tagCtrl = new FormControl();
  @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('chip', { read: ElementRef }) chips!: QueryList<ElementRef>;

  private ref = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    if (this.tagsService) {
      const tagsSub = this.tagsService.getTagDefinitionsSub().subscribe((tagDefinitions) => {
        this.tagDefinitions = tagDefinitions ?? [];

        if (this.initialTags.length > 0) {
          const initialTagNames = new Set(this.initialTags);
          const toSelect = this.tagDefinitions.filter((t) => t.displayName && initialTagNames.has(t.displayName));
          this.selectedTags = toSelect;
          this.tagDefinitions = this.tagDefinitions.filter((t) => !initialTagNames.has(t.displayName!));
          this.tagsService!.updateTagDefinitions(this.selectedTags);
          this.initialTags = [];
        }

        this.refreshFilteredTags();
      });

      this.componentSub.add(tagsSub);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.openPanelTimeout);
    this.autoCompleteTrigger?.closePanel();
    this.componentSub.unsubscribe();
  }

  filterTags(value: string) {
    const filterValue = value.toLowerCase();
    return this.tagDefinitions.filter((tag) => tag.displayName?.toLowerCase().includes(filterValue));
  }

  refreshFilteredTags() {
    this.filteredTags$ = this.tagCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterTags(value))
    );
    this.ref.markForCheck();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // update the selected tags list with the new element
    this.selectedTags.push(event.option.value);
    // remove selected tag from the list
    this.tagDefinitions = this.tagDefinitions.filter((tag) => tag.id !== event.option.value.id);
    this.tagsService?.updateTagDefinitions(this.tagDefinitions);
    this.emitSelectedTagNames();

    this.openPanelTimeout = setTimeout(() => {
      this.openPanel();
    });

    this.refreshFilteredTags();
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue('');
    this.ref.markForCheck();
  }

  remove(tag: LfTagDefinition): void {
    const index = this.selectedTags.indexOf(tag);

    if (index >= 0) {
      this.selectedTags.splice(index, 1);
    }
    this.tagDefinitions.push(tag);
    this.tagsService?.updateTagDefinitions(this.tagDefinitions);
    this.emitSelectedTagNames();

    this.focusInput();
    this.refreshFilteredTags();
  }

  focusInput() {
    this.tagInput.nativeElement.focus();
    this.openPanel();
  }

  onChipKeyDown(event: KeyboardEvent, index: number) {
    const chipsArray = this.chips.toArray();

    if (event.key === 'ArrowLeft') {
      const prev = index > 0 ? index - 1 : 0;
      chipsArray[prev].nativeElement.focus();
    } else if (event.key === 'ArrowRight') {
      const next = index < chipsArray.length - 1 ? index + 1 : 0;
      chipsArray[next].nativeElement.focus();
    }
    event.preventDefault();
  }

  openPanel() {
    this.autoCompleteTrigger?.openPanel();
  }

  private emitSelectedTagNames(): void {
    const tagNames = this.selectedTags.map((t) => t.displayName!);
    this.selectedTagsChanged.emit(tagNames);
  }
}
