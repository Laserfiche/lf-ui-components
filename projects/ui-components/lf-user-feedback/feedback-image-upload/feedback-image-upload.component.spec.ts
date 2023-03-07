import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackImageUploadComponent } from './feedback-image-upload.component';

describe('FeedbackImageUploadComponent', () => {
  let component: FeedbackImageUploadComponent;
  let fixture: ComponentFixture<FeedbackImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbackImageUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbackImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
