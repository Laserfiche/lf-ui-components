import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AdhocFieldConnectorService } from '../lf-field-adhoc-connector.service';
import { MatDialogModule } from '@angular/material/dialog';
import { FieldValues, LfFieldInfo } from '../../field-components/utils/lf-field-types';
import { LfFieldAddRemoveComponent } from './lf-field-add-remove.component';
import { LfFieldAdhocContainerDemoService } from '../lf-field-adhoc-container-demo.service';
import { FieldType, LfPopupModalComponent } from '@laserfiche/laserfiche-ui-components/shared';
import { GetFieldTypePipe } from './get-field-type.pipe';

describe('LfFieldAddRemoveComponent', () => {
  let component: LfFieldAddRemoveComponent;
  let fixture: ComponentFixture<LfFieldAddRemoveComponent>;
  let element: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        LfFieldAddRemoveComponent,
        LfPopupModalComponent,
        GetFieldTypePipe
      ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatCheckboxModule,
        MatDialogModule
      ],
      providers: [{provide: AdhocFieldConnectorService, useValue: adHocConnectorTestService}]
    })
      .compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfFieldAddRemoveComponent);
    element = fixture.nativeElement;
    component = fixture.componentInstance;
    await component.initAsync(new LfFieldAdhocContainerDemoService());
    await component.updateSortedFieldInfos();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial field checked', () => {
    const initialFieldInfo: LfFieldInfo = { name: 'test field 1', id: 1, description: '', fieldType: FieldType.String, isMultiValue: true };
    expect(component.isFieldSelected(initialFieldInfo)).toBeTruthy();
  });

  it('should update selectedFields when checkbox is checked', () => {
    // Arrange
    const matCheckboxUpdate = new MatCheckboxChange();
    matCheckboxUpdate.checked = true;
    const fieldInfoToCheck: LfFieldInfo = {
      name: 'test field 3', id: 3, description: '', fieldType: FieldType.DateTime, isMultiValue: true
    };

    // Act
    component.onUpdateCheckbox(matCheckboxUpdate, fieldInfoToCheck);

    // Assert
    const expected = new Set<number>([1, 3]);
    expect(component.selectedFieldIds).toEqual(expected);
    expect(component.isFieldSelected(fieldInfoToCheck)).toBeTrue();
  });

  it('should update selectedFields when checkbox is unchecked', () => {
    // Arrange
    const matCheckboxUpdate = new MatCheckboxChange();
    matCheckboxUpdate.checked = false;
    const fieldInfoToUncheck: LfFieldInfo = {
      name: 'test field 1', id: 1, description: '', fieldType: FieldType.String, isMultiValue: true
    };

    // Act
    component.onUpdateCheckbox(matCheckboxUpdate, fieldInfoToUncheck);

    // Assert
    const expected = new Set<number>();
    expect(component.selectedFieldIds).toEqual(expected);
    expect(component.isFieldSelected(fieldInfoToUncheck)).toBeFalse();
  });

  it('should update connector service when click apply after changes', async () => {
    // Arrange
    spyOn(component.clickBack, 'emit');
    spyOn(adHocConnectorTestService, 'setSelectedFieldIds');
    const checkbox = element.querySelector('.mat-checkbox-input') as HTMLElement;
    checkbox.click();
    fixture.detectChanges();

    // Act
    component.onClickApply();

    // Assert
    await fixture.whenStable();
    expect(adHocConnectorTestService.setSelectedFieldIds).toHaveBeenCalledWith(new Set<number>());
    expect(component.areCheckboxChanges).toBeFalse();
    expect(component.clickBack.emit).toHaveBeenCalled();

  });

  it('should not update connector service when click cancel after changes', async () => {
    // Arrange
    const checkbox = element.querySelector('.mat-checkbox-input') as HTMLElement;
    checkbox.click();
    fixture.detectChanges();

    // Act
    const cancelButton = element.querySelector('#adhoc-cancel-button') as HTMLButtonElement;
    cancelButton.click();

    // Assert
    await fixture.whenStable();
    expect(component.selectedFieldIds).toEqual(new Set<number>([1]));
    expect(component.areCheckboxChanges).toBeFalse();
  });

  it('should update connector service when confirm yes after press back with changes', async () => {
    // Arrange
    spyOn(component.clickBack, 'emit');
    spyOn(adHocConnectorTestService, 'setSelectedFieldIds');
    const checkbox = element.querySelector('.mat-checkbox-input') as HTMLElement;
    checkbox.click();
    fixture.detectChanges();

    // Act
    component.onClickBack();
    component.onClickApply();

    // Assert
    await fixture.whenStable();
    expect(adHocConnectorTestService.setSelectedFieldIds).toHaveBeenCalledWith(new Set<number>());
    expect(component.areCheckboxChanges).toBeFalse();
    expect(component.clickBack.emit).toHaveBeenCalled();
  });

  it('should not update connector service when confirm no after press back with changes', async () => {
    // Arrange
    spyOn(component.clickBack, 'emit');
    const checkbox = element.querySelector('.mat-checkbox-input') as HTMLElement;
    checkbox.click();
    fixture.detectChanges();

    // Act
    component.onClickBack();
    component.onConfirmNo();

    // Assert
    await fixture.whenStable();
    expect(component.areCheckboxChanges).toBeFalse();
    expect(component.clickBack.emit).toHaveBeenCalled();
  });

  it('should not update connector service when confirm cancel after press back with changes', async () => {
    // Arrange
    spyOn(component.clickBack, 'emit');
    const checkbox = element.querySelector('.mat-checkbox-input') as HTMLElement;
    checkbox.click();
    fixture.detectChanges();

    // Act
    component.onClickBack();

    // Assert
    await fixture.whenStable();
    expect(component.areCheckboxChanges).toBeTrue();
    expect(component.clickBack.emit).not.toHaveBeenCalled();
  });

  it('should not update connector service when press back with no changes', async () => {
    // Arrange
    spyOn(component.clickBack, 'emit');
    // Act
    const backButton = element.querySelector('#adhoc-back-button') as HTMLButtonElement;
    backButton.click();

    // Assert
    await fixture.whenStable();
    expect(component.areCheckboxChanges).toBeFalse();
    expect(component.clickBack.emit).toHaveBeenCalled();
  });

  it('should not have apply or cancel buttons with no changes', async () => {
    // Arrange
    // Act
    const applyButton = element.querySelector('#adhoc-apply-button');
    const cancelButton = element.querySelector('#adhoc-cancel-button');

    // Assert
    expect(applyButton).toBeFalsy();
    expect(cancelButton).toBeFalsy();
    expect(component.areCheckboxChanges).toBeFalse();
  });
});

