import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralDialogLayoutComponent } from './general-dialog-layout.component';

describe('GeneralDialogLayoutComponent', () => {
  let component: GeneralDialogLayoutComponent;
  let fixture: ComponentFixture<GeneralDialogLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralDialogLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralDialogLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
