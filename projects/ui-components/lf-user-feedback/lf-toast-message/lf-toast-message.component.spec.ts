import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfToastMessageComponent } from './lf-toast-message.component';

describe('LfToastMessageComponent', () => {
  let component: LfToastMessageComponent;
  let fixture: ComponentFixture<LfToastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfToastMessageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LfToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
