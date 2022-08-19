import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfBreadcrumbsComponent } from './lf-breadcrumbs.component';

describe('LfBreadcrumbsComponent', () => {
  let component: LfBreadcrumbsComponent;
  let fixture: ComponentFixture<LfBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfBreadcrumbsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfBreadcrumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
