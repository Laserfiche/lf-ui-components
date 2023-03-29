import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { CardComponent } from '../card/card.component';

import { TroubleshootingComponent } from './troubleshooting.component';

describe('TroubleshootingComponent', () => {
  let component: TroubleshootingComponent;
  let fixture: ComponentFixture<TroubleshootingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TroubleshootingComponent, CardComponent ],
      imports: [MatMenuModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TroubleshootingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
