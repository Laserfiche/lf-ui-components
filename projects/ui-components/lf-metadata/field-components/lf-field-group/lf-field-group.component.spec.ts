import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { FieldType, LfLoaderModule } from '@laserfiche/lf-ui-components/shared';
import { LfFieldBaseModule } from '../field-base-parts/lf-field-base/lf-field-base.module';
import { FieldValue } from '../utils/lf-field-types';
import { LfFieldGroupIndexDisplayPipe } from './lf-field-group-index-display.pipe';
import { LfFieldGroupComponent } from './lf-field-group.component';

describe('LfFieldGroupComponent', () => {
  let component: LfFieldGroupComponent;
  let fixture: ComponentFixture<LfFieldGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LfFieldGroupComponent, LfFieldGroupIndexDisplayPipe],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        DragDropModule,
        LfFieldBaseModule,
        MatIconModule,
        LfLoaderModule
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have no groups before initAsync', () => {
    expect(component.fieldDefinitions).toEqual([]);
    expect(component.fieldValues).toEqual(new Map<number, FieldValue>());
  });

  it('should have 1 group after initAsync', async () => {
    await component.initAsync([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test', 'hello']
    }]);

    expect(component.fieldDefinitions).toEqual([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test', 'hello']
    }]);
    const mappedFields = new Map<number, FieldValue>();
    mappedFields.set(1,
      {
        fieldId: 1, fieldName: 'hi', fieldType: FieldType.String, groupId: 0,
        values: [{ value: 'test', position: '1' }, { value: 'hello', position: '2' }]
      }
    );
    expect(component.fieldValues).toEqual(mappedFields);
  });

  it('should have 2 groups after add', async () => {
    await component.initAsync([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    component.onClickAdd(0);

    expect(component.fieldDefinitions).toEqual([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    const mappedFields = new Map<number, FieldValue>();
    mappedFields.set(1,
      {
        fieldId: 1,
        fieldName: 'hi',
        fieldType: FieldType.String,
        groupId: 0,
        values: [
          { value: 'test', position: '1' },
          { value: '', position: '2' }
        ]
      }
    );
    expect(component.fieldValues).toEqual(mappedFields);
  });

  it('should have 1 groups after add then remove', async () => {
    await component.initAsync([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    component.onClickAdd(0);
    component.onClickDelete(0);

    expect(component.fieldDefinitions).toEqual([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    const mappedFields = new Map<number, FieldValue>();
    mappedFields.set(1,
      {
        fieldId: 1,
        fieldName: 'hi',
        fieldType: FieldType.String,
        groupId: 0,
        values: [
          { value: '', position: '1' }
        ]
      }
    );
    expect(component.fieldValues).toEqual(mappedFields);
  });

  it('should reverse order after add then move up', async () => {
    await component.initAsync([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    component.onClickAdd(0);
    component.onClickUp(1);

    expect(component.fieldDefinitions).toEqual([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    const mappedFields = new Map<number, FieldValue>();
    mappedFields.set(1,
      {
        fieldId: 1,
        fieldName: 'hi',
        fieldType: FieldType.String,
        groupId: 0,
        values: [
          { value: '', position: '1' },
          { value: 'test', position: '2' }
        ]
      }
    );
    expect(component.fieldValues).toEqual(mappedFields);
  });

  it('should reverse order after add then move down', async () => {
    await component.initAsync([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    component.onClickAdd(0);
    component.onClickDown(0);

    expect(component.fieldDefinitions).toEqual([{
      fieldInfo: {
        id: 1,
        name: 'hi',
        fieldType: FieldType.String
      },
      fieldValues: ['test']
    }]);
    const mappedFields = new Map<number, FieldValue>();
    mappedFields.set(1,
      {
        fieldId: 1,
        fieldName: 'hi',
        fieldType: FieldType.String,
        groupId: 0,
        values: [
          { value: '', position: '1' },
          { value: 'test', position: '2' }
        ]
      }
    );
    expect(component.fieldValues).toEqual(mappedFields);
  });
});
