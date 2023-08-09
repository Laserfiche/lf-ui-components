import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldViewDirective } from '../lf-field-view.directive';
import { LfFieldAddRemoveComponent } from '../lf-field-adhoc-container/lf-field-add-remove/lf-field-add-remove.component';
import { LfFieldAdhocContainerComponent } from '../lf-field-adhoc-container/lf-field-adhoc-container.component';
import { LfFieldTemplateContainerComponent } from '../lf-field-template-container/lf-field-template-container.component';
import { LfFieldContainerComponent } from './lf-field-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { LfModalsModule } from '@laserfiche/lf-ui-components/internal-shared';
import { LfFieldContainerDemoService } from 'projects/lf-documentation/src/app/lf-field-container-documentation/lf-field-container-demo.service';
import { LfMetadataModule } from '../lf-metadata.module';

describe('LfFieldContainerComponent', () => {
  let component: LfFieldContainerComponent;
  let fixture: ComponentFixture<LfFieldContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfFieldContainerComponent,
        LfFieldTemplateContainerComponent,
        LfFieldAdhocContainerComponent,
        LfFieldAddRemoveComponent,
        LfFieldViewDirective
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        LfModalsModule,
        MatExpansionModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        ReactiveFormsModule,
        LfMetadataModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with template', async () => {
    const demoService = new LfFieldContainerDemoService();
    await component.initAsync(demoService, 1);
    expect(component.adhocContainer.templateFields.length).toBeGreaterThanOrEqual(1);
    expect(component.templateContainer.getTemplateValue()).toBeDefined();
  });

  it('should not include BlobField in allFieldInfos', async () => {
    const demoService = new LfFieldContainerDemoService();
    await component.initAsync(demoService, 1);
    expect(component.templateContainer.allFieldInfos.length).toEqual(5);
  });
});
