// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideAnimations } from '@angular/platform-browser/animations';

import { environment } from './environments/environment';
import { registeredComponents } from './app/registered-components';

if (environment.production) {
  enableProdMode();
}

createApplication({
  providers: [provideAnimations(), provideZonelessChangeDetection()],
})
  .then((appRef) => {
    const injector = appRef.injector;

    // Expose standalone components as a custom elements
    for (const c of registeredComponents) {
      const el = createCustomElement(c.component, { injector });
      customElements.define(c.tag, el);
    }
  })
  .catch((err) => console.error(err));
