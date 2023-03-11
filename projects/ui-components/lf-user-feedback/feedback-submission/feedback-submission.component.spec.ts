import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FeedbackSubmissionComponent } from './feedback-submission.component';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'lib-feedback-image-upload',
  template: '<p>Mock Image Attach Component</p>',
})
class MockFeedbackImageUploadComponent {}

fdescribe('FeedbackSubmissionComponent', () => {
  let component: FeedbackSubmissionComponent;
  let fixture: ComponentFixture<FeedbackSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeedbackSubmissionComponent, MockFeedbackImageUploadComponent],
      imports: [MatCheckboxModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if the feedback image upload emits error, should set toastMessages',() => {

  });
});
