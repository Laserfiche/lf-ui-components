// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Plugin } from 'flatpickr/dist/types/options';
import { Instance } from 'flatpickr/dist/types/instance';
import { UniDateTimeService } from './uni-date-time.service';

var dateTimeService = new UniDateTimeService();

export function LFDatePickerPlugin(): Plugin {
  return function (fp: Instance) {
    const flatpickerKey: keyof typeof window = 'flatpickr' as keyof typeof window;
    fp.config.parseDate = function (date: string, format: string, locale?: any) {
      if (!dateTimeService.isToken(date)) {
        const dateFormat = dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(format, true);
        try {
          locale = locale ? locale : fp.config.locale;
          const timeless = dateTimeService.hasTimeFormat(dateFormat);
          if (flatpickerKey in window) {
            return window[flatpickerKey].parseDate(date, dateFormat, timeless, locale);
          } else {
            return new Date();
          }
        } catch (e) {
          return new Date();
        }
      } else {
        return new Date();
      }
    };
    fp.config.formatDate = function (date: Date, format: string, locale?: any) {
      if (!dateTimeService.isToken(fp.input?.value)) {
        try {
          locale = locale ? locale : fp.config.locale;
          return window[flatpickerKey].formatDate(date, format, locale);
        } catch (e) {
          return fp.input.value;
        }
      } else {
        return fp.input.value;
      }
    };
    function dateHandleMouseDown(event: any) {
      if (event.target !== fp.input && !fp.calendarContainer.contains(event.target)) {
        const value = fp.input.value;
        fp.setDate(value);
        fp.close();
      } else if (dateTimeService.isToken(fp.input?.value) && event.target.dateObj) {
        //if token, replace input with selected date value
        fp.input.value = window[flatpickerKey].formatDate(event.target.dateObj, fp.config.dateFormat, fp.config.locale);
      }
    }

    function dateHandleKeyDown(event: any) {

      //   event.preventDefault();
      //   // Open the month selector dropdown
      //   const monthDropdown = fp.calendarContainer.querySelector('.flatpickr-monthDropdown-months') as HTMLElement;
      //   if (monthDropdown) {
      //     monthDropdown.focus();
      //     monthDropdown.click();
      //   }
      // }
      //   if (document.activeElement?.localName === 'body') {
      //     if (fp.daysContainer) {
      //       fp.daysContainer.focus();
      //     }}
      //   // } else if (document.activeElement === fp.secondElement) {
      //   //   console.log('timeContainer');
      //   //   fp.daysContainer?.focus();
      //   // } else if (document.activeElement === fp.input) {
      //   //   const value = fp.input.value;
      //   //   fp.setDate(value);
      //   //   fp.daysContainer?.focus();
      //   //   fp.close();
      //   // }
      // } else if (event.key === 'ArrowRight') {
        // fp.daysContainer?.focus();
      //   // let currentDate = fp.selectedDates[0] || new Date();
      //   // currentDate.setDate(currentDate.getDate() + 1);
      //   // fp.setDate(currentDate);
      // } else if (event.key === 'ArrowDown') {
      //   //   let currentDate = fp.selectedDates[0] || new Date();
      //   //   currentDate.setDate(currentDate.getDate() + 7);
      //   //   fp.setDate(currentDate);
      //   //   fp.input.focus();
      // } else if (event.key === 'ArrowLeft') {
      //   // let currentDate = fp.selectedDates[0] || new Date();
      //   // currentDate.setDate(currentDate.getDate() - 1);
      //   // fp.setDate(currentDate);
      // } else if (event.key === 'ArrowUp') {
      //   // // event.preventDefault();
      //   // let currentDate = fp.selectedDates[0] || new Date();
      //   // currentDate.setDate(currentDate.getDate() - 7);
      //   // fp.setDate(currentDate, false);
      // }

      // if (event.key === 'Tab' && event.target === fp.input) {
      //   const value = fp.input.value;
      //   fp.setDate(value);
      //   fp.close();
      //   Open the month selector dropdown
        // fp.daysContainer?.focus();
      //   const monthDropdown = fp.calendarContainer.querySelector('.flatpickr-monthDropdown-months') as HTMLElement;
      //   if (monthDropdown) {
      //     monthDropdown.focus();

      //     const clickEvent = new MouseEvent('click', {
      //       view: window,
      //       bubbles: true,
      //       cancelable: true,
      //     });
      //     monthDropdown.dispatchEvent(clickEvent);
      //   }
      // }
    }

    return {
      onOpen() {
        document.addEventListener('mousedown', dateHandleMouseDown, { capture: true });
        // document.addEventListener('keydown', dateHandleKeyDown, { capture: true });
      },
      onKeyDown()
      {
        // document.addEventListener('keydown', dateHandleKeyDown, { capture: true });

      },
      onClose() {
        document.removeEventListener('mousedown', dateHandleMouseDown, { capture: true });
        // document.removeEventListener('keydown', dateHandleKeyDown, { capture: true });
      },
    };
  };
}
