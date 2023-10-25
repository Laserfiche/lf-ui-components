// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Pipe, PipeTransform } from '@angular/core';
import { StringUtils } from '@laserfiche/lf-js-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Pipe that formats a string '{0} of {1}' with the given parameters
 */
@Pipe({
  name: 'lfFieldGroupIndexDisplay'
})
export class LfFieldGroupIndexDisplayPipe implements PipeTransform {

  constructor() { }

  /**
   * Formats the given string with the two expected params
   * @param res_0_of_1 Localized string in the form '{0} of {1}'
   * @param currentIndex The current index of the group (0-indexed)
   * @param totalNumber The total number of groups
   * @returns The string formatted with the given numbers. Adds one to the current index.
   * Returns undefined if the string does not contain 2 params
   */
  transform(res_0_of_1: Observable<string>, currentIndex: number, totalNumber: number,): Observable<string> {
    const stringObservable = res_0_of_1.pipe(map((stringToFormat) => {
      try {
        return StringUtils.formatString(stringToFormat, [(currentIndex + 1).toString(), totalNumber.toString()]);
      }
      catch (err: any) {
        console.warn('Unable to format string', err.message);
        return stringToFormat;
      }
    }));
    return stringObservable;
  }

}
