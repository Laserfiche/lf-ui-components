// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

// Core and essentials
import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  HostBinding,
  Input,
  AfterContentInit,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import forEach from 'lodash/forEach';
import isNil from 'lodash/isNil';
import cloneDeep from 'lodash/cloneDeep';

// Component dependencies
import {
  StateData,
  UniState,
  StateDataDateTime,
  StateDataTime,
  UniControlType,
  UniComponentSettings,
  UniComponentConfig,
  FormChangeEvent,
  FormChangeSource,
  FormatType,
} from './uni-date-time.common';
import { UniDateTimeService } from './uni-date-time.service';

// Flaticker
import flatpickr from 'flatpickr';
import { Instance } from 'flatpickr/dist/types/instance';
import { LFTimePickerPlugin } from './plugin-lfTimePicker';
import { LFDatePickerPlugin } from './plugin-lfDatePicker';

@Component({
    selector: 'lf-uni-date-time',
    templateUrl: './uni-date-time.component.html',
    styleUrls: ['./uni-date-time.component.less'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule]
})
export class UniDateTimeComponent implements OnInit, AfterViewInit, AfterContentInit {
  @HostBinding('class.required') isRequired = false;
  @HostBinding('class.readonly') isReadonly = false;
  @HostBinding('class.disabled') isDisabled = false;

  @Input() config!: UniComponentConfig;
  @Input() settings!: UniComponentSettings;
  @Input() customStrings?: {
    // Revise
    dateTimeCapturedInBackend?: string; // if useBackendDateTimeForCurrentDateTime=true, useCurrentDate: true, readOnly: true, showTime: true
    dateCapturedInBackend?: string; // if useBackendDateTimeForCurrentDateTime=true, useCurrentDate: true, readOnly: true
    timeCapturedInBackend?: string; // if useBackendDateTimeForCurrentDateTime=true, useCurrentTime: true, readOnly: true, showTimeOnly: true
    currentDate?: string; // if useCurrentDate: true, readOnly: true, isDisplayOnly: true
    selectDate?: string; // Date Icon tool tip
    currentTime?: string; // if useCurrentTime: true, readOnly: true, isDisplayOnly: true
    selectTime?: string; // Time Icon tool tip
  };

  // Copied from base
  @Input() componentId?: string;
  @Input() abstractControl?: AbstractControl;
  @Input() dateControlName?: string;
  @Input() timeControlName?: string;
  @Input() dateTimeControlName?: string;

  // Events // Revise
  @Output() valueChangedEventHandler: EventEmitter<{
    newValue: StateData;
    newState: UniState;
    controlType: UniControlType;
    source: FormChangeSource;
    event: FormChangeEvent;
    component: UniDateTimeComponent;
  }> = new EventEmitter();
  @Output() blurEventHandler: EventEmitter<{
    state: UniState;
    source: FormChangeSource;
    event: FormChangeEvent;
    component: UniDateTimeComponent;
  }> = new EventEmitter();
  @Output() dateIconClickEventHandler: EventEmitter<{
    state: UniState;
    event: FormChangeEvent;
    component: UniDateTimeComponent;
  }> = new EventEmitter();
  @Output() timeIconClickEventHandler: EventEmitter<{
    state: UniState;
    event: FormChangeEvent;
    component: UniDateTimeComponent;
  }> = new EventEmitter();

  // Revise
  state: UniState = {
    data: {
      dateStr: null,
      timeStr: null,
      dateTimeObj: null,
    },
    readonly: false,
    disabled: false,
    settings: {},
  };

  errorMessage = '';
  customErrorMessages: { [errorType: string]: string } = {};

  strings?: {
    dateTimeCapturedInBackend?: string;
    dateCapturedInBackend?: string;
    timeCapturedInBackend?: string;
    currentDate?: string;
    selectDate?: string;
    currentTime?: string;
    selectTime?: string;
  };

  showLoadingSpinner = false;

  date?: Instance;
  time?: Instance;
  defaultDateFormat: string = 'YYYY-MM-DD';
  defaultTimeFormat: string = 'hh:mm:ss A';
  defaultDateTimeFormat: string = 'YYYY-MM-DD hh:mm:ss A';

  dateControl?: FormControl<string | null>;
  timeControl?: FormControl<string | null>;
  dateTimeControl?: FormControl<string | null>;
  controls: {
    date?: FormControl<string | null>;
    time?: FormControl<string | null>;
    dateTime?: FormControl<string | null>;
  } = {};
  errorMessages?: { date?: string; time?: string; dateTime?: string }; // Revise
  showDateTimeErrorMessage = false; // Revise
  prevSettings!: UniComponentSettings;
  useBackendDateTimeForCurrentDateTime = false;
  minDateTime?: Date;
  minDateTimeStr?: string;
  minTime?: string; // HH:mm
  maxDateTime?: Date;
  maxDateTimeStr?: string;
  maxTime?: string; // HH:mm

  @ViewChild('dateDiv') dateDiv!: ElementRef;
  @ViewChild('timedateDiv') timedateDiv!: ElementRef;
  @ViewChild('dateTimeInput') dateTimeInput?: ElementRef;
  supportedLanguage = 'en';

