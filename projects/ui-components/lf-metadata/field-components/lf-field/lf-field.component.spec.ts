// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldComponent } from './lf-field.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LfFieldBaseComponent } from '../field-base-parts/lf-field-base/lf-field-base/lf-field-base.component';

describe('LfFieldComponent', () => {
  let component: LfFieldComponent;
  let fixture: ComponentFixture<LfFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LfFieldComponent,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LfFieldBaseComponent
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
