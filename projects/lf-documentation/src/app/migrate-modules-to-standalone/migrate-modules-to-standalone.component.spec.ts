// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MigrateModulesToStandaloneComponent } from './migrate-modules-to-standalone.component';

describe('MigrateModulesToStandaloneComponent', () => {
  let component: MigrateModulesToStandaloneComponent;
  let fixture: ComponentFixture<MigrateModulesToStandaloneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MigrateModulesToStandaloneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MigrateModulesToStandaloneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
