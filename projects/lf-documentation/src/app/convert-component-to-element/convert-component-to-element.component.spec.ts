import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertComponentToElementComponent } from './convert-component-to-element.component';

describe('ConvertComponentToElementComponent', () => {
  let component: ConvertComponentToElementComponent;
  let fixture: ComponentFixture<ConvertComponentToElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvertComponentToElementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConvertComponentToElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
