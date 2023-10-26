// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSuggestionSelectionComponent } from './feedback-suggestion-selection.component';

describe('FeedbackSuggestionSelectionComponent', () => {
  let component: FeedbackSuggestionSelectionComponent;
  let fixture: ComponentFixture<FeedbackSuggestionSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackSuggestionSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackSuggestionSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
