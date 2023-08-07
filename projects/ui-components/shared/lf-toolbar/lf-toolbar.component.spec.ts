import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { LfToolbarComponent } from './lf-toolbar.component';

describe('LfToolbarComponent', () => {
  let component: LfToolbarComponent;
  let fixture: ComponentFixture<LfToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [LfToolbarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
