// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { getDebugNode } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { By } from '@angular/platform-browser';
import { CardComponent } from '../card/card.component';

import { TroubleshootingComponent } from './troubleshooting.component';

describe('TroubleshootingComponent', () => {
  let component: TroubleshootingComponent;
  let fixture: ComponentFixture<TroubleshootingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TroubleshootingComponent, CardComponent, MatMenuModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TroubleshootingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass the page URL as hosting_context to the feedback button in the menu', () => {
    // The menu renders its content in an overlay, outside the fixture, and only once opened.
    fixture.debugElement.query(By.directive(MatMenuTrigger)).nativeElement.click();
    fixture.detectChanges();

    const feedbackButton = getDebugNode(document.querySelector('.cdk-overlay-container lf-user-feedback'));

    expect(feedbackButton?.componentInstance.hosting_context).toBe(window.location.href);
  });
});
