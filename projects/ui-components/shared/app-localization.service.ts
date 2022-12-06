import { Injectable } from '@angular/core';
import { LfLocalizationService, StringUtils } from '@laserfiche/lf-js-utils';
import { combineLatest, Observable, Subject } from 'rxjs';
import { concatMap, map, startWith } from 'rxjs/operators';
import * as strings_ar from './strings/ar.json';
import * as strings_en from './strings/en.json';
import * as strings_es from './strings/es.json';
import * as strings_fr from './strings/fr.json';
import * as strings_it from './strings/it.json';
import * as strings_ptBR from './strings/pt-BR.json';
import * as strings_th from './strings/th.json';
import * as strings_zhHans from './strings/zh-Hans.json';
import * as strings_zhHant from './strings/zh-Hant.json';

/** @internal */
@Injectable({
  providedIn: 'root',
})
export class AppLocalizationService {
  resourceUrl = 'https://lfxstatic.com/npm/@laserfiche/lf-resource-library@4/resources/laserfiche-base';

  localResources: Map<string, object> = new Map<string, object>([
    ['ar-EG', (strings_ar as any).default],
    ['en-US', (strings_en as any).default],
    ['es-MX', (strings_es as any).default],
    ['fr-FR', (strings_fr as any).default],
    ['it-IT', (strings_it as any).default],
    ['pt-BR', (strings_ptBR as any).default],
    ['th-TH', (strings_th as any).default],
    ['zh-Hans', (strings_zhHans as any).default],
    ['zh-Hant', (strings_zhHant as any).default],
  ]);

  localLocalizationService = new LfLocalizationService(this.localResources);
  remoteLocalizationService = new LfLocalizationService();
  internalGetString: Subject<void> = new Subject<void>();

  constructor() {
    window.addEventListener('message', async (ev: MessageEvent) => {
      if (ev.origin === window.origin) {
        try {
          const langData = ev.data;
          const langObj = JSON.parse(langData);
          if (langObj) {
            const language = langObj['lf-localization-service-set-language'];
            const debug = langObj['lf-localization-service-debug-mode'];
            if (language) {
              await this.setLanguageAsync(language);
            }
            if (debug !== undefined) {
              this.remoteLocalizationService.debugMode = debug;
              this.localLocalizationService.debugMode = debug;
              this.internalGetString.next();
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
    this.remoteLocalizationService.initResourcesFromUrlAsync(this.resourceUrl).then(() => {
      this.internalGetString.next();
    }).catch((err: any) => {
      console.error(err.message);
    });
  }

  async setLanguageAsync(language: string) {
    this.remoteLocalizationService.setLanguage(language);
    this.localLocalizationService.setLanguage(language);
    await this.remoteLocalizationService.initResourcesFromUrlAsync(this.resourceUrl);
    this.internalGetString.next();
  }

  languageChanged(): Observable<string | undefined> {
    const currentLanguage = this.remoteLocalizationService.currentResource?.language;
    return this.internalGetString.pipe(startWith(currentLanguage), map(() => { return this.remoteLocalizationService.currentResource?.language; }));
  }

  getStringLaserficheObservable(key: string, params?: string[]): Observable<string> {
    const keyedString = this.getResourceStringLaserfiche(key, params);
    return this.internalGetString.pipe(
      startWith(keyedString),
      map(() => {
        const newString = this.getResourceStringLaserfiche(key, params);
        return newString;
      })
    );
  }

  getStringComponentsObservable(key: string, params?: string[]): Observable<string> {
    const keyedString = this.getResourceStringComponents(key, params);
    return this.internalGetString.pipe(
      startWith(keyedString),
      map(() => {
        const newString = this.getResourceStringComponents(key, params);
        return newString;
      })
    );
  }

  getStringLaserficheWithObservableParams(key: string, params?: Observable<string>[]): Observable<string> {
    const genericParams = params?.map((param, index) => {
      return `{${index}}`;
    });
    const translatedString = this.getStringLaserficheObservable(key, genericParams);
    const toReturn = this.addParamsToString(params, translatedString);
    return toReturn;
  }

  getStringComponentsWithObservableParams(key: string, params?: Observable<string>[]): Observable<string> {
    const genericParams = params?.map((param, index) => {
      return `{${index}}`;
    });
    const translatedString = this.getStringComponentsObservable(key, genericParams);
    const observableString = this.addParamsToString(params, translatedString);
    return observableString;
  }

  getResourceStringLaserfiche(key: string, params?: string[]): string {
    return this.remoteLocalizationService.getString(key, params);
  }

  getResourceStringComponents(key: string, params?: string[]): string {
    return this.localLocalizationService.getString(key, params);
  }

  private addParamsToString(params: Observable<string>[] | undefined, translatedString: Observable<string>) {
    let latestParamsObs: Observable<string[]> | undefined;
    if (params) {
      latestParamsObs = combineLatest(params);
    }

    const toReturn = translatedString.pipe(
      concatMap((stringToFormat) => {
        if (latestParamsObs) {
          const formattedString = latestParamsObs.pipe(
            map((latestParams) => {
              try {
                const newStringFormat = StringUtils.formatString(stringToFormat, latestParams);
                return newStringFormat;
              } catch (err: any) {
                console.warn('Unable to format string', err.message);
                return stringToFormat;
              }
            })
          );
          return formattedString;
        }
        return stringToFormat;
      })
    );
    return toReturn;
  }

  getString(key: string, params?: string[]): string {
    return this.remoteLocalizationService.getString(key, params);
  }

}
