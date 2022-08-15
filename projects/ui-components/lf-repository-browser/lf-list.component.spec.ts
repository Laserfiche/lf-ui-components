import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfListComponent } from './lf-list.component';

describe('LfListComponent', () => {
  let component: LfListComponent;
  let fixture: ComponentFixture<LfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
