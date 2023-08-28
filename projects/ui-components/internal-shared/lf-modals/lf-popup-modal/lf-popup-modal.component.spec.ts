import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfPopupModalComponent } from './lf-popup-modal.component';

describe('LfPopupModalComponent', () => {
  let component: LfPopupModalComponent;
  let fixture: ComponentFixture<LfPopupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfPopupModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfPopupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
