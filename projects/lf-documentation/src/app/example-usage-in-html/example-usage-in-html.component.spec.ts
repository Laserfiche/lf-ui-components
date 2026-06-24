// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { ExampleUsageInHtmlComponent } from './example-usage-in-html.component';

describe('ExampleUsageInHtmlComponent', () => {
  let component: ExampleUsageInHtmlComponent;
  let fixture: ComponentFixture<ExampleUsageInHtmlComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleUsageInHtmlComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleUsageInHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    httpMock.expectOne('./framework-agnostic-ui-component-demo.html').flush('');
    expect(component).toBeTruthy();
  });

  it('should load demo file content on init', () => {
    const mockContent = '<html>demo</html>';
    httpMock.expectOne('./framework-agnostic-ui-component-demo.html').flush(mockContent);
    expect(component.demoFileContent()).toBe(mockContent);
  });
});
