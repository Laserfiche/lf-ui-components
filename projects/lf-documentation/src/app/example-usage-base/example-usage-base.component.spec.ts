import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ExampleUsageBaseComponent } from './example-usage-base.component';

describe('ExampleUsageBaseComponent', () => {
  let component: ExampleUsageBaseComponent;
  let fixture: ComponentFixture<ExampleUsageBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ ExampleUsageBaseComponent ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
