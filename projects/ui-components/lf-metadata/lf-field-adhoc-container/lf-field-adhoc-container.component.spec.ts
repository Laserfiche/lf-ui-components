import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfLoaderModule, LfModalsModule } from '@laserfiche/lf-ui-components/internal-shared'; 
import { LfFieldViewDirective } from '../lf-field-view.directive';
import { FieldValue } from '../field-components/utils/lf-field-types';
import { LfFieldAddRemoveComponent } from './lf-field-add-remove/lf-field-add-remove.component';
import { LfFieldAdhocContainerDemoService } from './lf-field-adhoc-container-demo.service';
import { AdhocFieldInfo } from './lf-field-adhoc-container-types';
import { LfFieldAdhocContainerComponent } from './lf-field-adhoc-container.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { LfFieldBaseModule } from '../field-components/field-base-parts/lf-field-base/lf-field-base.module';
import { GetFieldTypePipe } from './lf-field-add-remove/get-field-type.pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatDialogModule } from '@angular/material/dialog';

describe('LfFieldAdhocContainerComponent', () => {
  let component: LfFieldAdhocContainerComponent;
  let fixture: ComponentFixture<LfFieldAdhocContainerComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfFieldAdhocContainerComponent,
        LfFieldAddRemoveComponent,
        LfFieldViewDirective,
        GetFieldTypePipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        LfModalsModule,
        LfFieldBaseModule,
        MatCheckboxModule,
        ScrollingModule,
        LfLoaderModule,
        MatDialogModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LfFieldAdhocContainerComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
    const demoService = new LfFieldAdhocContainerDemoService();
    await component.initAsync(demoService);
    await component.resetFieldDataAsync(demoService.mappedFields);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have multivalue field', async () => {
    const multivalueField = element.querySelector('lf-field-multivalue-component');
    expect(multivalueField).toBeTruthy();
  });

  it('should have initial selectedFieldValues', async () => {
    const expected: FieldValue = {
      fieldName: 'Attendance List',
      fieldId: 1,
      fieldType: FieldType.String,
      values: [
        { value: 'Alex', position: '1' },
        { value: 'Andrew', position: '2' },
        { value: 'Ian', position: '3' },
        { value: 'Lee', position: '4' },
        { value: 'Paolo', position: '5' },
        { value: 'Quinn', position: '6' },
      ],
    };

    expect(component.getFieldValues()).toEqual({ 'Attendance List': expected });
  });

  it('should get current selectedFieldInfo', async () => {
    const initialFieldInfo: AdhocFieldInfo = {
      name: 'Attendance List',
      id: 1,
      fieldType: FieldType.String,
      isMultiValue: true,
      inTemplateSelected: false,
      displayName: 'Attendance List'
    };
    const expected = component.getSelectedFieldInfos();
    expect(expected).toEqual([initialFieldInfo]);
  });

  it('should update selectedFieldValues when checkbox changed',  fakeAsync( async () => {
    // Arrange
    const addRemoveButton = element.querySelector('#adhoc-add-remove-button') as HTMLButtonElement;
    addRemoveButton.click();
    flush();
    component.addRemoveComponent.ref.detectChanges();

    // Act
    // const attendanceListField = (element.querySelectorAll('.mat-checkbox-input') as any)[2];
    const attendanceListField = (element.querySelectorAll('.mdc-checkbox_native-control') as any)[2];
    attendanceListField.click();
     fixture.detectChanges();
    const applyButton = element.querySelector('#adhoc-apply-button') as HTMLButtonElement;
     applyButton.click();
    flush();

    // Assert
    expect(component.getFieldValues()).toEqual({
      'Amount (AUD)': { fieldName: 'Amount (AUD)', fieldId: 61, fieldType: FieldType.Number, values: [{ value: '', position: '1' }] },
      'Attendance List': {
        fieldName: 'Attendance List',
        fieldId: 1,
        fieldType: FieldType.String,
        values: [
          { value: 'Alex', position: '1' },
          { value: 'Andrew', position: '2' },
          { value: 'Ian', position: '3' },
          { value: 'Lee', position: '4' },
          { value: 'Paolo', position: '5' },
          { value: 'Quinn', position: '6' },
        ],
      },
    });
  }));

  it('should be invalid when one of fields is invalid', fakeAsync( async () => {
    // Arrange
    const addRemoveButton = element.querySelector('#adhoc-add-remove-button') as HTMLButtonElement;
    addRemoveButton.click();
    flush();
    component.addRemoveComponent.ref.detectChanges();

    // Act
    const fieldCheckboxes = element.querySelectorAll('.mat-checkbox-input') as any;
    const requiredField = fieldCheckboxes[1];
    requiredField.click();
    flush();
    component.addRemoveComponent.ref.detectChanges();

    component.onClickBackAsync();
    component.addRemoveComponent.onClickApply();

    // Assert (required field is blank)
    expect(component.forceValidation()).toBeFalse();
  }));

  it('should getMappedFieldValues with valid input', async () => {
    // Arrange
    const fieldValues: FieldValue[] = [
      {
        fieldName: 'test field 1',
        fieldId: 1,
      },
      {
        fieldName: 'test field 2',
        fieldId: 2,
      },
    ];

    // Act
    const mappedValues = component.getMappedFieldValues(fieldValues);

    // Assert
    const expected = {
      1: fieldValues[0],
      2: fieldValues[1],
    };
    expect(mappedValues).toEqual(expected);
  });

  it('should return Set from getFieldIds', async () => {
    // Arrange
    const fieldValues: FieldValue[] = [
      {
        fieldName: 'test field 1',
        fieldId: 1,
      },
      {
        fieldName: 'test field 2',
        fieldId: 2,
      },
    ];

    // Act
    const mappedValues = component.getFieldIds(fieldValues);

    // Assert
    const expected = new Set<number>([1, 2]);
    expect(mappedValues).toEqual(expected);
  });

  it('when FieldValue.name does not exist, getFieldValues skips it', () => {
    // Arrange
    const fieldValueNameDoesNotExist: FieldValue = { fieldId: 1 };
    const fieldValueNameExist: FieldValue = { fieldId: 2, fieldName: 'hello' };
    component.componentRefs = [
      { instance: jasmine.createSpyObj({ getFieldValue: fieldValueNameDoesNotExist }) },
      { instance: jasmine.createSpyObj({ getFieldValue: fieldValueNameExist }) },
    ] as any;

    // Act
    const actualValues = component.getFieldValues();

    // Assert
    const expectedValues = {
      [fieldValueNameExist.fieldName as string]: fieldValueNameExist,
    };
    expect(actualValues).toEqual(expectedValues);
  });
});
