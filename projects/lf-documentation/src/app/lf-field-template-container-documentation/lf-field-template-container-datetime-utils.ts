// This file is an intentional duplication of lf-metadata/src/lib/lf-field-template-container-datetime-utils
export class DatetimeUtils {
  static deserializeDateValue(date: string | undefined): string {
    if (!date) {
      return '';
    }
    const fieldValueAsDate: Date = new Date(date);
    if (isNaN(fieldValueAsDate.getTime())) {
      return date;
    }
    const offset: number = fieldValueAsDate.getTimezoneOffset();
    if (offset === 0) {
      return fieldValueAsDate.toISOString();
    }
    else {
      const offsetMs: number = offset * 60000;
      const dateAsNumber: number = fieldValueAsDate.getTime() + offsetMs;
      const dateWithoutOffset: Date = new Date(dateAsNumber);
      return dateWithoutOffset.toISOString();
    }
  }

  static serializeDateValue(date: Date | undefined): string | undefined {
    if (!date || !DatetimeUtils.isValidDate(date)) {
      return undefined;
    }

    const offset: number = date.getTimezoneOffset();
    if (offset === 0) {
      return date.toISOString();
    }

    const pad: (num: number) => string = (num: number) => {
      const norm = Math.floor(Math.abs(num));
      return (norm < 10 ? '0' : '') + norm;
    };
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }



  static isValidDate(date: Date): boolean {
    return !isNaN(date.getTime());
  }

  static compareDateStrings(first: string, second: string): boolean {
    const firstDate = new Date(first);
    const secondDate = new Date(second);
    if (!DatetimeUtils.isValidDate(firstDate) || !DatetimeUtils.isValidDate(secondDate)) {
      return false;
    }
    return firstDate.getTime() === secondDate.getTime();
  }
}
