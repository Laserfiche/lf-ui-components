import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfNewFolderDialogModalComponent } from '../lf-new-folder-dialog-modal/lf-new-folder-dialog-modal.component';
import { LfFileExplorerNewFolderComponent } from './lf-file-explorer-new-folder.component';

describe('LfFileExplorerNewFolderComponent', () => {
  let component: LfFileExplorerNewFolderComponent;
  let fixture: ComponentFixture<LfFileExplorerNewFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LfFileExplorerNewFolderComponent,
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
    fixture = TestBed.createComponent(LfFileExplorerNewFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
