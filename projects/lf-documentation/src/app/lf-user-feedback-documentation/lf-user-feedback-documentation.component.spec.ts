// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LfUserFeedbackComponent } from 'projects/ui-components/projects';
import { LfUserFeedbackDocumentationComponent } from './lf-user-feedback-documentation.component';

describe('LfUserFeedbackDocumentationComponent', () => {
  let component: LfUserFeedbackDocumentationComponent;
  let fixture: ComponentFixture<LfUserFeedbackDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LfUserFeedbackDocumentationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfUserFeedbackDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the page URL as hosting_context to every feedback button', () => {
    const feedbackButtons = fixture.debugElement.queryAll(By.directive(LfUserFeedbackComponent));

    expect(feedbackButtons.length).toBe(2);
    for (const feedbackButton of feedbackButtons) {
      expect(feedbackButton.componentInstance.hosting_context).toBe(window.location.href);
    }
  });
});
