import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleNpmUsageInAngularComponent } from './example-npm-usage-in-angular.component';

describe('ExampleNpmUsageInAngularComponent', () => {
  let component: ExampleNpmUsageInAngularComponent;
  let fixture: ComponentFixture<ExampleNpmUsageInAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleNpmUsageInAngularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleNpmUsageInAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
