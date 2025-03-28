import { Injectable } from "@angular/core";
import df_parse from "date-fns/parse";
import df_parseISO from "date-fns/parseISO";
import df_format from "date-fns/format";
import df_isValid from "date-fns/isValid";
import df_isBefore from "date-fns/isBefore";
import df_isAfter from "date-fns/isAfter";
import df_isEqual from "date-fns/isEqual";
import df_isWithinInterval from "date-fns/isWithinInterval";
import df_add from "date-fns/add";
import df_addDays from "date-fns/addDays";
import df_addMonths from "date-fns/addMonths";
import df_addMilliseconds from "date-fns/addMilliseconds";
import df_milliseconds from "date-fns/milliseconds";
import df_isMatch from "date-fns/isMatch";
import df_isLeapYear from "date-fns/isLeapYear";
import df_startOfDay from "date-fns/startOfDay";
import df_endOfMonth from "date-fns/endOfMonth";
import df_intervalToDuration from "date-fns/intervalToDuration";
import df_getWeek from "date-fns/getWeek";
import df_getISOWeek from "date-fns/getISOWeek";
import df_differenceInYears from "date-fns/differenceInYears";
import df_differenceInMonths from "date-fns/differenceInMonths";
import df_differenceInDays from "date-fns/differenceInDays";
import { Duration } from "date-fns";

import { StateDataDateTime, UniComponentSettings, UniComponentConfig, FormatType } from './uni-date-time.common';
import { uniLocalizedFormats } from './uni-date-time.locales';

import { DateOption } from "flatpickr/dist/types/options";
import { CustomLocale } from "flatpickr/dist/types/locale";
import flatpickr from 'flatpickr';
import { FlatpickrLocales } from './flatpickr-locales';

@Injectable({
    providedIn: "root"
})


export class UniDateTimeService {
    public defaultErrorMessages = {
        ["required"]: () => "Value is required.",
        ["max"]: (params: { min?: string | number, max?: string | number }) => `Value must be less than or equal to ${params.max}.`,
        ["min"]: (params: { min?: string | number, max?: string | number }) => `Value must be greater than or equal to ${params.min}.`,
        ["range"]: (params: { min?: string | number, max?: string | number }) => `Value must be between ${params.min} and ${params.max}.`,
        ["invalidformat"]: () => `Invalid input.`,
    };

    public fromDisplayDateTimeFormatToUnicodeTokens(displayFormat: string): string {
        let newFormat = displayFormat;
        newFormat = newFormat.replace(/Y/g, 'y');
        newFormat = newFormat.replace(/D/g, 'd');
        newFormat = newFormat.replace(/A/g, 'a');
        return newFormat;
    }

    public isInDisplayDateTimeFormat(format: string): boolean {
        const dsSymbols = ['YYYY', 'MMM', 'YY', 'DD', 'MM', 'hh', 'HH', 'mm', 'ss', 'A'];
        for (let i = 0; i < dsSymbols.length; i++) {
            if (format.indexOf(dsSymbols[i]) > -1) {
                return true;
            }
        }
        return false;
    }

    public fromDisplayDateTimeFormatToFlatpickrFormat(displayFormat: string | undefined, checkFirst: boolean = false): string {
      if (!displayFormat) // shiyuan TODO: verify
      {
        return "";
      }
      if (checkFirst) {
            if (!this.isInDisplayDateTimeFormat(displayFormat)) {
                return displayFormat; // already converted or not convertable
            }
        }
        const cFormats = ['YYYY', 'MMM', 'YY', 'DD', 'MM', 'hh', 'HH', 'mm', 'ss', 'A', 'D', 'M'];
        const fFormats = ['Y', 'M', 'y', 'd', 'm', 'G', 'H', 'i', 'S', 'K', 'j', 'n'];
        let newFormat = displayFormat;
        for (let i = 0; i < cFormats.length; i++) {
            newFormat = newFormat.replace(new RegExp(cFormats[i], 'g'), '{' + i + '}');
        }
        for (let i = 0; i < cFormats.length; i++) {
            newFormat = newFormat.replace(new RegExp('\\{' + i + '\\}', 'g'), fFormats[i]);
        }
        return newFormat;
    }

