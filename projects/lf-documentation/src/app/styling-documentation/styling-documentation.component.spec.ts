import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { CardComponent } from '../card/card.component';

import { StylingDocumentationComponent } from './styling-documentation.component';

describe('StylingDocumentationComponent', () => {
  let component: StylingDocumentationComponent;
  let fixture: ComponentFixture<StylingDocumentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        StylingDocumentationComponent,
        CardComponent
      ],
      imports: [ MatCardModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StylingDocumentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
