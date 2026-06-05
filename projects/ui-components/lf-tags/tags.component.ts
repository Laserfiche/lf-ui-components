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
import { Subscription } from 'rxjs';
import { LfTagsService, LfTagDefinition } from './ILfTagsService';

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
  @Input() tagsService: LfTagsService | undefined;
  @Output() selectedTagsChanged = new EventEmitter<LfTagDefinition[]>();

  TAGS = this.localizationService.getResourceStringComponents('TAGS');
  ADD_TAGS = this.localizationService.getResourceStringComponents('ADD_TAGS');
  ADD_MORE_TAGS = this.localizationService.getResourceStringComponents('ADD_MORE_TAGS');
  NO_TAGS_AVAILABLE = this.localizationService.getResourceStringComponents('NO_TAGS_AVAILABLE');

  private componentSub: Subscription = new Subscription();
  private openPanelTimeout: ReturnType<typeof setTimeout> | undefined;
  tagDefinitions: LfTagDefinition[] = [];
  selectedTagDefinitions: LfTagDefinition[] = [];
  filteredTags: LfTagDefinition[] = [];

  tagCtrl = new FormControl();
  @ViewChild(MatAutocompleteTrigger) autoCompleteTrigger!: MatAutocompleteTrigger;
  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;
  @ViewChildren('chip', { read: ElementRef }) chips!: QueryList<ElementRef>;

  private ref = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.componentSub.add(
      this.tagCtrl.valueChanges.subscribe((value) => {
        if (typeof value === 'string' || value === null || value === undefined) {
          this.filteredTags = this.filterTags(value ?? '');
        }
      })
    );

    if (this.tagsService) {
      this.tagsService.getTagDefinitions().then((tagDefinitions) => {
        this.tagDefinitions = tagDefinitions ?? [];

        if (this.initialTags.length > 0) {
          const initialTagNames = new Set(this.initialTags);
          const toSelect = this.tagDefinitions.filter((t) => t.displayName && initialTagNames.has(t.displayName));
          setTimeout(() => {
            this.selectedTagDefinitions = toSelect;
            this.emitSelectedTagDefinitions();
            this.refreshFilteredTags();
          });
          this.initialTags = [];
        } else {
          setTimeout(() => this.refreshFilteredTags());
        }
      });
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.openPanelTimeout);
    this.autoCompleteTrigger?.closePanel();
    this.componentSub.unsubscribe();
  }

  filterTags(value: string) {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    const selectedTagDisplayNames = new Set(this.selectedTagDefinitions.map((tag) => tag.displayName));
    return this.tagDefinitions.filter(
      (tag) => tag.displayName?.toLowerCase().includes(filterValue) && !selectedTagDisplayNames.has(tag.displayName)
    );
  }

  refreshFilteredTags() {
    this.filteredTags = this.filterTags(this.tagCtrl.value ?? '');
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTagDefinitions.push(event.option.value);
    this.emitSelectedTagDefinitions();

    this.refreshFilteredTags();
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue('');
    this.ref.detectChanges();

    this.openPanelTimeout = setTimeout(() => {
      this.openPanel();
    });
  }

  remove(tagDefinition: LfTagDefinition): void {
    const index = this.selectedTagDefinitions.indexOf(tagDefinition);

    if (index >= 0) {
      this.selectedTagDefinitions.splice(index, 1);
      this.emitSelectedTagDefinitions();
    }

    this.refreshFilteredTags();
    this.ref.detectChanges();
    this.focusInput();
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

  private emitSelectedTagDefinitions(): void {
    this.selectedTagsChanged.emit([...this.selectedTagDefinitions]);
  }
}
