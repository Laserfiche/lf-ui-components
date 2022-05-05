import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfTreeComponent } from './lf-tree.component';

describe('LfTreeComponent', () => {
  let component: LfTreeComponent;
  let fixture: ComponentFixture<LfTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfTreeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
