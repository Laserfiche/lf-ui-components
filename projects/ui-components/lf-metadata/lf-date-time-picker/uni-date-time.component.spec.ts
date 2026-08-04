// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniDateTimeComponent } from './uni-date-time.component';
import { FormChangeEvent } from './uni-date-time.common';

describe('UniDatetimeComponent', () => {
  let component: UniDateTimeComponent;
  let fixture: ComponentFixture<UniDateTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniDateTimeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UniDateTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not emit again from onDateTimeChange when called again with the same resulting value (e.g. flatpickr onClose and native blur both firing for one commit)', () => {
    const emitted: unknown[] = [];
    component.valueChangedEventHandler.subscribe((event) => emitted.push(event));
    const date = new Date('2024-01-01T10:00:00');

    component.onDateTimeChange(date, true, FormChangeEvent.DateClose);
    component.onDateTimeChange(date, true, FormChangeEvent.DateBlur);

    expect(emitted.length).toBe(1);
  });

  it('should emit again from onDateTimeChange when the value actually changes', () => {
    const emitted: unknown[] = [];
    component.valueChangedEventHandler.subscribe((event) => emitted.push(event));

    component.onDateTimeChange(new Date('2024-01-01T10:00:00'), true, FormChangeEvent.DateClose);
    component.onDateTimeChange(new Date('2024-01-02T11:00:00'), true, FormChangeEvent.DateClose);

    expect(emitted.length).toBe(2);
  });

  it('should remove the flatpickr calendar elements from the document on ngOnDestroy', () => {
    const combinedFixture = TestBed.createComponent(UniDateTimeComponent);
    const combinedComponent = combinedFixture.componentInstance;
    combinedComponent.settings = { ...combinedComponent.dateTimeService.getDefaultSettings(), showTime: true };
    combinedFixture.detectChanges();

    const dateCalendar = combinedComponent.date?.calendarContainer;
    const timeCalendar = combinedComponent.time?.calendarContainer;
    expect(document.body.contains(dateCalendar ?? null)).toBe(true);
    expect(document.body.contains(timeCalendar ?? null)).toBe(true);

    combinedComponent.ngOnDestroy();

    expect(document.body.contains(dateCalendar ?? null)).toBe(false);
    expect(document.body.contains(timeCalendar ?? null)).toBe(false);
  });
});
