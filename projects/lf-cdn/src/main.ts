// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { enableProdMode, importProvidersFrom } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

createApplication({
  providers: [
    provideAnimations(),
  ]
}).catch(err => console.error(err));
