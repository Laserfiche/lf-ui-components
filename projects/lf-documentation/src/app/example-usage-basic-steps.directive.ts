// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Directive } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from './app.config';

@Directive({
    selector: '[appExampleUsageBasicSteps]',
    standalone: true
})
export class ExampleUsageBasicStepsDirective {

  constructor(public router: Router) { }

  navigateToGettingStarted(id: string) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        "id": id
      }
  };
    this.router.navigate([RouterLinks.GETTING_STARTED], navigationExtras);
  }

}
