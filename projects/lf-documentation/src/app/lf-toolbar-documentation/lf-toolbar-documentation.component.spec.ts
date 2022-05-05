import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfToolbarDocumentationComponent } from './lf-toolbar-documentation.component';

describe('LfToolbarDocumentationComponent', () => {
  let component: LfToolbarDocumentationComponent;
  let fixture: ComponentFixture<LfToolbarDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfToolbarDocumentationComponent,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfToolbarDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
