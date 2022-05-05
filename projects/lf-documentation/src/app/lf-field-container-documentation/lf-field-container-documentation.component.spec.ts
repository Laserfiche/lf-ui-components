import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldContainerDocumentationComponent } from './lf-field-container-documentation.component';

describe('LfFieldContainerDocumentationComponent', () => {
  let component: LfFieldContainerDocumentationComponent;
  let fixture: ComponentFixture<LfFieldContainerDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfFieldContainerDocumentationComponent,
       ],
       schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldContainerDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
