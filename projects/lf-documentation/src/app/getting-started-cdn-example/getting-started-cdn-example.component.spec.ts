import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GettingStartedCdnExampleComponent } from './getting-started-cdn-example.component';

describe('GettingStartedCdnExampleComponent', () => {
  let component: GettingStartedCdnExampleComponent;
  let fixture: ComponentFixture<GettingStartedCdnExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GettingStartedCdnExampleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GettingStartedCdnExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
