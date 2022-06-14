import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleUsageInReactComponent } from './example-usage-in-react.component';

describe('ExampleUsageInReactComponent', () => {
  let component: ExampleUsageInReactComponent;
  let fixture: ComponentFixture<ExampleUsageInReactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleUsageInReactComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageInReactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
