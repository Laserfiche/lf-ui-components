import { inject, Renderer2, ElementRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ResizeColumnDirective } from './resize-column.directive';

describe('ResizeColumnDirective', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResizeColumnDirective],
      providers: [Renderer2, ElementRef]
    })
      .compileComponents();
  }));
});
