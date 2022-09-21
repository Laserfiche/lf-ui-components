import { Injectable } from '@angular/core';
import { LfLocalizationService, StringUtils } from '@laserfiche/lf-js-utils';
import { combineLatest, Observable, Subject } from 'rxjs';
import { concatMap, map, startWith } from 'rxjs/operators';

/** @internal */
@Injectable({
  providedIn: 'root',
})
export class AppLocalizationService {
  resourceUrl = 'https://lfxstatic.com/npm/@laserfiche/lf-resource-library@4/resources/laserfiche-base';
  localizationService = new LfLocalizationService();
  internalGetString: Subject<void> = new Subject<void>();

  constructor() {
    window.addEventListener('message', async (ev: MessageEvent) => {
      if (ev.origin === window.origin) {
        try {
          const langData = ev.data;
          const langObj = JSON.parse(langData);
          if (langObj) {
            const language = langObj['lf-localization-service-set-language'];
            if (language) {
              await this.setLanguageAsync(language);
            }
          }
        }
        catch (err: any) {
          console.warn(`AppLocalizationService unable to parse message event: ${err.message}`);
        }
      }
      else {
        console.warn(`Origin does not match: event origin: ${ev.origin}, window origin: ${window.origin}`);
      }
    });
    this.localizationService.initResourcesFromUrlAsync(this.resourceUrl).then(() => {
      this.internalGetString.next();
    }).catch((err: any) => {
      console.error(err.message);
    });
  }

  async setLanguageAsync(language: string) {
    this.localizationService.setLanguage(language);
    await this.localizationService.initResourcesFromUrlAsync(this.resourceUrl);
    this.internalGetString.next();
  }

  languageChanged(): Observable<string | undefined> {
    const currentLanguage = this.localizationService.currentResource?.language;
    return this.internalGetString.pipe(startWith(currentLanguage), map(() => { return this.localizationService.currentResource?.language; }));
  }

  getStringObservable(key: string, params?: string[]): Observable<string> {
    const keyedString = this.localizationService.getString(key, params);
    return this.internalGetString.pipe(startWith(keyedString), map(() => {
      const newString = this.localizationService.getString(key, params);
      return newString;
    }));
  }

  getStringWithObservableParams(key: string, params?: Observable<string>[]): Observable<string> {
    const genericParams = params?.map((param, index) => {
      return `{${index}}`;
    });
    const translatedString = this.getStringObservable(key, genericParams);
    let latestParamsObs: Observable<string[]> | undefined;
    if (params) {
      latestParamsObs = combineLatest(params);
    }

    return translatedString.pipe(concatMap((stringToFormat) => {
      if (latestParamsObs) {
        const formattedString = latestParamsObs.pipe(map((latestParams) => {
          try {
            const newStringFormat = StringUtils.formatString(stringToFormat, latestParams);
            return newStringFormat;
          }
          catch (err: any) {
            console.warn('Unable to format string', err.message);
            return stringToFormat;
          }
        }));
        return formattedString;
      }
      return stringToFormat;
    }));
  }

  getString(key: string, params?: string[]): string {
    return this.localizationService.getString(key, params);
  }

}
