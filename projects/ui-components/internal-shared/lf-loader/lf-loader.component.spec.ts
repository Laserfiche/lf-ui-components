import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfLoaderComponent } from './lf-loader.component';

describe('LfLoaderComponent', () => {
  let component: LfLoaderComponent;
  let fixture: ComponentFixture<LfLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
