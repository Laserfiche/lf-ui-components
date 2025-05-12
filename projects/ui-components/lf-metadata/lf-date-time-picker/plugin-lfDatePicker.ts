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

    return {
      onOpen() {
        document.addEventListener('mousedown', dateHandleMouseDown, { capture: true });
      },
      onClose() {
        document.removeEventListener('mousedown', dateHandleMouseDown, { capture: true });
      },
    };
  };
}
