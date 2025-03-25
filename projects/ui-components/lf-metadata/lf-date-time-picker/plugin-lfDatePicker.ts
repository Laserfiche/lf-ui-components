import { Plugin } from "flatpickr/dist/types/options";
import { Instance } from "flatpickr/dist/types/instance";
import { UniDateTimeService } from "./uni-date-time.service";

var dateTimeService = new UniDateTimeService;

export function LFDatePickerPlugin(): Plugin {
	return function (fp: Instance) {
    const flatpickerKey: keyof typeof window = 'flatpickr' as keyof typeof window;
    fp.config.parseDate = function (date: string, format: string, locale?: any) {
      if (!dateTimeService.isToken(date)) {
        let dateFormat = dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(format, true);
				try {
          locale = locale ? locale : fp.config.locale;
          const timeless = dateTimeService.hasTimeFormat(dateFormat);
          if (flatpickerKey in window)
           {return window[flatpickerKey].parseDate(date, dateFormat, timeless, locale);}
           else{
            return new Date();
           }
				} catch (e) {
					return new Date();
				}
			}
			else {
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
			}
			else {
				return fp.input.value;
			}
		};
		function dateHandleMouseDown(e: any) {
      if (e.target !== fp.input && !fp.calendarContainer.contains(e.target)) {
        const value = fp.input.value;
        fp.setDate(value);
        fp.close();
      } else if (dateTimeService.isToken(fp.input?.value) && e.target.dateObj) {
        //if token, replace input with selected date value
        fp.input.value = window[flatpickerKey].formatDate(e.target.dateObj, fp.config.dateFormat, fp.config.locale);
      }
    }

		function dateHandleKeyDown(e: any) {
			if (e.key === "Tab" && document.activeElement === fp.input) {
				const value = fp.input.value;
				fp.setDate(value);
				fp.close();
			}
		}

		return {
			onOpen() {
				document.addEventListener("mousedown", dateHandleMouseDown, { capture: true });
				document.addEventListener("keydown", dateHandleKeyDown, { capture: true });
			},
			onClose() {
				document.removeEventListener("mousedown", dateHandleMouseDown, { capture: true });
				document.removeEventListener("keydown", dateHandleKeyDown, { capture: true });
			}
		};
	};
}
