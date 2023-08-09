import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfUserFeedbackComponent } from './lf-user-feedback.component';

describe('LfUserFeedbackComponent', () => {
  let component: LfUserFeedbackComponent;
  let fixture: ComponentFixture<LfUserFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfUserFeedbackComponent ],
      imports: [MatCheckboxModule, MatDialogModule, BrowserAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfUserFeedbackComponent);
    component = fixture.componentInstance;
    component.hosting_module = 'test';
    component.user_id = 'test';
    component.account_id = 'test';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
