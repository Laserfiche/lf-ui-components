import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from '../card/card.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfFieldAdhocContainerDocumentationComponent } from './lf-field-adhoc-container-documentation.component';
import { LfMetadataModule } from './../../../../ui-components/lf-metadata/lf-metadata.module';

describe('LfFieldAdhocContainerDocumentationComponent', () => {
  let component: LfFieldAdhocContainerDocumentationComponent;
  let fixture: ComponentFixture<LfFieldAdhocContainerDocumentationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LfFieldAdhocContainerDocumentationComponent, CardComponent],
      imports: [RouterTestingModule, LfMetadataModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldAdhocContainerDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
