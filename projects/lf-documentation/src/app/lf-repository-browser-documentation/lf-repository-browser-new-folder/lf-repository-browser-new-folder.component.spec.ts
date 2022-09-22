import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfNewFolderDialogModalComponent } from '@laserfiche/lf-ui-components/shared';
import { LfRepositoryBrowserNewFolderComponent } from './lf-repository-browser-new-folder.component';

describe('LfFileExplorerNewFolderComponent', () => {
  let component: LfRepositoryBrowserNewFolderComponent;
  let fixture: ComponentFixture<LfRepositoryBrowserNewFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfRepositoryBrowserNewFolderComponent,
        LfNewFolderDialogModalComponent
      ],
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfRepositoryBrowserNewFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