    // public timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
    private referenceDate: Date;
    private TokensPatternRegex: string = "{/[^{}]+}";
    public supportedLanguages = ['ar', 'at', 'az', 'be', 'bg', 'bn', 'bs', 'cs', 'cy', 'da', 'de', 'eo', 'en',
        'es', 'et', 'fa', 'fi', 'fo', 'fr', 'ga', 'gr', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja',
        'ka', 'km', 'ko', 'kz', 'lt', 'lv', 'mk', 'mn', 'ms', 'my', 'nl', 'nn', 'no', 'pa', 'pl', 'pt', 'ro',
        'ru', 'si', 'sk', 'sl', 'sq', 'sr', 'sv', 'th', 'tr', 'uk', 'uz', 'vn', 'zh-hans', 'zh-hant'];

    constructor() {
        const today = new Date();
        this.referenceDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        this.TokensPatternRegex = "TokenPatternRegex" in window ? (window["TokenPatternRegex"] as string) : this.TokensPatternRegex;
    }

    public parse(info: {
        dateStr?: string | null;
        timeStr?: string | null;
        dateTimeStr?: string | null;
        dateFormat?: string | null;
        timeFormat?: string;
        dateTimeFormat?: string;
        language?: string;
        locale?: string
    }): Date | null {
         // Parse datetime if present
        if (info.dateTimeStr && info.dateTimeFormat) {

            const obj = df_parse(
                info.dateTimeStr,
                this.fromDisplayDateTimeFormatToUnicodeTokens(info.dateTimeFormat) || info.dateTimeFormat,
                this.referenceDate
            );

            const format = info.dateTimeFormat;

            return (info.language || info.locale) ?
                this.tryLocalizedParse(info.dateTimeStr, format, info.language, info.locale)
                : (df_isValid(obj) ? obj : null);
        }

        if (!info.dateStr && !info.timeStr) {
            return null;
        }

        let input = "", dateTimeFormat = "", timeless = true;
        // Construct dateTime: add date format
        if (info.dateStr && info.dateFormat) {
            input += info.dateStr;
            dateTimeFormat += info.dateFormat;
        }
        // construct dateTime: add time format
        if (info.timeStr && info.timeFormat) {
            if (info.timeStr.indexOf("-") > -1) {
                input = info.timeStr.substring(info.timeStr.indexOf(" ") + 1);
            } else {
                input += input ? " " + info.timeStr : info.timeStr;
            }
            dateTimeFormat += (dateTimeFormat ? " " : "") + info.timeFormat;
            timeless = false;
        }

        // Parse constructed dateTime
        if (input && dateTimeFormat) {
            const obj = df_parse(input, this.fromDisplayDateTimeFormatToUnicodeTokens(dateTimeFormat), this.referenceDate);

            return (info.language || info.locale) ?
                this.tryLocalizedParse(input, dateTimeFormat, info.language, info.locale, timeless)
                : (df_isValid(obj) ? obj : null);
        }
        return null;
    }

    public tryLocalizedParse(dateTime: string, format: string, language?: string, locale?: string, timeless?: boolean): Date | null {
        if (language) {
            // flatpickr.localize(this.getFlatpickrLocale(language));
            let dateObj = this.flatpickrParseDate(dateTime, this.fromDisplayDateTimeFormatToFlatpickrFormat(format), timeless, language);
            if (locale && !dateObj) {
                // flatpickr.localize(this.getFlatpickrLocale(locale));
                dateObj = this.flatpickrParseDate(dateTime, this.fromDisplayDateTimeFormatToFlatpickrFormat(format), timeless, locale);
                // flatpickr.localize(this.getFlatpickrLocale(language)); // set UI language back
            }
            return dateObj ? dateObj : null;
        }
        return null;
    }

