import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-getting-started',
  templateUrl: './getting-started.component.html',
  styleUrls: ['./getting-started.component.css', './../app.component.css']
})
export class GettingStartedComponent implements AfterViewInit {


  constructor(private route: ActivatedRoute) {
   }

  ngAfterViewInit(): void {
    this.route.queryParams.subscribe(params => {
      this.navigateToElements(params["id"]);
    })
  }

  navigateToElements(elementId: string) {
    var elements = document.getElementById(elementId);
    elements?.scrollIntoView();
    console.log('navigated to ', elements)
  }
}
