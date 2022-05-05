import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldViewDirective } from '../lf-field-view.directive';
import { LfFieldAddRemoveComponent } from '../lf-field-adhoc-container/lf-field-add-remove/lf-field-add-remove.component';
import { LfFieldAdhocContainerComponent } from '../lf-field-adhoc-container/lf-field-adhoc-container.component';
import { LfFieldTemplateContainerComponent } from '../lf-field-template-container/lf-field-template-container.component';
import { LfFieldContainerComponent } from './lf-field-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LfModalsModule } from '@laserfiche/lf-ui-components/shared';
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
});
