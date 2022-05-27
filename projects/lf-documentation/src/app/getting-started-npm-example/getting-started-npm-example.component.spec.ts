import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GettingStartedNpmExampleComponent } from './getting-started-npm-example.component';

describe('GettingStartedNpmExampleComponent', () => {
  let component: GettingStartedNpmExampleComponent;
  let fixture: ComponentFixture<GettingStartedNpmExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GettingStartedNpmExampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GettingStartedNpmExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
