// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Plugin } from 'flatpickr/dist/types/options';
import { Instance } from 'flatpickr/dist/types/instance';
import { UniDateTimeService } from './uni-date-time.service';

var dateTimeService = new UniDateTimeService();

export function LFTimePickerPlugin(): Plugin {
  return function (fp: Instance) {
    const flatpickerKey: keyof typeof window = 'flatpickr' as keyof typeof window;
    fp.config.parseDate = function (date: string, format: string, locale?: any) {
      if (!dateTimeService.isToken(date)) {
        const dateFormat = dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(format, true);
        try {
          /*
					if (isCustomFormat(fp.config.dateFormat)) {
						dateFormat = format === "H:mm:ss" ? "H:i:S" : "H:i";
          }
          */
          locale = locale ? locale : fp.config.locale;
          return window[flatpickerKey].parseDate(date, dateFormat, false, locale);
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
          // if (isCustomFormat(fp.config.dateFormat)) {
          const time = window[flatpickerKey].formatDate(
            date,
            dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(format, true),
            locale
          );
          return time.replace(/^0?/, ''); // Not sure why? Revise
          // }
          // else {
          //	return window["flatpickr"].formatDate(date, format, locale);
          //}
        } catch (e) {
          return fp.input.value;
        }
      } else {
        return fp.input.value;
      }
    };

    // force onChange event listener on time field when value is programtically changed with flatpickr
    // This may be specific to forms-layout // Revise
    fp.config.onValueUpdate.push(function () {
      if (!fp.calendarContainer.classList.contains('open')) {
        const parsedDate = fp.parseDate(parseTimeFromPicker(fp), fp.config.dateFormat); // Revise
        fp.input.value = window[flatpickerKey].formatDate(parsedDate, fp.config.dateFormat, fp.config.locale);
        const timeField = fp.input?.parentElement?.parentElement;
        if (timeField) {
          const event = new Event('change');
          timeField.dispatchEvent(event);
        }
      }
    });

    function handleMouseDown(e: any) {
      if (e.target !== fp.input && !fp.timeContainer?.contains(e.target)) {
        let value = fp.input.value;
        if (fp.timeContainer?.contains(document.activeElement)) {
          value = parseTimeFromPicker(fp);
        }
        fp.setDate(value);
        fp.close();
      }
    }

    function handleKeyDown(e: any) {
      if (e.key === 'Tab' && document.activeElement === fp.input) {
        fp.setDate(fp.input.value);
        fp.close();
      }
    }

    function getRidOffNumTooltip() {
      fp.minuteElement?.setAttribute('title', '');
      fp.secondElement?.setAttribute('title', '');
    }

    return {
      onOpen() {
        getRidOffNumTooltip();
        document.addEventListener('mousedown', handleMouseDown, { capture: true });
        document.addEventListener('keydown', handleKeyDown, { capture: true });
      },
      onClose() {
        document.removeEventListener('mousedown', handleMouseDown, { capture: true });
        document.removeEventListener('keydown', handleKeyDown, { capture: true });
      },
    };
  };
}

function parseTimeFromPicker(fp: Instance): string {
  let value;
  if (fp.amPM && fp.amPM.innerText) {
    value = formatTime12HourTo24Hour(fp);
  } else {
    value = fp.hourElement?.value + ':' + fp.minuteElement?.value;
    if (fp.config.enableSeconds) {
      value += ':' + fp.secondElement?.value;
    }
  }
  return value;
}

function formatTime12HourTo24Hour(fp: Instance): string {
  const localeSet = fp.config.locale as any;
  const localizedAM = localeSet.amPM ? (localeSet.amPM[0] ? localeSet.amPM[0] : 'AM') : '';
  const localizedPM = localeSet.amPM ? (localeSet.amPM[1] ? localeSet.amPM[1] : 'PM') : '';
  let hour: number;
  if (fp.hourElement?.value) {
    hour = parseInt(fp.hourElement.value, 10);
  } else {
    hour = 0;
  }

  if (fp.amPM?.innerText === localizedPM && hour !== 12) {
    hour += 12;
  } else if (fp.amPM?.innerText === localizedAM && hour === 12) {
    hour = 0;
  }
  let value: string = hour + ':' + fp.minuteElement?.value;
  if (fp.config.enableSeconds) {
    value += ':' + fp.secondElement?.value;
  }
  return value;
}

/*
function isCustomFormat(dateFormat: string) {
	return dateFormat === "H:mm:ss" || dateFormat === "H:mm";
}
*/