    public format(info: {
        dateTimeObj: Date | null;
        dateFormat?: string | null;
        timeFormat?: string | null;
        dateTimeFormat?: string;
        language?: string;
    }): string {
        if (!info || !info.dateTimeObj) {
            return "";
        }

        if (info.dateTimeFormat) {
            if (info.dateTimeFormat.indexOf("s") === -1) {
                info.dateTimeObj.setSeconds(0);
            }
            return info.language ? this.flatpickrFormatDate(info.dateTimeObj, this.fromDisplayDateTimeFormatToFlatpickrFormat(info.dateTimeFormat), info.language)
                : df_format(info.dateTimeObj, info.dateTimeFormat);
        }

        let dateTimeFormat = "";
        if (info.dateFormat) {
            dateTimeFormat += info.dateFormat;
        }
        if (info.timeFormat) {
            dateTimeFormat +=
                (dateTimeFormat ? " " : "") + info.timeFormat;
            if (info.timeFormat.indexOf("s") === -1) {
                info.dateTimeObj.setSeconds(0);
            }
        }
        return dateTimeFormat ? (
            info.language ? this.flatpickrFormatDate(info.dateTimeObj, this.fromDisplayDateTimeFormatToFlatpickrFormat(dateTimeFormat), info.language)
                : (df_format(info.dateTimeObj, this.fromDisplayDateTimeFormatToUnicodeTokens(dateTimeFormat)))
        ) : "";
    }

    public flatpickrParseDate(date: DateOption, format?: string | undefined, timeless?: boolean |undefined, customLocale?: CustomLocale | string): Date | undefined {
        customLocale = typeof customLocale == "string" ? this.getFlatpickrLocale(customLocale) : customLocale;
        // return flatpickr.parseDate.apply(flatpickr, [date, format, timeless, customLocale]); //shiyuan TODO: see how customLocale is used
        return flatpickr.parseDate.apply(flatpickr, [date, format, timeless]);
    }

    public flatpickrFormatDate(date: Date, format: string, customLocale?: CustomLocale | string): string {
        customLocale = typeof customLocale == "string" ? this.getFlatpickrLocale(customLocale) : customLocale;
        // return flatpickr.formatDate.apply(flatpickr, [date, format, customLocale]); //shiyuan TODO: see how customLocale is used
        return flatpickr.formatDate.apply(flatpickr, [date, format]);
    }

