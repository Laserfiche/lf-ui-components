// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ExampleUsageInHtmlComponent } from './example-usage-in-html.component';

describe('ExampleUsageInHtmlComponent', () => {
  let component: ExampleUsageInHtmlComponent;
  let fixture: ComponentFixture<ExampleUsageInHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleUsageInHtmlComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageInHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should embed the demo page as a live iframe', () => {
    const frame: HTMLIFrameElement | null = fixture.nativeElement.querySelector('iframe.demo-frame');
    expect(frame?.getAttribute('src')).toBe('./framework-agnostic-ui-component-demo.html');
  });
});