const adHocConnectorTestService =  {
  fieldInfos: [
    { name: 'test field 1', id: 1, description: '', fieldType: FieldType.String, isMultiValue: true },
    { name: 'test field 2', id: 2, description: '', fieldType: FieldType.String, isRequired: true },
    { name: 'test field 3', id: 3, description: '', fieldType: FieldType.Date, isMultiValue: true },
    { name: 'test field 4', id: 4, description: '', fieldType: FieldType.DateTime, isMultiValue: true },
    { name: 'test field 5', id: 5, description: '', fieldType: FieldType.Time, isMultiValue: true },
    { name: 'test field 6', id: 6, description: '', fieldType: FieldType.Number },
    { name: 'test field 7', id: 7, description: '', fieldType: FieldType.ShortInteger },
    { name: 'test field 8', id: 8, description: '', fieldType: FieldType.LongInteger },
    { name: 'test field 9', id: 9, description: '', fieldType: FieldType.String },
    { name: 'test field 10', id: 10, description: '', fieldType: FieldType.String, isRequired: true },
    { name: 'test field 11', id: 11, description: '', fieldType: FieldType.Date },
    { name: 'test field 12', id: 12, description: '', fieldType: FieldType.DateTime },
    { name: 'test field 13', id: 13, description: '', fieldType: FieldType.Time },
    { name: 'test field 14', id: 14, description: '', fieldType: FieldType.String },
    { name: 'test field 15', id: 15, description: '', fieldType: FieldType.String },
    { name: 'test field 16', id: 16, description: '', fieldType: FieldType.String },
  ],
  fieldValues: {
    1: {
      fieldName: 'test field 1',
      fieldId: 1,
      fieldType: FieldType.String,
      values: [
        { value: '44.788', position: '1' },
        { value: '55555', position: '2' }
      ]
    },
  },

  setSelectedFieldIds(selectedFields: Set<number>) {
  },
  getSelectedFieldIds(): Set<number> {
    const fieldIds = new Set<number>();
    fieldIds.add(1);
    return fieldIds;
  },
  setAllFieldInfos(fieldInfos: LfFieldInfo[]) {
  },
  getAllFieldInfos(): LfFieldInfo[] {
    return this.fieldInfos;
  },
  setAllFieldValues(fieldValues: FieldValues) {
  },
  getAllFieldValues(): FieldValues {
    return this.fieldValues;
  }
};
