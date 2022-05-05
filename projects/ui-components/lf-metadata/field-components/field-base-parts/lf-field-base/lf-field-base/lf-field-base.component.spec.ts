import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { LfTokenService } from '../../lf-token-picker/lf-token.service';
import { LfFieldBaseComponent } from './lf-field-base.component';

describe('LfFieldBaseComponent', () => {
  let component: LfFieldBaseComponent;
  let fixture: ComponentFixture<LfFieldBaseComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LfFieldBaseComponent],
      providers: [LfTokenService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
