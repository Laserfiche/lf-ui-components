// ToDo: This is a placeholder 
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDateTimeComponent } from './uni-date-time.component';

describe('UniDatetimeComponent', () => {
  let component: UniDateTimeComponent;
  let fixture: ComponentFixture<UniDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UniDateTimeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
