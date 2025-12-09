// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Injectable } from '@angular/core';
import { LfLocalizationService, StringUtils } from '@laserfiche/lf-js-utils';
import { combineLatest, Observable, Subject } from 'rxjs';
import { concatMap, map, startWith } from 'rxjs/operators';
import * as strings_ar from './strings/ar.json';
import * as strings_en from './strings/en.json';
import * as strings_es from './strings/es.json';
import * as strings_fr from './strings/fr.json';
import * as strings_frFR from './strings/fr-FR.json';
import * as strings_it from './strings/it.json';
import * as strings_id from './strings/id.json';
import * as strings_ptBR from './strings/pt-BR.json';
import * as strings_th from './strings/th.json';
import * as strings_cs from './strings/cs.json';
import * as strings_de from './strings/de.json';
import * as strings_el from './strings/el.json';
import * as strings_ja from './strings/ja.json';
import * as strings_ko from './strings/ko.json';
import * as strings_ms from './strings/ms.json';
import * as strings_nl from './strings/nl.json';
import * as strings_ro from './strings/ro.json';
import * as strings_sr_Latn from './strings/sr-Latn.json';
import * as strings_tr from './strings/tr.json';
import * as strings_vi from './strings/vi.json';
import * as strings_zhHans from './strings/zh-Hans.json';
import * as strings_zhHant from './strings/zh-Hant.json';

import * as strings_ar_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/ar-EG.json';
import * as strings_cs_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/cs-CZ.json';
import * as strings_de_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/de-DE.json';
import * as strings_el_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/el-GR.json';
import * as strings_id_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/id-ID.json';
import * as strings_ja_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/ja-JP.json';
import * as strings_ko_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/ko-KR.json';
import * as strings_ms_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/ms-MY.json';
import * as strings_nl_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/nl-NL.json';
import * as strings_ro_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/ro-RO.json';
import * as strings_srLatn_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/sr-Latn.json';
import * as strings_tr_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/tr-TR.json';
import * as strings_vi_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/vi-VN.json';
import * as strings_en_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/en-US.json';
import * as strings_es_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/es-MX.json';
import * as strings_fr_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/fr-CA.json';
import * as strings_frFR_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/fr-FR.json';
import * as strings_it_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/it-IT.json';
import * as strings_ptBR_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/pt-BR.json';
import * as strings_th_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/th-TH.json';
import * as strings_zhHans_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/zh-Hans.json';
import * as strings_zhHant_common from '@laserfiche/lf-resource-library/resources/laserfiche-base/zh-Hant.json';


/** @internal */
@Injectable({
  providedIn: 'root',
})
export class AppLocalizationService {

  localResources: Map<string, object> = new Map<string, object>([
    ['ar-EG', (strings_ar as any).default],
    ['cs-CZ', (strings_cs as any).default],
    ['de-DE', (strings_de as any).default],
    ['el-GR', (strings_el as any).default],
    ['en-US', (strings_en as any).default],
    ['es-MX', (strings_es as any).default],
    ['fr-CA', (strings_fr as any).default],
    ['fr-FR', (strings_frFR as any).default],
    ['id-ID', (strings_id as any).default],
    ['it-IT', (strings_it as any).default],
    ['ja-JP', (strings_ja as any).default],
    ['ko-KR', (strings_ko as any).default],
    ['ms-MY', (strings_ms as any).default],
    ['nl-NL', (strings_nl as any).default],
    ['pt-BR', (strings_ptBR as any).default],
    ['ro-RO', (strings_ro as any).default],
    ['sr-Latn', (strings_sr_Latn as any).default],
    ['th-TH', (strings_th as any).default],
    ['tr-TR', (strings_tr as any).default],
    ['vi-VN', (strings_vi as any).default],
    ['zh-Hans', (strings_zhHans as any).default],
    ['zh-Hant', (strings_zhHant as any).default],
  ]);

  resourceLibraryResources: Map<string, object> = new Map<string, object>([
    ['ar-EG', (strings_ar_common as any).default],
    ['cs-CZ', (strings_cs_common as any).default],
    ['de-DE', (strings_de_common as any).default],
    ['el-GR', (strings_el_common as any).default],
    ['en-US', (strings_en_common as any).default],
    ['es-MX', (strings_es_common as any).default],
    ['fr-CA', (strings_fr_common as any).default],
    ['fr-FR', (strings_frFR_common as any).default],
    ['id-ID', (strings_id_common as any).default],
    ['it-IT', (strings_it_common as any).default],
    ['ja-JP', (strings_ja_common as any).default],
    ['ko-KR', (strings_ko_common as any).default],
    ['ms-MY', (strings_ms_common as any).default],
    ['nl-NL', (strings_nl_common as any).default],
    ['pt-BR', (strings_ptBR_common as any).default],
    ['ro-RO', (strings_ro_common as any).default],
    ['sr-Latn', (strings_srLatn_common as any).default],
    ['th-TH', (strings_th_common as any).default],
    ['tr-TR', (strings_tr_common as any).default],
    ['vi-VN', (strings_vi_common as any).default],
    ['zh-Hans', (strings_zhHans_common as any).default],
    ['zh-Hant', (strings_zhHant_common as any).default],
  ]);
  localLocalizationService = new LfLocalizationService(this.localResources);
  lfCommonLocalizationService = new LfLocalizationService(this.resourceLibraryResources);
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
              this.lfCommonLocalizationService.debugMode = debug;
              this.localLocalizationService.debugMode = debug;
              this.internalGetString.next();
            }
          }
        }
        catch (err: any) {
          // Do not log, this will happen on most message events
        }
      }
    });
  }

  async setLanguageAsync(language: string) {
    this.lfCommonLocalizationService.setLanguage(language);
    this.localLocalizationService.setLanguage(language);
    this.internalGetString.next();
  }

  languageChanged(): Observable<string | undefined> {
    const currentLanguage = this.lfCommonLocalizationService.currentResource?.language;
    return this.internalGetString.pipe(startWith(currentLanguage), map(() => { return this.lfCommonLocalizationService.currentResource?.language; }));
  }

  get currentLanguage(): string | undefined {
    return this.lfCommonLocalizationService.currentResource?.language;
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
    return this.lfCommonLocalizationService.getString(key, params);
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
    return this.lfCommonLocalizationService.getString(key, params);
  }

}