  constructor(public dateTimeService: UniDateTimeService) { }

  ngOnInit() {
    this.populateConfig();
    this.populateStrings();
    this.populateSettings();
    this.state.settings = this.settings;

    if (!this.config.isDisplayOnly) {
      this.customErrorMessages = this.settings.customErrorMessages; // revise
    } else {
      const dateTimeData = this.dateTimeService.createDataForDateTime(
        null,
        this.settings,
        this.config,
        null,
        this.defaultDateFormat,
        this.defaultTimeFormat
      );
      const dateStr =
        dateTimeData.dateStr !== ''
          ? dateTimeData.dateStr
          : this.settings.defaultDate
            ? this.settings.defaultDate
            : null;
      const timeStr = dateTimeData.timeStr !== '' ? dateTimeData.timeStr : this.settings.defaultTimeOfDate;
      this.dateControl?.setValue(dateStr ?? null);
      this.timeControl?.setValue(timeStr ?? null);
      const formattedDateTime = this.dateTimeService.formatDateTimeForStoredValue(
        dateTimeData.dateTimeObj,
        dateStr,
        timeStr,
        this.config,
        this.settings.combinedDateTime
      );
      this.dateTimeControl?.setValue(formattedDateTime ? formattedDateTime : null);
    }
  }

  ngAfterViewInit() {
    if (!this.config.isDisplayOnly && !this.state.readonly) {
      this.localize(); // Also sets this.supportedLanguage

      //-- Setting up date
      let defaultDateToSet = '';
      if (this.settings.useCurrentDate) {
        defaultDateToSet = 'today';
      } else if (this.settings.defaultDate) {
        // Parse defaultDateformat using defaultDate language
        defaultDateToSet = this.settings.defaultDate;
        const parsedDefaultDate = this.dateTimeService.parse({
          dateStr: defaultDateToSet,
          dateFormat: this.config.defaultDateFormat,
          language: this.config.defaultDateLanguage,
        });
        // Format using current language
        defaultDateToSet = parsedDefaultDate
          ? this.dateTimeService.format({
            dateTimeObj: parsedDefaultDate,
            dateFormat: this.settings.dateFormat,
            language: this.config.language,
          })
          : defaultDateToSet;
      }
      const dateTimeData = this.state.data as StateDataDateTime;

      //-- Setting up time
      let defaultTimeToSet = '';
      this.prevSettings.showTime = this.settings.showTime;
      this.prevSettings.timeFormat = this.settings.timeFormat;

      if (this.settings.useCurrentTime) {
        if (!this.config.isDisplayOnly) {
          // format using current language
          defaultTimeToSet = this.dateTimeService.format({
            dateTimeObj: new Date(),
            timeFormat: this.settings.timeFormat,
            language: this.config.language,
          });
        }
      } else if (this.settings.defaultTimeOfDate) {
        // format using current language
        defaultTimeToSet = this.dateTimeService.format({
          // Parse using defaultDate language
          dateTimeObj: this.dateTimeService.parse({
            timeStr: this.settings.defaultTimeOfDate,
            timeFormat: this.defaultTimeFormat,
            language: this.config.defaultDateLanguage,
          }),
          timeFormat: this.settings.timeFormat,
          language: this.config.language,
        });
      }
      const timeData = this.state.data as StateDataTime;
      const defaultDate = isNil(dateTimeData?.dateStr) ? defaultDateToSet : dateTimeData.dateStr;
      const defaultTime = isNil(timeData?.timeStr) ? defaultTimeToSet : timeData?.timeStr;
      const timeFormatContainsSecond: boolean =
        !!this.settings.timeFormat && this.settings.timeFormat.indexOf('s') > -1;
      const hasAMPM: boolean = !!this.settings.timeFormat && this.settings.timeFormat.indexOf('A') > -1;
      //-- Setting up flatpickr elements
      if (!this.settings.showTimeOnly && this.dateDiv.nativeElement) {
        this.date = flatpickr(this.dateDiv.nativeElement, {
          locale: this.dateTimeService.getFlatpickrLocale(this.supportedLanguage),

          enableTime: this.settings.combinedDateTime, // if combined
          enableSeconds: this.settings.combinedDateTime && timeFormatContainsSecond,
          time_24hr: this.settings.combinedDateTime && !hasAMPM,

          allowInput: true,
          allowInvalidPreload: true,
          dateFormat: this.dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(
            this.settings.dateFormat + (this.settings.combinedDateTime ? ' ' + this.settings.timeFormat : ''), true
          ),
          defaultDate:
            defaultDate +
            (this.settings.combinedDateTime && defaultDate != 'today' && defaultTime ? ' ' + defaultTime : ''),
          plugins: [LFDatePickerPlugin()],
          onClose: (selectedDates: Date[], dateStr: string, instance: Instance) => {
            setTimeout(() => {
              this.onDateTimeChange(selectedDates[0], true, FormChangeEvent.DateClose);
              if (this.settings.combinedDateTime) {
                this.onDateTimeChange(selectedDates[0], true, FormChangeEvent.TimeClose);
              }
            }, 0);
          },
          onOpen: (selectedDates: Date[], dateStr: string, instance: Instance) => {
            this.onCalendarOpen(instance);
          },
          onReady: (selectedDates: Date[], dateStr: string, instance: Instance) => {
            this.addDaysContainerKeyboardHandler(selectedDates, instance);
          },
          wrap: true,
          minDate: this.minDateTime,
          maxDate: this.maxDateTime,
        });
      }

      if (this.settings.showTime && !this.settings.combinedDateTime && this.timedateDiv.nativeElement) {
        const flatpickrConfig = {
          locale: this.dateTimeService.getFlatpickrLocale(this.supportedLanguage),
          allowInput: true,
          enableTime: true,
          enableSeconds: timeFormatContainsSecond,
          noCalendar: true,
          time_24hr: !hasAMPM,
          defaultDate: defaultTime,
          plugins: [LFTimePickerPlugin()],
          onClose: (selectedDates: Date[], dateStr: string, instance: Instance) => {
            this.onDateTimeChange(selectedDates[0], false, FormChangeEvent.TimeClose);
          },
          onOpen: (selectedDates: Date[], dateStr: string, instance: Instance) => {
            this.onCalendarOpen(instance);
          },
          dateFormat: this.dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(this.settings.timeFormat ?? ''),
          wrap: true,
          minTime: this.minTime,
          maxTime: this.maxTime,
        };

        this.time = flatpickr(this.timedateDiv.nativeElement, flatpickrConfig);
      }

      // Update stored value
      setTimeout(() => {
        if (this.date) {
          this.dateControl?.setValue(this.date.input.value);
        }
        if (this.time) {
          this.timeControl?.setValue(this.time.input.value);
        }
        if (!this.settings.showTimeOnly) {
          this.processDateTimeValues(this.date?.input.value, true);
        } else {
          this.processDateTimeValues(this.time?.input.value, false);
        }
        this.state.readonly = this.settings.readOnly; // Revise
        this.isReadonly = this.settings.readOnly ? this.settings.readOnly : this.isReadonly;
        this.isRequired = this.settings.required ? this.settings.required : this.isRequired;
      }, 0);
    }
  }

