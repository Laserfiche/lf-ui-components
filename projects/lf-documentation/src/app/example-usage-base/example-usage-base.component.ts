import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from '../app-routing.module';

@Component({
  selector: 'app-example-usage-base',
  templateUrl: './example-usage-base.component.html',
  styleUrls: ['./example-usage-base.component.css']
})
export class ExampleUsageBaseComponent {

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
