import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfChecklistComponent } from './lf-checklist.component';

describe('LfChecklistComponent', () => {
  let component: LfChecklistComponent;
  let fixture: ComponentFixture<LfChecklistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfChecklistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfChecklistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
