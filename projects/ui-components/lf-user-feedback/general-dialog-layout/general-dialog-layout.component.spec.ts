import { Component, ViewChild, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GeneralDialogLayoutComponent } from './general-dialog-layout.component';

@Component({
  selector: 'lf-dialog-layout-tester',
  template: `<lib-general-dialog-layout id="layout">
      <div class="dialog-header">Header</div>
      <div class="dialog-header">Header Two</div>
      <div class="dialog-content">Content</div>
      <div class="dialog-content">Content2</div>
      <div class="dialog-content">Content3</div>
      <div class="dialog-footer">Footer</div>
    </lib-general-dialog-layout>`,
})
export class DialogLayoutTesterComponent {
  @ViewChild('#layout', /* TODO: add static flag */ {}) layout?: GeneralDialogLayoutComponent;
}

describe('LfGeneralDialogLayoutComponent UI tests', () => {
  let component: DialogLayoutTesterComponent;
  let fixture: ComponentFixture<DialogLayoutTesterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralDialogLayoutComponent, DialogLayoutTesterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogLayoutTesterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should insert the header div into the LfGeneralDialogLayoutComponent header section', () => {
    expect(fixture.debugElement.query(By.css('.header')).children.length).toBe(2);
  });

  it('should insert the content div into the LfGeneralDialogLayoutComponent content section', () => {
    expect(fixture.debugElement.query(By.css('.content-box')).children.length).toBe(3);
  });

  it('should insert the footer div into the LfGeneralDialogLayoutComponent footer section', () => {
    expect(fixture.debugElement.query(By.css('.footer')).children.length).toBe(1);
  });
});

describe('LfGeneralDialogLayoutComponent', () => {
  let component: GeneralDialogLayoutComponent;
  let fixture: ComponentFixture<GeneralDialogLayoutComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GeneralDialogLayoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralDialogLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