  private onCalendarOpen(instance: Instance): void {
    setTimeout(() => {
      if (instance.daysContainer) {
        instance.monthElements[0].focus();
      } else if (instance.timeContainer) {
        instance.hourElement?.focus();
      } else {
        instance.input.focus();
      }
    }, 0);
  }

  private addDaysContainerKeyboardHandler(selectedDates: Date[], instance: Instance) {
    instance.calendarContainer?.addEventListener('keydown', function (event) {
      var currentDate = selectedDates[0] || instance.selectedDates[0] || new Date();
      if (event.target === instance.monthElements[0]) {
        monthsKeyDownHandler(currentDate, instance, event);
      } else if (event.target === instance.daysContainer) {
        daysContainerKeyDownHandler(currentDate, instance, event);
      } else if (instance.hourElement && event.target === instance.hourElement) {
        handleTabKeyPress(event, instance.daysContainer, instance.minuteElement);
      } else if (instance.minuteElement && event.target === instance.minuteElement) {
        handleTabKeyPress(event, instance.hourElement, instance.secondElement);
      } else if (instance.secondElement && event.target === instance.secondElement) {
        handleTabKeyPress(event, instance.minuteElement, instance.amPM);
      } else if (instance.amPM && event.target === instance.amPM) {
        handleTabKeyPress(event, instance.secondElement, instance.input);
        if (event.key === 'Tab') {
          instance.close();
        }
      }
    });

    const closePickerWithInputFocus = function (instance: Instance) {
      instance.input.focus();
      instance.close();
    };
    const addDaysToSelect = function (instance: Instance, currentDate: Date, daysToAdd: number) {
      currentDate.setDate(currentDate.getDate() + daysToAdd);
      instance.setDate(currentDate);
      instance.daysContainer?.focus();
    };
    const addMonthsToSelect = function (instance: Instance, currentDate: Date, monthsToAdd: number) {
      currentDate.setMonth(currentDate.getMonth() + monthsToAdd);
      instance.setDate(currentDate);
      instance.monthElements[0]?.focus();
    };
    const daysContainerKeyDownHandler = function (currentDate: Date, instance: Instance, daysKeyEvent: any) {
      if (daysKeyEvent.key === 'Tab') {
        daysKeyEvent.preventDefault();
        daysKeyEvent.stopPropagation();
        if (daysKeyEvent.shiftKey) {
          instance.monthElements[0]?.focus();
        } else {
          if (instance.hourElement) {
            instance.hourElement.focus();
          } else {
            closePickerWithInputFocus(instance);
          }
        }
      } else if (daysKeyEvent.key === 'ArrowLeft') {
        daysKeyEvent.preventDefault();
        addDaysToSelect(instance, currentDate, -1);
      } else if (daysKeyEvent.key === 'ArrowRight') {
        daysKeyEvent.preventDefault();
        addDaysToSelect(instance, currentDate, 1);
      } else if (daysKeyEvent.key === 'ArrowDown') {
        daysKeyEvent.preventDefault();
        addDaysToSelect(instance, currentDate, 7);
      } else if (daysKeyEvent.key === 'ArrowUp') {
        daysKeyEvent.preventDefault();
        addDaysToSelect(instance, currentDate, -7);
      } else if (daysKeyEvent.key === 'Shift') {
        daysKeyEvent.preventDefault();
        instance.daysContainer?.focus();
      } else if (daysKeyEvent.key === 'Enter') {
        daysKeyEvent.preventDefault();
        closePickerWithInputFocus(instance);
      }
    };

    const monthsKeyDownHandler = function (currentDate: Date, instance: Instance, monthsKeyEvent: any) {
      if (monthsKeyEvent.key === 'Tab') {
        monthsKeyEvent.preventDefault();
        monthsKeyEvent.stopPropagation();
        if (monthsKeyEvent.shiftKey) {
          closePickerWithInputFocus(instance);
        } else {
          setTimeout(() => instance.daysContainer?.focus());
        }
      } else if (monthsKeyEvent.key === 'ArrowDown' || monthsKeyEvent.key === 'ArrowRight') {
        monthsKeyEvent.preventDefault();
        addMonthsToSelect(instance, currentDate, 1);
      } else if (monthsKeyEvent.key === 'ArrowUp' || monthsKeyEvent.key === 'ArrowLeft') {
        monthsKeyEvent.preventDefault();
        addMonthsToSelect(instance, currentDate, -1);
      } else if (monthsKeyEvent.key === 'Enter') {
        monthsKeyEvent.preventDefault();
        closePickerWithInputFocus(instance);
      }
    };

    const handleTabKeyPress = function (
      event: KeyboardEvent,
      previousElement?: HTMLElement,
      nextElement?: HTMLElement
    ) {
      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          previousElement?.focus();
        } else {
          nextElement?.focus();
        }
      }
    };
  }

  ngAfterContentInit() {
    if (!this.config.isDisplayOnly) {
      this.assignMinMaxForPicker(this.state); // Revise
    }
  }

  private populateSettings() {
    if (!this.settings) {
      // Default Settings
      this.settings = this.dateTimeService.getDefaultSettings();
      this.prevSettings = this.settings;
    } else {
      if (!this.prevSettings) {
        this.prevSettings = this.settings; // initially prevSetting = settings from input
      }
      this.settings = { ...this.dateTimeService.getDefaultSettings(), ...this.settings };
    }

    if (!this.componentId) {
      this.componentId = this.dateTimeService.generateGUID(); // Revise
    }

    if (!this.settings.fieldId) {
      this.settings.fieldId = this.config.fieldIdPrefix + this.componentId;
    }

    if (this.settings.abstractControl instanceof AbstractControl && !this.abstractControl) {
      this.abstractControl = this.settings.abstractControl;
      if (this.settings.dateControlName) {
        this.dateControlName = this.settings.dateControlName;
      }
      if (this.settings.timeControlName) {
        this.timeControlName = this.settings.timeControlName;
      }
      if (this.settings.dateTimeControlName) {
        this.dateTimeControlName = this.settings.dateTimeControlName;
      }
    }

    this.assignSubAbstractControl();
    if (this.config.isDisplayOnly) {
      this.dateControl?.disable();
      this.timeControl?.disable();
    }

    if (this.config.setDisplayFormatByLocale == true) {
      this.localizeFormat();
    }

    // this.state.readonly = this.settings.readOnly; // Revise

    this.autoCorrectSettings();
    this.settings.capturedInBackend =
      (this.settings.useCurrentDate || this.settings.useCurrentTime) &&
      this.useBackendDateTimeForCurrentDateTime &&
      !this.state.disableUseCurrentDateTime &&
      (this.settings.readOnly || this.state.readonly);
  }

  private autoCorrectSettings() {
    //-- auto correct and override settings

    // This is useful for Forms where field is readonly and value should be captured on submission
    this.settings.capturedInBackend =
      (this.settings.useCurrentDate || this.settings.useCurrentTime) &&
      this.useBackendDateTimeForCurrentDateTime &&
      !this.state.disableUseCurrentDateTime &&
      ((this.config.isDisplayOnly && this.settings.readOnly) || this.state.readonly);

    // showTimeOnly overrides showTime if true
    if (this.settings.showTimeOnly) {
      this.settings.showTime = true;
    }

    // combinedDateTime overrides showTime and showTimeOnly if true
    if (this.settings.combinedDateTime) {
      this.settings.showTime = true;
      this.settings.showTimeOnly = false;
    }

    // placeholders are copied from display date/time format settings
    if (this.settings.datePlaceholder == this.prevSettings.datePlaceholder) {
      this.settings.datePlaceholder = this.settings.dateFormat;
    }

    if (this.settings.timePlaceholder == this.prevSettings.timePlaceholder) {
      this.settings.timePlaceholder = this.settings.timeFormat;
    }

    if (this.settings.combinedDateTime) {
      this.settings.datePlaceholder = this.settings.dateFormat + ' ' + this.settings.timeFormat;
    }

    // For information only
    // Adjust 24h
    const hasAMPM = !!this.settings.timeFormat && this.settings.timeFormat.indexOf('A') > -1;
    this.settings.isAMPM = hasAMPM;
    this.settings.isTwentyfour = !hasAMPM;
  }

  private populateConfig() {
    this.config = !this.config
      ? this.dateTimeService.getDefaultConfig()
      : { ...this.dateTimeService.getDefaultConfig(), ...this.config };
    if (this.config.defaultDateFormat) {
      this.defaultDateFormat = this.config.defaultDateFormat;
    }
    if (this.config.defaultTimeFormat) {
      this.defaultTimeFormat = this.config.defaultTimeFormat;
    }
    if (this.config.defaultDateTimeFormat) {
      this.defaultDateTimeFormat = this.config.defaultDateTimeFormat;
    }

    if (this.config.tokensPatternRegex) {
      this.dateTimeService.setTokensPatternRegex(this.config.tokensPatternRegex);
    }

    this.useBackendDateTimeForCurrentDateTime = this.config.useBackendDateTimeForCurrentDateTime
      ? this.config.useBackendDateTimeForCurrentDateTime
      : false;
  }

  public populateStrings() {
    this.strings =
      !this.strings || this.config.silent
        ? this.dateTimeService.getDefaultStrings(this.config.silent)
        : { ...this.dateTimeService.getDefaultStrings(this.config.silent), ...this.strings };
    this.strings =
      !this.customStrings || this.config.silent ? this.strings : { ...this.strings, ...this.customStrings };
  }

  // Revise
  processInternalTokens(message: string, options?: { min?: string; max?: string }): string {
    forEach(this.settings.errorTokens, (token) => {
      const regex = new RegExp(token.value, 'g');
      let strToReplace = '';
      if (!this.settings.showTimeOnly) {
        if (options && options.min && options.max) {
          if (token.settingName === 'min') {
            strToReplace = options.min;
          } else if (token.settingName === 'max') {
            strToReplace = options.max;
          } else {
            strToReplace = (this.settings as any)[token.settingName];
          }
        } else {
          strToReplace = (this.settings as any)[token.settingName];
        }
      } else {
        strToReplace = (this.settings as any)[token.settingName];
      }
      message = message.replace(regex, strToReplace);
    });
    return message;
  }

  // validate external tokens in values, remove if not accepted
  substituteTokens(value: string, keepIfAccepted: boolean): string {
    const isToken = this.dateTimeService.isToken(value);
    value =
      isToken && keepIfAccepted
        ? this.settings.acceptTokens
          ? value
          : this.dateTimeService.removeTokens(value) // keep token string only if we accept tokens
        : isToken && !keepIfAccepted
          ? this.dateTimeService.removeTokens(value) // remove tokens if not accepted
          : value; // keep value as-is if no tokens
    return value ? value.trim() : '';
  }
  // Revise
  onBlurWithKey(key: string) {
    setTimeout(() => {
      this.markAsTouched(key);
      this.updateErrorDisplay();
      const picker = key === 'date' ? this.date : this.time;
      this.onDateTimeChange(
        picker ? picker.latestSelectedDateObj : (this.state.data as StateDataDateTime).dateTimeObj,
        key === 'date',
        key === 'date' ? FormChangeEvent.DateBlur : FormChangeEvent.TimeBlur
      );
      this.blurEventHandler.emit({
        state: this.state,
        source: FormChangeSource.User,
        event: key === 'date' ? FormChangeEvent.DateBlur : FormChangeEvent.TimeBlur,
        component: this,
      });
    });
  }

  onIconClick(iconType: string) {
    switch (iconType) {
      case 'date':
        this.dateIconClickEventHandler.emit({
          state: this.state,
          event: FormChangeEvent.DateIconClick,
          component: this,
        });
        break;
      case 'time':
        this.timeIconClickEventHandler.emit({
          state: this.state,
          event: FormChangeEvent.TimeIconClick,
          component: this,
        });
        break;
    }
  }

  processDateTimeValues(value: string | Date | undefined | null, isDate: boolean) {
    let v = value ? value : null;

    if (this.settings.acceptTokens) {
      if (this.config.tokensPatternRegex) {
        this.dateTimeService.setTokensPatternRegex(this.config.tokensPatternRegex);
      }
      if (isDate && this.date) {
        if (this.dateTimeService.isToken(this.date.input.value)) {
          v = this.date.input.value;
        }
      } else if (this.time) {
        if (this.dateTimeService.isToken(this.time.input.value)) {
          v = this.time.input.value;
        }
      }
    }

    let result: { dateStr: string; timeStr: string; dateTimeObj: Date | undefined | null },
      dateStr: string | undefined | null,
      timeStr: string | undefined | null,
      dateTimeObj: Date | undefined | null;
    const { timeFormat, dateFormat, showTime, combinedDateTime } = this.settings;
    const { dateStr: oldDateStr, timeStr: oldTimeStr } = this.state.data as StateDataDateTime;

    if (showTime) {
      if (typeof v === 'string') {
        dateStr = isDate ? v : oldDateStr;
        timeStr = isDate ? oldTimeStr : v;
      } else {
        // format using current language
        dateStr = isDate
          ? this.dateTimeService.format({ dateTimeObj: v, dateFormat, language: this.config.language })
          : oldDateStr;
        timeStr =
          isDate && !combinedDateTime
            ? oldTimeStr
            : this.dateTimeService.format({ dateTimeObj: v, timeFormat, language: this.config.language });
      }

      if (combinedDateTime) {
        // parse using current language
        dateTimeObj =
          dateStr || timeStr
            ? this.dateTimeService.parse({
              dateTimeStr:
                (dateStr ? this.substituteTokens(dateStr, false) : '') +
                (timeStr ? ' ' + this.substituteTokens(timeStr, false) : ''),
              dateTimeFormat: dateFormat + (timeStr ? ' ' + timeFormat : ''),
              language: this.config.language,
            })
            : null;
      } else {
        // parse using current language
        dateTimeObj =
          dateStr || timeStr
            ? this.dateTimeService.parse({
              dateStr: dateStr ? this.substituteTokens(dateStr, false) : '',
              timeStr: timeStr ? this.substituteTokens(timeStr, false) : '',
              dateFormat,
              timeFormat,
              language: this.config.language,
            })
            : null;
      }

      dateStr = dateStr ? this.substituteTokens(dateStr, true) : '';
      timeStr = timeStr ? this.substituteTokens(timeStr, true) : '';
      const formatDateStr = dateTimeObj && dateStr && !this.dateTimeService.isToken(dateStr);
      const formatTimeStr =
        combinedDateTime && this.dateTimeService.isToken(dateStr)
          ? false
          : dateTimeObj && timeStr && !this.dateTimeService.isToken(timeStr);

      // format using current language
      result = {
        dateTimeObj,
        dateStr: formatDateStr
          ? this.dateTimeService.format({ dateTimeObj, dateFormat, language: this.config.language })
          : this.dateTimeService.isToken(dateStr)
            ? dateStr
            : '',
        timeStr: formatTimeStr
          ? this.dateTimeService.format({ dateTimeObj, timeFormat, language: this.config.language })
          : this.dateTimeService.isToken(timeStr)
            ? timeStr
            : '',
      };
    } else {
      // isDate must be true
      if (typeof v === 'string') {
        // parse using current language
        dateTimeObj =
          v && !this.dateTimeService.isToken(dateStr)
            ? this.dateTimeService.parse({ dateStr: v, dateFormat, language: this.config.language })
            : null;
      } else {
        dateTimeObj = v;
      }
      dateStr = dateStr ? this.substituteTokens(dateStr, true) : '';
      // format using current language
      result = {
        dateStr:
          dateTimeObj && !this.dateTimeService.isToken(dateStr)
            ? this.dateTimeService.format({ dateTimeObj, dateFormat, language: this.config.language })
            : this.dateTimeService.isToken(dateStr)
              ? dateStr
              : '',
        timeStr: '',
        dateTimeObj,
      };
    }
    const formattedDateTime = this.dateTimeService.formatDateTimeForStoredValue(
      result.dateTimeObj,
      result.dateStr,
      result.timeStr,
      this.config,
      this.settings.combinedDateTime
    );
    this.dateTimeControl?.setValue(formattedDateTime ? formattedDateTime : null);

    return result;
  }

  // Revise
  onDateTimeChange(value: string | Date | undefined | null, isDate: boolean, event: FormChangeEvent) {
    if (this.state.readonly || this.state.disabled) {
      return;
    }

    const result = this.processDateTimeValues(value, isDate);

    // emit event?
    const controlType = this.settings.combinedDateTime
      ? UniControlType.DateTime
      : isDate
        ? UniControlType.DateTime_date
        : this.settings.showTimeOnly
          ? UniControlType.Time
          : UniControlType.DateTime_time;

    const newState = cloneDeep(this.state);
    newState.data = result;
    this.updateErrorDisplay();
    this.state.data = result;
    this.valueChangedEventHandler.emit({
      newValue: result,
      newState: newState,
      controlType: controlType,
      source: FormChangeSource.User,
      event: event,
      component: this,
    });
  }

  // Revise
  assignSubAbstractControl() {
    this.dateControlName = this.dateControlName
      ? this.dateControlName
      : `${this.componentId}-${UniControlType.DateTime_date}`;
    this.timeControlName = this.timeControlName
      ? this.timeControlName
      : `${this.componentId}-${UniControlType.DateTime_time}`;
    this.dateTimeControlName = this.dateTimeControlName
      ? this.dateTimeControlName
      : `${this.componentId}-${UniControlType.DateTime}`;

    if (!this.abstractControl) {
      const defaultControls = {};
      (defaultControls as any)[this.dateControlName] = new FormControl();
      (defaultControls as any)[this.timeControlName] = new FormControl();
      (defaultControls as any)[this.dateTimeControlName] = new FormControl();

      this.abstractControl = new FormGroup(defaultControls);
    }

    this.dateControl = this.getControl(this.dateControlName) as FormControl<string | null>;
    this.timeControl = this.getControl(this.timeControlName) as FormControl<string | null>;
    this.dateTimeControl = this.getControl(this.dateTimeControlName) as FormControl<string | null>;

    this.controls.date = this.dateControl;
    this.controls.time = this.timeControl;
    this.controls.dateTime = this.dateTimeControl;

    // ToDo: add default self-validators

    if (this.config.formGroupValidators) {
      this.abstractControl.setValidators(this.config.formGroupValidators);
      this.abstractControl.updateValueAndValidity();
    }

    if (this.config.dateControlValidators) {
      this.controls.date.setValidators(this.config.dateControlValidators);
      this.controls.date.updateValueAndValidity();
    }
    if (this.config.timeControlValidators) {
      this.controls.time.setValidators(this.config.timeControlValidators);
      this.controls.time.updateValueAndValidity();
    }
    if (this.config.dateTimeControlValidators) {
      this.controls.dateTime.setValidators(this.config.dateTimeControlValidators);
      this.controls.dateTime.updateValueAndValidity();
    }
  }

  private getControl(controlName: string) {
    let control: any;
    try {
      control = this.abstractControl?.get(controlName) as FormControl<string | null>;
    } catch (ex) {
      console.log('Could not locate control ' + controlName);
    }
    if (!control) {
      control = new FormControl();
    }
    return control;
  }

  private assignMinMaxForPicker(state: UniState) {
    // Revise
    if (state.settings?.min) {
      if (this.minDateTimeStr !== state.settings.min) {
        const minDateTimeObj = this.dateTimeService.tryParse(state.settings.min as string, [
          this.defaultDateTimeFormat,
          this.defaultDateFormat,
          this.defaultTimeFormat,
        ]);
        // const minTimeObj = this.dateTimeService.tryParse(state.settings.min as string, [this.defaultTimeFormat]);
        if (minDateTimeObj && !state.settings.showTimeOnly) {
          if (this.date) {
            this.date.set('minDate', minDateTimeObj);
          }
          if (state.settings.showTime && !state.settings.combinedDateTime) {
            // Known limitation: time min/max is not validated if split pickers
            // ToDo: enforce time limit when pickers are split!
          }
          this.minDateTime = minDateTimeObj;
          this.minDateTimeStr = state.settings.min as string;
        }
        if (minDateTimeObj && state.settings.showTimeOnly) {
          if (this.time) {
            this.time.set('minTime', minDateTimeObj);
          }
          this.minTime = this.dateTimeService.format({ dateTimeObj: minDateTimeObj, timeFormat: 'HH:mm' });
        }
      }
    } else {
      if (this.date && this.minDateTimeStr) {
        this.date.set('minDate', '');
      }
      if (this.time && this.minDateTimeStr) {
        this.time.set('minTime', '');
      }
      this.minDateTime = undefined;
      this.minDateTimeStr = '';
      this.minTime = '';
    }
    if (state.settings?.max) {
      if (this.maxDateTimeStr !== state.settings.max) {
        const maxDateTimeObj = this.dateTimeService.tryParse(state.settings.max as string, [
          this.defaultDateTimeFormat,
          this.defaultDateFormat,
          this.defaultTimeFormat,
        ]);
        if (maxDateTimeObj && !state.settings.showTimeOnly) {
          if (this.date) {
            this.date.set('maxDate', maxDateTimeObj);
          }
          if (state.settings.showTime && !state.settings.combinedDateTime) {
            // Known limitation: time min/max is not validated if split pickers
            // ToDo: enforce time limit when pickers are split!
          }
          this.maxDateTime = maxDateTimeObj;
          this.maxDateTimeStr = state.settings.max as string;
        }
        if (maxDateTimeObj && state.settings.showTimeOnly) {
          if (this.time) {
            this.time.set('maxTime', maxDateTimeObj);
          }
          this.maxTime = this.dateTimeService.format({ dateTimeObj: maxDateTimeObj, timeFormat: 'HH:mm' });
        }
      }
    } else {
      if (this.date && this.maxDateTimeStr) {
        this.date.set('maxDate', '');
      }
      if (this.time && this.maxDateTimeStr) {
        this.time.set('maxTime', '');
      }
      this.maxDateTime = undefined;
      this.maxDateTimeStr = '';
      this.maxTime = '';
    }
  }

  //--
  getErrorTypeWithHighestPriority(abstractControl: AbstractControl): string {
    // Revise
    const errorsPriority = this.config.errorsPriorityOrder;
    if (abstractControl.errors) {
      const errorTypes = Object.keys(abstractControl.errors);
      if (errorTypes.length > 1) {
        for (let orderIndex = 0; orderIndex < errorsPriority.length; orderIndex++) {
          const errorType = errorsPriority[orderIndex].errorType;
          const mappedErrorType = errorsPriority[orderIndex].mappedErrorType;
          if (abstractControl.errors[errorType]) {
            return mappedErrorType;
          }
        }
      }
      return errorTypes[0];
    }
    return '';
  }

  getDefaultErrorMessage(errorType: string, settings: UniComponentSettings) {
    let message = '';
    const params = {
      min: settings.min,
      max: settings.max,
    };
    const errorTypeKey = errorType as keyof typeof this.dateTimeService.defaultErrorMessages;
    if (errorTypeKey in this.dateTimeService.defaultErrorMessages) {
      message = this.dateTimeService.defaultErrorMessages[errorTypeKey](params);
    }
    return message;
  }

  updateErrorDisplay() {
    // Revise
    this.errorMessages = { date: '', time: '', dateTime: '' };
    if (!this.config.silent) {
      forEach(this.controls, (control?: FormControl<string | null>, key?: string) => {
        if (control && control.touched && control.invalid) {
          const errorType = this.getErrorTypeWithHighestPriority(control);
          let message = errorType ? this.customErrorMessages[errorType] : '';
          if (!message) {
            message = this.getDefaultErrorMessage(errorType, this.settings);
          } else {
            const min = this.settings.min?.trim();
            const max = this.settings.max?.trim();
            message = this.processInternalTokens(message, { min, max });
          }
          if (this.errorMessages && key && key in this.errorMessages) {
            this.errorMessages[key as keyof typeof this.errorMessages] = message;
          }
        }
      });
    }
  }

  markAsTouched(key?: string) {
    if (key && this.controls[key as keyof typeof this.controls]) {
      this.controls[key as keyof typeof this.controls]?.markAsTouched();
      this.controls.dateTime?.markAsTouched();
    } else {
      forEach(this.controls, (control?: FormControl<string | null>, key?: string) => {
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  // Set flatpickr UI language
  private localize() {
    // en is default
    const supportedLanguages = this.dateTimeService.getSupportedLanguages();
    const langLCase = this.config.language?.toLowerCase();
    let langShort = langLCase?.substring(0, 2);

    langShort = langShort == 'zh' && langLCase && langLCase.length > 2 ? langLCase.substring(0, 7) : langShort;

    this.supportedLanguage =
      langLCase && supportedLanguages.indexOf(langLCase) > -1
        ? langLCase
        : langShort && supportedLanguages.indexOf(langShort) > -1
          ? langShort
          : 'en';
    flatpickr.localize(this.dateTimeService.getFlatpickrLocale(this.supportedLanguage));
  }

  // Set flatpickr date/time format based on locale
  public localizeFormat(locale?: string, withSeconds?: boolean) {
    locale = locale ? locale : this.config.locale;
    withSeconds = withSeconds ? withSeconds : this.config.setDisplayFormatByLocaleSeconds;

    const dateFormatType = this.config.hasLongDateFormat ? FormatType.LONG_DATE_FORMAT : FormatType.DATE_FORMAT;
    const dateFormat = this.dateTimeService.getFormatByLocale(locale, dateFormatType);
    const timeFormat = this.dateTimeService.getFormatByLocale(locale, FormatType.TIME_FORMAT, withSeconds);
    // const dateTimeFormat = this.dateTimeService.getFormatByLocale(locale, FormatType.DATETIME_FORMAT, withSeconds);

    // ToDo?: convert from old to new

    // Set new format
    this.settings.dateFormat = dateFormat;
    this.settings.timeFormat = timeFormat;
    this.settings.datePlaceholder = dateFormat;
    this.settings.timePlaceholder = timeFormat;

    // Adjust 24h
    const hasAMPM = timeFormat.indexOf('A') > -1;
    this.settings.isAMPM = hasAMPM;
    this.settings.isTwentyfour = !hasAMPM;

    // Apply on existing controls // Revise
    if (this.date && this.config.isDisplayOnly) {
      this.dateDiv.nativeElement.flatpickr({
        enableSeconds: this.settings.combinedDateTime && timeFormat.indexOf('s') > -1,
        time_24hr: this.settings.combinedDateTime && !hasAMPM, // Revise
        dateFormat: this.dateTimeService.fromDisplayDateTimeFormatToFlatpickrFormat(dateFormat),
        locale: this.dateTimeService.getFlatpickrLocale(this.supportedLanguage),
      });
    }

    if (this.time && this.config.isDisplayOnly) {
      this.timedateDiv.nativeElement.flatpickr({
        enableSeconds: timeFormat.indexOf('s') > -1,
        time_24hr: !hasAMPM, // Revise
        dateFormat: timeFormat,
        locale: this.dateTimeService.getFlatpickrLocale(this.supportedLanguage),
      });
    }
  }

  // Helpers
  getCombinedStyles(settings: UniComponentSettings | undefined) {
    settings = settings ? settings : this.settings;
    let style = '';

    style += settings.padding ? 'padding: ' + settings.padding + 'px; ' : '';
    style += settings.height ? 'height: ' + settings.height + 'px; ' : '';
    style += settings.width ? 'width:  ' + settings.width + 'px;' : '';
    style += settings.maxHeight ? 'max-height: ' + settings.maxHeight + 'px; ' : '';
    style += settings.maxWidth ? 'max-width:  ' + settings.maxWidth + 'px;' : '';

    return style;
  }
}
