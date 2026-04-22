// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideAnimations } from '@angular/platform-browser/animations';

import { LfLoginComponent } from '../../ui-components/lf-login/lf-login.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

createApplication({
  providers: [provideAnimations(), provideZonelessChangeDetection()],
})
  .then((appRef) => {
    const injector = appRef.injector;

    // Expose the login component
    const loginElement = createCustomElement(LfLoginComponent, { injector });
    customElements.define('lf-login-component', loginElement);
  })
  .catch((err) => console.error(err));
