// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import Flatpickr from 'flatpickr';
import { Arabic } from 'flatpickr/dist/l10n/ar.js';
import { Spanish } from 'flatpickr/dist/l10n/es.js';
import { French } from 'flatpickr/dist/l10n/fr.js';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { Mandarin } from 'flatpickr/dist/l10n/zh.js';
import { MandarinTraditional } from 'flatpickr/dist/l10n/zh-tw.js';

export const FlatpickrLocales = {
  en: Flatpickr.l10ns.en,
  ar: Arabic,
  es: Spanish,
  fr: French,
  pt: Portuguese,
  zhHans: Mandarin,
  zhHant: MandarinTraditional,
};
