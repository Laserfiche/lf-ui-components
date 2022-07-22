import { Directive } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from './app-routing.module';

@Directive({
  selector: '[appExampleUsageBasicSteps]'
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
