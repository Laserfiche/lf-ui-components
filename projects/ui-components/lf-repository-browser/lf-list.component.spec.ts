import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfListComponent } from './lf-list.component';

describe('LfListComponent', () => {
  let component: LfListComponent;
  let fixture: ComponentFixture<LfListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfListComponent ],
      imports: [
        CommonModule,
        ScrollingModule
      ]
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

  it('should emit the SelectedItemEvent when a selectable item is clicked', () => {
    
  })
});
