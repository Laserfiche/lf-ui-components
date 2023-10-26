// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfBreadcrumbsDocumentationComponent } from './lf-breadcrumbs-documentation.component';

describe('LfBreadcrumbsDocumentationComponent', () => {
  let component: LfBreadcrumbsDocumentationComponent;
  let fixture: ComponentFixture<LfBreadcrumbsDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfBreadcrumbsDocumentationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfBreadcrumbsDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
