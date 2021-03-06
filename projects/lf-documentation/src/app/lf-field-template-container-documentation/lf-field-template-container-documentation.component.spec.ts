import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldTemplateContainerDocumentationComponent } from './lf-field-template-container-documentation.component';


describe('LfFieldTemplateContainerDocumentationComponent', () => {
  let component: LfFieldTemplateContainerDocumentationComponent;
  let fixture: ComponentFixture<LfFieldTemplateContainerDocumentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LfFieldTemplateContainerDocumentationComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldTemplateContainerDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
