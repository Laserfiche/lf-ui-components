import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleUsageInAngularComponent } from './example-usage-in-angular.component';

describe('ExampleUsageInAngularComponent', () => {
  let component: ExampleUsageInAngularComponent;
  let fixture: ComponentFixture<ExampleUsageInAngularComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleUsageInAngularComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageInAngularComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
