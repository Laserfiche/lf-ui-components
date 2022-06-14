import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleUsageInHtmlComponent } from './example-usage-in-html.component';

describe('ExampleUsageInHtmlComponent', () => {
  let component: ExampleUsageInHtmlComponent;
  let fixture: ComponentFixture<ExampleUsageInHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExampleUsageInHtmlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageInHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
