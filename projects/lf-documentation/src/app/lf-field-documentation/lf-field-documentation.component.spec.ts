// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldDocumentationComponent } from './lf-field-documentation.component';

describe('LfFieldDocumentationComponent', () => {
  let component: LfFieldDocumentationComponent;
  let fixture: ComponentFixture<LfFieldDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LfFieldDocumentationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
