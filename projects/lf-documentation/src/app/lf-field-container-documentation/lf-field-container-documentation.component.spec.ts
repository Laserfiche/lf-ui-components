// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldContainerDocumentationComponent } from './lf-field-container-documentation.component';
import { LfMetadataModule } from './../../../../ui-components/lf-metadata/lf-metadata.module';

describe('LfFieldContainerDocumentationComponent', () => {
  let component: LfFieldContainerDocumentationComponent;
  let fixture: ComponentFixture<LfFieldContainerDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfFieldContainerDocumentationComponent,
       ],
       imports: [
        LfMetadataModule,
       ],
       schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldContainerDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
