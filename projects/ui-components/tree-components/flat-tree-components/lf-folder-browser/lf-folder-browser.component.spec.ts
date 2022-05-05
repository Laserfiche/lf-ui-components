import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { LfToolbarComponent } from '../lf-toolbar/lf-toolbar.component';
import { LfBreadcrumbsComponent } from './../lf-breadcrumbs/lf-breadcrumbs.component';
import { LfFolderBrowserComponent } from './lf-folder-browser.component';

describe('LfFolderBrowserComponent', () => {
  let component: LfFolderBrowserComponent;
  let fixture: ComponentFixture<LfFolderBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatListModule,
        MatMenuModule,
        MatDialogModule
      ],
      declarations: [
        LfFolderBrowserComponent,
        LfBreadcrumbsComponent,
        LfToolbarComponent
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfFolderBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