    public isValid(date: Date): boolean {
        return df_isValid(date);
    }
    public isBefore(input1: Date, input2: Date): boolean {
        return df_isBefore(input1, input2);
    }
    public isAfter(input1: Date, input2: Date): boolean {
        return df_isAfter(input1, input2);
    }
    public isBetween(date: Date, start: Date, end: Date): boolean {
        return df_isWithinInterval(date, { start, end });
    }
    public isEqual(input1: Date, input2: Date): boolean {
        return df_isEqual(input1, input2);
    }
    public add(date: Date, duration: Duration) {
        return df_add(date, duration);
    }
    public addDays(date: Date, amount: number): Date {
        return df_addDays(date, amount);
    }
    public addMonths(date: Date, amount: number): Date {
        return df_addMonths(date, amount);
    }
    public addMilliseconds(date: Date, amount: number): Date {
        return df_addMilliseconds(date, amount);
    }
    public getMilliseconds(duration: Duration): number {
        return df_milliseconds(duration);
    }
    public isLeapYear(date: Date): boolean {
        return df_isLeapYear(date);
    }
    public tryParse(dateTimeStr: string, formats: string[]): Date | null {
        let date: Date | null = null;
        formats.forEach(f => {
            if (f === "ISO_8601") {
                date = df_parseISO(dateTimeStr);
            }
            else if (df_isMatch(dateTimeStr, this.fromDisplayDateTimeFormatToUnicodeTokens(f) || f)) {
                date = df_parse(dateTimeStr, this.fromDisplayDateTimeFormatToUnicodeTokens(f) || f, this.referenceDate);
            }
            if (date && df_isValid(date)) {
                // return false; // shiyuan TODO: verify why return false here
            }
            else {
                date = null;
            }
        });
        return date;
    }
    public createDateTimeWithOffset(tzOffset: number, date?: Date): Date {
        const d: Date = date ? date : new Date();
        const offset: number = d.getTimezoneOffset();
        if (tzOffset !== offset) {
            d.setTime(d.getTime() + (offset - tzOffset) * 60000);
        }
        return d;
    }
    public startOfDay(date: Date): Date {
        return df_startOfDay(date);
    }
    public endOfMonth(date: Date): Date {
        return df_endOfMonth(date);
    }
    public parseDuration(durationStr: string): Duration {
        const endDate = this.tryParse(durationStr, [
            "HH:mm:ss",
            "H:m:s",
            "hh:mm:ss a",
            "h:m:s a",
            "HH:mm",
            "H:m",
            "hh:mm a",
            "h:m a"
        ]);
        return df_intervalToDuration({
            start: df_startOfDay(this.referenceDate),
            end: endDate
        }); // shiyuan: how does the interface matches here?
    }
    public getWeek(
        date: Date,
        options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7 }
    ): number {
        return df_getWeek(date, options);
    }
    public getISOWeek(date: Date): number {
        return df_getISOWeek(date);
    }
    public differenceInYears(endDate: Date, startDate: Date) {
        return df_differenceInYears(endDate, startDate);
    }
    public differenceInMonths(endDate: Date, startDate: Date) {
        return df_differenceInMonths(endDate, startDate);
    }
    public differenceInDays(endDate: Date, startDate: Date) {
        return df_differenceInDays(endDate, startDate);
    }

    //-----------------
    createDateTimeObject(
      dateStr: string | undefined | null,
      dateFormat: string | undefined | null,
      timeStr?: string | null,
      timeFormat?: string): Date | null
    {
        return this.parse({ dateStr, dateFormat, timeStr, timeFormat });
    }

    generateDateTimeData(
        dateStr: string | null,
        dateFormat: string | null | undefined,
        dateTimeObj?: Date | null,
        timeStr?: string | null,
        timeFormat?: string |null
    ): StateDataDateTime {
        const result = { dateStr: "", timeStr: "", dateTimeObj };
        if (dateStr) {
            result.dateStr = dateTimeObj ? this.format({ dateTimeObj, dateFormat }) : dateStr;
        }
        if (timeStr) {
            result.timeStr = dateTimeObj ? this.format({ dateTimeObj, timeFormat }) : timeStr;
        }
        return result;
    }
    public createDataForDateTime(
        dataValue: string | null,
        settings: UniComponentSettings,
        config: UniComponentConfig,
        format?: string | null,
        defaultDateFormat?: string,
        defaultTimeFormat?: string
    ): StateDataDateTime
    {
      const fromDefault: boolean = typeof dataValue === "string";
        if (fromDefault) {
            // TO-REFACTOR:
            const { dateFormat, timeFormat, showTime, useCurrentDate, defaultDate, defaultTimeOfDate } = settings;
            let dateStr, timeStr = "";
            if (useCurrentDate) {

                // format using config.language
                const dateTimeObj = new Date();
                return {
                    dateStr: this.format({ dateTimeObj, dateFormat, language: config.language }),
                    timeStr: (showTime ? this.format({ dateTimeObj, timeFormat, language: config.language }) : ""),
                    dateTimeObj
                };
            } else {
                // parse using config.defaultDateLanguage
                const dateTimeObj = this.parse({
                    dateStr: defaultDate,
                    dateFormat: defaultDateFormat,
                    timeStr: defaultTimeOfDate,
                    timeFormat: defaultTimeFormat,
                    language: config.defaultDateLanguage,
                    locale: config.defaultDateLocale
                });

                // format using current language
                dateStr = settings.defaultDate
                    ? this.format({
                        dateTimeObj,
                        dateFormat,
                        language: config.language
                    }) : "";
                timeStr = settings.defaultTimeOfDate
                    ? this.format({
                        dateTimeObj: dateTimeObj,
                        timeFormat,
                        language: config.language
                    }) : "";

                return {
                    dateStr,
                    timeStr,
                    dateTimeObj
                };
            }

        } else {
            // parse using current language
            const dateTimeObj = this.parse({
                dateTimeStr: dataValue,
                dateTimeFormat: format
                    ? format
                    : settings.showTime
                        ? `${settings.dateFormat} ${settings.timeFormat}`
                        : settings.dateFormat,
                language: config.language,
                locale: config.locale
            });

            // format using current language
            return dateTimeObj
              ? {
                  dateStr: this.format({
                    dateTimeObj,
                    dateFormat: settings.dateFormat,
                    language: config.language,
                  }),
                  timeStr: settings.showTime
                    ? this.format({
                        dateTimeObj,
                        timeFormat: settings.timeFormat,
                        language: config.language,
                      })
                    : '',
                  dateTimeObj,
                }
              : { dateStr: '', timeStr: '', dateTimeObj: null };
        }
    }

    public generateGUID(): string {
        // Creating fake (but still pretty good) guid based on date
        let d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
            d += window.performance.now(); //use high-precision timer if available
        }
        const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    //----

    public getSupportedLanguages() {
        return this.supportedLanguages; // Add other supported/enabled languages here
    }

    public getDefaultSettings(): UniComponentSettings {
        return {
            // Input
            required: false, // * Common setting
            readOnly: false, // * Common setting
            fieldId: "",
            label: "",
            showLabel: true,

            // Options
            showTime: false, // * Common setting
            showTimeOnly: false, // * Common setting
            combinedDateTime: false,

            // Data
            acceptTokens: false, // * Common setting, default = false
            defaultDate: "",  // * Common setting
            defaultTimeOfDate: "",  // * Common setting
            dateFormat: "YYYY-MM-DD",  // * Common setting
            timeFormat: "hh:mm:ss A",  // * Common setting
            useCurrentDate: false, // * Common setting
            useCurrentTime: false, // * Common setting
            datePlaceholder: "YYYY-MM-DD",
            timePlaceholder: "hh:mm:ss A",

            // ReadOnly
            isAMPM: true,  // auto set
            isTwentyfour: false, // auto set
            capturedInBackend: false,

            // Style and Display
            minWidth: 440,
            minHeight: 26,
            padding: 0,

            // Validation
            min: "", // Revise
            max: "", // Revise
            customErrorMessages: {},
            errorTokens: [
                { value: "{_field_label}", settingName: "label" },
                { value: "{_max}", settingName: "max" },
                { value: "{_min}", settingName: "min" }
            ]

        }
    }

    public getDefaultConfig(): UniComponentConfig {
        return {
            // Input
            fieldIdPrefix: 'DATE_TIME',
            isDisplayOnly: false,  // * Common setting
            silent: false,

            // Data
            defaultDateFormat: 'YYYY-MM-DD',
            defaultTimeFormat: 'hh:mm:ss A',
            defaultDateTimeFormat: 'YYYY-MM-DD hh:mm:ss A',
            storedValueDateFormat: 'YYYY-MM-DD',
            storedValueTimeFormat: 'hh:mm:ss A',
            storedValueDateTimeFormat: '{DATE}T{TIME}',
            tokensPatternRegex: "{/[^{}]+}", // Forms style tokens, or %\([^\(\)]+\) for Workflow style tokens

            // Globalization
            locale: 'en-US',  // * Common setting
            language: 'en',  // * Common setting
            setDisplayFormatByLocale: false,  // * Common setting
            setDisplayFormatByLocaleSeconds: true,
            defaultDateLocale: 'en-US',
            defaultDateLanguage: 'en',
            storedValueLanguage: 'en',
            storedValueLocale: 'en-US',

            // Validation
            errorsPriorityOrder: [
                { errorType: 'required', mappedErrorType: 'required' },
                { errorType: 'invalidformat', mappedErrorType: 'invalidformat' },
                { errorType: 'min', mappedErrorType: 'range' },
                { errorType: 'max', mappedErrorType: 'range' },
                { errorType: 'range', mappedErrorType: 'range' },
            ]
        };
    }

    public getDefaultStrings(silent?: boolean) {
        if (!silent) {
            return {
                dateTimeCapturedInBackend: 'Date/Time is captured on submission',
                dateCapturedInBackend: 'Date is captured on submission',
                timeCapturedInBackend: 'Time is captured on submission',
                currentDate: 'Current Date',
                selectDate: 'Select date',
                currentTime: 'Current Time',
                selectTime: 'Select time',
            };
        } else {
            return {
                dateTimeCapturedInBackend: '',
                dateCapturedInBackend: '',
                timeCapturedInBackend: '',
                currentDate: '',
                selectDate: '',
                currentTime: '',
                selectTime: '',
            };
        }
    }

    private fixLocaleCase = function (locale: string, extractLanguageOnly: boolean = false): string {
      locale = locale.toLowerCase();

      // let language: string;
      // let region: string;
      // let parts: string[] = locale.split('-');
      // let specialCode: boolean = locale.startsWith('zh-');
      // if (!specialCode && parts.length > 2)
      // {
      //   return locale; // shiyuan TODO: how Grant's code treat the un-recognized format
      // }
      // if (specialCode) {
      //   language = parts[0] + '-' + parts[1].substring(0, 1).toUpperCase() + parts[1].substring(1);
      // }
      // else{
      //   language = parts[0];
      // }

      // if (extractLanguageOnly) {
      //   return language;
      // } else {

      //   region = !specialCode
      //     ?  parts[1].toUpperCase() :

      //       parts[2].toUpperCase()

      // }
      // return language + '-' + region;
      let parts = locale.split('-');
      if (extractLanguageOnly) {
          return (parts.length == 2 && parts[1] != 'hans' && parts[1] != 'hant') ? parts[0] :
              (parts.length == 3) ? parts[0] + '-' + parts[1].substring(0, 1).toUpperCase() + parts[1].substring(1) : locale;
      } else {
          return (parts.length == 2 && parts[1] != 'hans' && parts[1] != 'hant') ?
            parts[0] + '-' + parts[1].toUpperCase() :
              (parts.length == 3) ?
              parts[0] + '-' + parts[1].substring(0, 1).toUpperCase() + parts[1].substring(1) + '-' + parts[2].toUpperCase() :
               ('hans' || parts[1] != 'hant') ? parts[0] + '-' + parts[1].substring(0, 1).toUpperCase() + parts[1].substring(1) : locale;
      }
    }
    private getRegion = function (language: string): string
    {
      return '';
    }

    public getFormatByLocale(locale: string | undefined, formatType: FormatType, withSeconds: boolean = false): string {
      if (!locale)
      {
        locale = 'en-US';
      }
      locale = this.fixLocaleCase(locale);
      const localizedFormats = uniLocalizedFormats[locale] ? uniLocalizedFormats[locale] : uniLocalizedFormats['en-US'];
      switch (formatType) {
        case FormatType.DATE_FORMAT:
          return localizedFormats['DateFormat'];
        case FormatType.TIME_FORMAT:
          return withSeconds ? localizedFormats['TimeFormatWithSeconds'] : localizedFormats['TimeFormat'];
        case FormatType.DATETIME_FORMAT:
          return withSeconds
            ? localizedFormats['DateFormat'] + ' ' + localizedFormats['TimeFormatWithSeconds']
            : localizedFormats['DateFormat'] + ' ' + localizedFormats['TimeFormat'];
      }
    }

    public applyLocaleCorrections(language: string, locale: any) {
        locale.amPM = locale.amPM ? locale.amPM : FlatpickrLocales?.en?.amPM;
        // Add other corrections if any
        return locale;
    }

    public getFlatpickrLocale(localeString: string): any {
        let language = this.fixLocaleCase(localeString, true);
        switch (language) {
            case 'ar':
                return this.applyLocaleCorrections(language, FlatpickrLocales.ar);
            case 'es':
                return this.applyLocaleCorrections(language, FlatpickrLocales.es);
            case 'fr':
                return this.applyLocaleCorrections(language, FlatpickrLocales.fr);
            case 'pt':
                return this.applyLocaleCorrections(language, FlatpickrLocales.pt);
            case 'zh-hans':
                return this.applyLocaleCorrections(language, FlatpickrLocales.zhHans);
            case 'zh-hant':
                return this.applyLocaleCorrections(language, FlatpickrLocales.zhHant);
            case 'en':
            default:
                return FlatpickrLocales.en;
        }
    }

    public formatDateTimeForStoredValue(
      dateTime: Date | undefined | null,
      dateStr: string | undefined | null ,
      timeStr: string | undefined | null ,
      config: UniComponentConfig,
      combinedDateTime: boolean | undefined) : string | undefined | null {
        const storedValueDateFormat = config.storedValueDateFormat ? config.storedValueDateFormat : this.getFormatByLocale(config.storedValueLocale, FormatType.DATE_FORMAT, true);
        const storedValueTimeFormat = config.storedValueTimeFormat ? config.storedValueTimeFormat : this.getFormatByLocale(config.storedValueLocale, FormatType.TIME_FORMAT, true);
        const storedValueLanguage: string = config.storedValueLanguage? config.storedValueLanguage : this.getDefaultConfig().storedValueLanguage as string; // shiyuan TODO ask Alex if better way to handle the default config not null
        if (this.isToken(dateStr) || this.isToken(timeStr)) {
            if (!this.isToken(dateStr) && dateTime) {
                dateStr = this.flatpickrFormatDate(dateTime, this.fromDisplayDateTimeFormatToFlatpickrFormat(storedValueDateFormat), this.getFlatpickrLocale(storedValueLanguage))
            }
            if (!this.isToken(timeStr) && !combinedDateTime && dateTime) {
                timeStr = this.flatpickrFormatDate(dateTime, this.fromDisplayDateTimeFormatToFlatpickrFormat(storedValueTimeFormat), this.getFlatpickrLocale(storedValueLanguage))
            }

            if (combinedDateTime && !timeStr) {
                return dateStr;
            } else {
                return config.storedValueDateTimeFormat ?
                    config.storedValueDateTimeFormat.replace("{DATE}", dateStr? dateStr : "").replace("{TIME}", timeStr? timeStr : "")
                    : dateStr + " " + timeStr; // default to "{DATE} {TIME}" for backend if tokens are present
            }
        } else {
            if (!dateTime) {
                return "";
            }
            const storedValueFormat = config.storedValueDateTimeFormat ?
                config.storedValueDateTimeFormat.replace("{DATE}", storedValueDateFormat).replace("{TIME}", storedValueTimeFormat)
                : this.getFormatByLocale(config.storedValueLocale, FormatType.DATETIME_FORMAT, true);
            return this.flatpickrFormatDate(
              dateTime, this.fromDisplayDateTimeFormatToFlatpickrFormat(storedValueFormat), this.getFlatpickrLocale(storedValueLanguage));
        }
    }

    public setTokensPatternRegex(newPatternRegex: string) {
        this.TokensPatternRegex = newPatternRegex;
        (window as { [key: string]: any })["TokenPatternRegex"] = newPatternRegex;
    }

    public isToken(value: string | null | undefined) {
        const tokenRegex: RegExp = new RegExp(this.TokensPatternRegex, "g");
        return value && tokenRegex.test(value);
    }

    public removeTokens(value: string) {
        const tokenRegex: RegExp = new RegExp(this.TokensPatternRegex, "g");
        return value.replace(tokenRegex, "");
    }

    public hasTimeFormat(format: string) {
        return format.indexOf('G') == -1 && format.indexOf('H') == -1 && format.indexOf('h') == -1;
    }

}
