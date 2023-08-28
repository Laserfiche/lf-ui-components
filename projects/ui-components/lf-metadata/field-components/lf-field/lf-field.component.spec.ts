import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { LfFieldComponent } from './lf-field.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LfFieldBaseModule } from '../field-base-parts/lf-field-base/lf-field-base.module';

describe('LfFieldComponent', () => {
  let component: LfFieldComponent;
  let fixture: ComponentFixture<LfFieldComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LfFieldComponent],
      imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        LfFieldBaseModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
