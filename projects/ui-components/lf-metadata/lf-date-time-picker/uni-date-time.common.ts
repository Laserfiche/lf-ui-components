// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AbstractControl } from '@angular/forms';

export enum UniControlType {
  'DateTime_date' = 'dateTime-date',
  'DateTime_time' = 'dateTime-time',
  'Time' = 'time',
  'DateTime' = 'dateTime',
}

export enum FormatType {
  DATE_FORMAT = 1,
  TIME_FORMAT = 2,
  DATETIME_FORMAT = 3,
  LONG_DATE_FORMAT = 4,
}

export type StateDataDateTime = {
  dateStr?: string | null;
  timeStr?: string | null;
  dateTimeObj?: Date | null;
};
export type StateDataTime = {
  timeStr: string;
  dateTimeObj?: Date;
};
export type StateData = StateDataDateTime;

export enum FormChangeEvent {
  // Revise, remove unused
  Blur = 'Blur', // when source is User
  Input = 'Input', // when source is User
  DateChange = 'DateChange',
  DateBlur = 'DateBlur',
  DateClose = 'DateClose',
  DateIconClick = 'DateIconClick',
  TimeIconClick = 'TimeIconClick',
  TimeChange = 'TimeChange',
  TimeBlur = 'TimeBlur',
  TimeClose = 'TimeClose',
}

export enum FormChangeSource {
  // Revise, remove unused
  User = 'User',
  InitializeComponent = 'InitializeComponent',
}

export interface UniState {
  data?: StateData;
  hidden?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  disableUseCurrentDateTime?: boolean;
  settings?: UniComponentSettings;
}

export interface UniComponentSettings {
  // Revise, remove unused
  fieldId?: string;
  required?: boolean;
  readOnly?: boolean;
  default?: unknown;
  acceptTokens?: boolean;
  label?: string;
  showLabel?: boolean;

  abstractControl?: AbstractControl;
  dateControlName?: string;
  timeControlName?: string;
  dateTimeControlName?: string;

  width?: number;
  maxWidth?: number;
  height?: number;
  maxHeight?: number;
  padding?: number;
  minWidth?: number;
  minHeight?: number;

  combinedDateTime?: boolean;
  capturedInBackend?: boolean;

  min?: string;
  max?: string;

  defaultDate?: string;
  defaultTimeOfDate?: string;
  dateFormat?: string;
  timeFormat?: string;
  isAMPM?: boolean;
  isTwentyfour?: boolean;
  useCurrentTime?: boolean;
  showTime?: boolean;
  showTimeOnly?: boolean;
  useCurrentDate?: boolean;
  datePlaceholder?: string;
  timePlaceholder?: string;

  customErrorMessages?: any;
  errorTokens?: { value: string; settingName: string }[];
}

export interface UniComponentConfig {
  defaultDateFormat?: string;
  defaultTimeFormat?: string;
  defaultDateTimeFormat?: string;
  storedValueDateFormat?: string;
  storedValueTimeFormat?: string;
  storedValueDateTimeFormat?: string;
  storedValueLocale?: string;
  storedValueLanguage?: string;
  tokensPatternRegex?: string;
  useBackendDateTimeForCurrentDateTime?: boolean;
  locale?: string;
  language?: string;
  defaultDateLocale?: string;
  defaultDateLanguage?: string;
  setDisplayFormatByLocale?: boolean;
  setDisplayFormatByLocaleSeconds?: boolean;
  isDisplayOnly?: boolean;
  errorsPriorityOrder?: any;
  fieldIdPrefix?: string;
  hasLongDateFormat?: boolean;

  formGroupValidators?: any;
  dateControlValidators?: any;
  timeControlValidators?: any;
  dateTimeControlValidators?: any;

  silent?: boolean;
}
