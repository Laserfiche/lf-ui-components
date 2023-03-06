import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackSubmissionComponent } from './feedback-submission.component';

describe('FeedbackSubmissionComponent', () => {
  let component: FeedbackSubmissionComponent;
  let fixture: ComponentFixture<FeedbackSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackSubmissionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
