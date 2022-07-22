import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ExampleUsageInHtmlComponent } from './example-usage-in-html.component';

describe('ExampleUsageInHtmlComponent', () => {
  let component: ExampleUsageInHtmlComponent;
  let fixture: ComponentFixture<ExampleUsageInHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ ExampleUsageInHtmlComponent ],
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
