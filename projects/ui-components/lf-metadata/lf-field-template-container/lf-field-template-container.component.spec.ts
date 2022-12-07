import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';;
import { LfFieldMetadataConnectorService } from '../lf-field-metadata-connector.service';
import { LfFieldTemplateContainerComponent } from './lf-field-template-container.component';
import { LfFieldTemplateContainerService } from './lf-field-template-container.service';
import { City, County, DynamicFieldIds, fieldInfosPerTemplate, LfFieldTemplateContainerDemoService, State, TemplateIds } from './lf-field-template-container-demo.service';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfFieldViewDirective } from '../lf-field-view.directive';
import { FieldComponentsModule } from '../field-components/field-components.module';
import { TemplateFieldInfo } from '../field-components/utils/lf-field-types';

describe('LfFieldTemplateContainerComponent', () => {
  let component: LfFieldTemplateContainerComponent;
  let fixture: ComponentFixture<LfFieldTemplateContainerComponent>;
  let templateService!: LfFieldTemplateContainerService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [LfFieldTemplateContainerComponent, LfFieldViewDirective],
        imports: [CommonModule, FormsModule, MatSelectModule, FieldComponentsModule],
        providers: [LfFieldMetadataConnectorService],
      }).compileComponents();
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(LfFieldTemplateContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    templateService = new LfFieldTemplateContainerDemoService();
    await component.initAsync({ templateFieldContainerService: templateService });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getValuesById', async () => {
    // Arrange
    component.allFieldValues = {
      1: {
        fieldName: 'test field',
        fieldType: FieldType.String,
        fieldId: 1,
        values: [
          {
            value: 'test Value',
          },
        ],
      },
    };
    const fieldId: number = 1;

    // Act
    // @ts-ignore
    const values = component.getValuesById(fieldId);

    // Assert
    expect(values).toEqual(['test Value']);
  });

  it('should createDefaultFieldValue', async () => {
    // Arrange
    component.allFieldInfos = [
      {
        name: 'test field',
        id: 1,
        fieldType: FieldType.String,
        displayName: 'test field'
      },
    ];

    // Act
    // @ts-ignore
    const defaultValue = component.createDefaultFieldValue(1);

    // Assert
    expect(defaultValue).toEqual({ fieldName: 'test field', fieldId: 1, fieldType: FieldType.String });
  });

  it('can initialize to a template', async () => {
    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.String);

    // Assert
    expect(component.templateSelected?.id).toEqual(TemplateIds.String);
  });

  it('when initializing to a template that does not exist, then select empty template', async () => {
    // Arrange
    const nonExistingTemplateId = 9238472;
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.String);

    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, nonExistingTemplateId);

    // Assert
    expect(component.templateSelected).toBeUndefined();
  });

  it('when no dynamic fields are set, then only dynamic fields that do not depend on any other fields have pickable values', async () => {
    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    // Assert
    const expectedStateValues = [State.CA, State.OH, State.NV];
    const stateFieldInfo = component.allFieldInfos.find((templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.State);
    // eslint-disable-next-line
    expect(component.dynamicOptions.get(stateFieldInfo?.id ?? 0)![0]).toEqual(expectedStateValues);

    const expectedCountyValues: string[] = [];
    const countyFieldInfo = component.allFieldInfos.find((templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.County);
    // eslint-disable-next-line
    expect(component.dynamicOptions.get(countyFieldInfo?.id ?? 0)![0]).toEqual(expectedCountyValues);
  });

  it('when a dynamic field is chosen, then its dependent fields load pickable values', async () => {
    // Arrange
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    // Act
    const stateFieldInfoBefore = component.allFieldInfos.find(
      (templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.State
    );
    // @ts-ignore
    await component.onFieldValueChangedAsync([State.OH], stateFieldInfoBefore, [0]);

    // Assert
    const expectedStateValues = [State.CA, State.OH, State.NV];
    const stateFieldInfo = component.allFieldInfos.find((templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.State);
    // eslint-disable-next-line
    expect(component.dynamicOptions.get(stateFieldInfo?.id ?? 0)![0]).toEqual(expectedStateValues);

    const expectedCountyValues = [County.Cuyahoga, County.Hamilton];
    const countyFieldInfo = component.allFieldInfos.find((templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.County);
    // eslint-disable-next-line
    expect(component.dynamicOptions.get(countyFieldInfo?.id ?? 0)![0]).toEqual(expectedCountyValues);
  });

  it('when a dynamic field is changed, then its dependent fields are cleared', async () => {
    // Arrange
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    // Act
    const stateFieldInfo = component.allFieldInfos.find(
      (templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.State
    );
    // @ts-ignore
    await component.onFieldValueChangedAsync([State.OH], stateFieldInfo, [0]);

    const countyFieldInfo = component.allFieldInfos.find(
      (templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.County
    );
    // @ts-ignore
    await component.onFieldValueChangedAsync([County.Cuyahoga], countyFieldInfo, [0]);

    // Assert
    const countyValuesBefore = component.allFieldValues[DynamicFieldIds.County].values;
    expect(countyValuesBefore).toEqual([{ value: County.Cuyahoga, position: '1' }]);

    // Act again
    // @ts-ignore
    await component.onFieldValueChangedAsync([State.CA], stateFieldInfo, [0]);

    // Assert
    const countyValuesAfter = component.allFieldValues[DynamicFieldIds.County].values;
    expect(countyValuesAfter).toEqual([{ value: '', position: '1' }]);
  });

  it('when a dynamic field is changed and its child has only 1 option, then the child value is set to that option', async () => {
    // Arrange
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    // Act
    const stateFieldInfo = component.allFieldInfos.find(
      (templateFieldInfo) => templateFieldInfo.id === DynamicFieldIds.State
    );
    // @ts-ignore
    await component.onFieldValueChangedAsync([State.NV], stateFieldInfo, [0]);

    // Assert
    const countyValues = component.allFieldValues[DynamicFieldIds.County].values;
    expect(countyValues).toEqual([{ value: County.Clark, position: '1' }]);
  });

  it('when a dynamic field does not depend on any other field and only has 1 option, then it is set to that option', async () => {
    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicOneLocation);

    // Assert
    const stateValues = component.allFieldValues[DynamicFieldIds.State].values;
    expect(stateValues).toEqual([{ value: State.NV, position: '1' }]);
  });

  it('when a second field is added, then baseFieldOptions should be populated', async () => {
    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    const fieldInfos: TemplateFieldInfo[] = fieldInfosPerTemplate[TemplateIds.DynamicLocation];
    for (const info of fieldInfos) {
      await component.onFieldValueChangedAsync(['', ''], info);
    }

    // Assert
    const stateOptions = component.dynamicOptions.get(fieldInfos[0].id);
    expect(stateOptions).toEqual([[State.CA, State.OH, State.NV], [State.CA, State.OH, State.NV]]);
  });

  it('when a second field is added, then baseFieldOptions should be populated', async () => {
    // Act
    await component.initAsync({ templateFieldContainerService: templateService }, TemplateIds.DynamicLocation);

    const fieldInfos: TemplateFieldInfo[] = fieldInfosPerTemplate[TemplateIds.DynamicLocation];
    for (const info of fieldInfos) {
      await component.onFieldValueChangedAsync(['', ''], info);
    }

    await component.onFieldValueChangedAsync(['', State.NV], fieldInfos[0], [1]);

    // Assert
    const stateOptions = component.dynamicOptions.get(fieldInfos[0].id);
    expect(stateOptions).toEqual([[State.CA, State.OH, State.NV], [State.CA, State.OH, State.NV]]);

    const countyOptions = component.dynamicOptions.get(fieldInfos[1].id);
    expect(countyOptions).toEqual([[], [County.Clark]]);

    const cityOptions = component.dynamicOptions.get(fieldInfos[2].id);
    expect(cityOptions).toEqual([[], [City.LasVegas]]);

    const stateValues = component.allFieldValues[DynamicFieldIds.State].values;
    expect(stateValues).toEqual([{ value: '', position: '1' }, {value: State.NV, position: '2'}]);

    const countyValues = component.allFieldValues[DynamicFieldIds.County].values;
    expect(countyValues).toEqual([{ value: '', position: '1' }, {value: County.Clark, position: '2'}]);

    const cityValues = component.allFieldValues[DynamicFieldIds.City].values;
    expect(cityValues).toEqual([{ value: '', position: '1' }, {value: City.LasVegas, position: '2'}]);
  });
});
