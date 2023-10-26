// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

export enum FieldType {
  DateTime = 'DateTime',
  Blob = 'Blob',
  Date = 'Date',
  ShortInteger = 'ShortInteger',
  LongInteger = 'LongInteger',
  List = 'List',
  Number = 'Number',
  String = 'String',
  Time = 'Time',
}

/** FieldFormat copied from Web Access */
export enum FieldFormat {
  None = 'None',
  ShortDate = 'ShortDate',
  LongDate = 'LongDate',
  ShortDateTime = 'ShortDateTime',
  LongDateTime = 'LongDateTime',
  ShortTime = 'ShortTime',
  LongTime = 'LongTime',
  GeneralNumber = 'GeneralNumber',
  Currency = 'Currency',
  Percent = 'Percent',
  Scientific = 'Scientific',
  Custom = 'Custom',
}

export enum RedirectBehavior {
  Replace = 'Replace',
  Popup = 'Popup',
  None = 'None'
}

export enum LoginState {
  LoggingIn = 'LoggingIn', // starting OAuth flow, previous state: LoggedOut, LoggedIn
  LoggedIn = 'LoggedIn',  // have tokens, previous state: LoggingIn
  LoggingOut = 'LoggingOut', // do have tokens, but getting rid of them, previous state: LoggedIn
  LoggedOut = 'LoggedOut' // don't have tokens, previous state: LoggingOut, LoggingIn
}

export enum LoginMode {
  'Button' = 'Button',
  'Menu' = 'Menu'
}
