// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { LfChecklistModule } from './../../../../ui-components/lf-checklist/lf-checklist.module';

import { LfChecklistDocumentationComponent } from './lf-checklist-documentation.component';

describe('LfChecklistDocumentationComponent', () => {
  let component: LfChecklistDocumentationComponent;
  let fixture: ComponentFixture<LfChecklistDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfChecklistDocumentationComponent ],
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        RouterTestingModule,
        LfChecklistModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfChecklistDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
