import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { LfFieldTokenData, LfFieldTokenService } from '../lf-field-base/lf-field-token.service';
import { LfTokenPickerComponent } from './lf-token-picker.component';
import { LfTokenService } from './lf-token.service';

describe('LfTokenPickerComponent', () => {
  let component: LfTokenPickerComponent;
  let fixture: ComponentFixture<LfTokenPickerComponent>;
  const data: LfFieldTokenData = {
    fieldType: FieldType.Date
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LfTokenPickerComponent],
      imports: [MatMenuModule],
      providers: [
        { provide: LfTokenService, useClass: LfFieldTokenService }]
    })
      .compileComponents();

      fixture = TestBed.createComponent(LfTokenPickerComponent);
      component = fixture.componentInstance;
      component.data = data;
      fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

