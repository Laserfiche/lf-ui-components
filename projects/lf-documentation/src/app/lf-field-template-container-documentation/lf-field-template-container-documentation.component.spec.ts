// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldTemplateContainerDocumentationComponent } from './lf-field-template-container-documentation.component';

describe('LfFieldTemplateContainerDocumentationComponent', () => {
  let component: LfFieldTemplateContainerDocumentationComponent;
  let fixture: ComponentFixture<LfFieldTemplateContainerDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LfFieldTemplateContainerDocumentationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .overrideComponent(LfFieldTemplateContainerDocumentationComponent, {
      set: { imports: [], schemas: [CUSTOM_ELEMENTS_SCHEMA] }
    })
    .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfFieldTemplateContainerDocumentationComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
