// Copyright Laserfiche.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfTagsComponent } from './tags.component';
import { LfTagsService, LfTagDefinition } from './ILfTagsService';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChip } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';

describe('LfTagsComponent', () => {
  let component: LfTagsComponent;
  let fixture: ComponentFixture<LfTagsComponent>;
  let mockTagDefinitions: LfTagDefinition[];

  let tagsServiceMock: {
    getTagDefinitions: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockTagDefinitions = [
      {
        id: 1,
        name: 'Tag 1',
        displayName: 'Tag 1',
      },
      {
        id: 2,
        name: 'Tag 2',
        displayName: 'Tag 2',
      },
    ] as LfTagDefinition[];

    tagsServiceMock = {
      getTagDefinitions: vi.fn(),
    };

    tagsServiceMock.getTagDefinitions.mockResolvedValue(mockTagDefinitions);

    await TestBed.configureTestingModule({
      imports: [LfTagsComponent, MatAutocomplete, MatChip],
      providers: [
        {
          provide: AppLocalizationService,
          useValue: {
            getResourceStringComponents: (key: string) => key,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LfTagsComponent);

    component = fixture.componentInstance;
    component.tagCtrl = new FormControl();
    component.tagsService = tagsServiceMock as LfTagsService;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Close the autocomplete panel before destruction to prevent
    // ObjectUnsubscribedError from MatAutocompleteTrigger's internal
    // pipe on options.changes (uses tap operator) when the QueryList
    // Subject closes during Angular 21 zoneless teardown.
    component?.autoCompleteTrigger?.closePanel();
    fixture?.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all available tags', async () => {
    await component.ngAfterViewInit();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.tagDefinitions).toEqual(mockTagDefinitions);
  });

  it('should collect the selected tags and emit selectedTagsChanged', async () => {
    const selectedTag = { id: 3, name: 'Tag 3', displayName: 'Tag 3' } as LfTagDefinition;
    await component.ngAfterViewInit();
    await fixture.whenStable();
    fixture.detectChanges();

    component.selectedTagNames = ['Tag 1'];
    const emitSpy = vi.spyOn(component.selectedTagsChanged, 'emit');
    component.selected({ option: { value: selectedTag } } as MatAutocompleteSelectedEvent);

    expect(component.selectedTagNames.length).toBe(2);
    expect(component.selectedTagNames.pop()).toBe('Tag 3');
    expect(emitSpy).toHaveBeenCalledWith(['Tag 1', 'Tag 3']);
  });

  it('should remove the selected tag', async () => {
    component.selectedTagNames = ['Tag 1', 'Tag 2', 'Tag 3'];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.debugElement.queryAll(By.directive(MatChip));
    expect(chips).toHaveLength(3);

    const removeButton = chips[0].componentInstance as MatChip;
    removeButton.removed.emit();
    fixture.detectChanges();

    expect(component.selectedTagNames).toHaveLength(2);
  });

  it('should handle keyboard navigation among the tags', async () => {
    component.selectedTagNames = ['Tag 1', 'Tag 3'];
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    await fixture.whenStable();

    const chips = fixture.debugElement.queryAll(By.css('mat-chip-row'));
    expect(chips).toHaveLength(2);

    // trigger arrow right keyboard event
    const keyboardEventRight = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    chips[0].nativeElement.dispatchEvent(keyboardEventRight);

    expect(chips[0].nativeElement).not.toHaveClass('cdk-focused');
    expect(chips[1].nativeElement).toHaveClass('cdk-focused');

    // trigger arrow right keyboard event
    const keyboardEventLeft = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    chips[1].nativeElement.dispatchEvent(keyboardEventLeft);

    expect(chips[0].nativeElement).toHaveClass('cdk-focused');
    expect(chips[1].nativeElement).not.toHaveClass('cdk-focused');
  });
});
