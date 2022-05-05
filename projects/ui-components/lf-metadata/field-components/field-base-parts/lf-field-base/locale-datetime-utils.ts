import * as _moment from 'moment';
const moment = _moment;

export class LocaleDatetimeUtils {
  static getLocaleDateTimePattern(locale?: string): string {
    return `${LocaleDatetimeUtils.getLocaleDatePattern(
        locale ?? navigator.language
      )}, ${LocaleDatetimeUtils.getLocaleTimePattern(
        locale ?? navigator.language
      )}`;
  }

  static getLocaleDatePattern(locale?: string): string {
    moment.locale(locale ?? navigator.language);
    const datetime: moment.Moment = moment('3333-11-22T11:22:33');
    const formattedDate: string = datetime.format('L').replace(/1/g, 'M').replace(/2/g, 'D').replace(/3/g, 'Y');
    return formattedDate;
  }

  static getLocaleTimePattern(locale?: string): string {
    moment.locale(locale ?? navigator.language);
    const datetime: moment.Moment = moment('3333-11-22T11:22:33');
    const formattedTimeWithSec: string = datetime
      .format('LTS')
      .replace(/1/g, 'H')
      .replace(/2/g, 'm')
      .replace(/3/g, 's')
      .replace(' AM', '');
    return formattedTimeWithSec;
  }
}
