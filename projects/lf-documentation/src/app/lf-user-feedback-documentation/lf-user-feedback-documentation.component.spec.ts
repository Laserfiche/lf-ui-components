import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfUserFeedbackDocumentationComponent } from './lf-user-feedback-documentation.component';

describe('LfUserFeedbackDocumentationComponent', () => {
  let component: LfUserFeedbackDocumentationComponent;
  let fixture: ComponentFixture<LfUserFeedbackDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfUserFeedbackDocumentationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfUserFeedbackDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
