// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Plugin } from 'flatpickr/dist/types/options';
import { Instance } from 'flatpickr/dist/types/instance';
import { UniDateTimeService } from './uni-date-time.service';
import flatpickr from 'flatpickr';

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
          // Because parsing sometimes applied wrong locale, a dummy flatpickr instance
          // should be created to enforce the correct locale
          const flatpickrInst = flatpickr(document.createElement('input'), { locale });
          return flatpickrInst.parseDate(date, dateFormat, timeless) ?? new Date();
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

    // clickOpens (below) turns off flatpickr's built-in "focus opens the calendar" binding, so
    // Tab into the input just moves on to the next field instead of opening the picker.
    function handleInputClickWhenClosed() {
      if (!fp.isOpen) {
        fp.open();
      }
    }

    function handleEnterOpensWhenClosed(e: KeyboardEvent) {
      if (e.key === 'Enter' && !fp.isOpen && document.activeElement === fp.input) {
        e.preventDefault();
        e.stopPropagation();
        fp.open();
      }
    }

    return {
      clickOpens: false,
      onReady() {
        fp.input.addEventListener('click', handleInputClickWhenClosed);
        document.addEventListener('keydown', handleEnterOpensWhenClosed, { capture: true });
      },
      onOpen() {
        document.addEventListener('mousedown', dateHandleMouseDown, { capture: true });
      },
      onClose() {
        document.removeEventListener('mousedown', dateHandleMouseDown, { capture: true });
      },
      onDestroy() {
        fp.input.removeEventListener('click', handleInputClickWhenClosed);
        document.removeEventListener('keydown', handleEnterOpensWhenClosed, { capture: true });
        // onClose normally removes this, but destroy() can happen while the picker is still open
        // (e.g. a multi-value row removed mid-edit), which would otherwise leave a document-level
        // listener referencing this now-destroyed fp instance.
        document.removeEventListener('mousedown', dateHandleMouseDown, { capture: true });
      },
    };
  };
}
