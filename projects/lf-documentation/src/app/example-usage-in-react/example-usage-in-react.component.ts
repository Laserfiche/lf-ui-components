import { Component } from '@angular/core';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';

@Component({
  selector: 'app-example-usage-in-react',
  templateUrl: './example-usage-in-react.component.html',
  styleUrls: ['./example-usage-in-react.component.css', '../app.component.css']
})
export class ExampleUsageInReactComponent extends ExampleUsageBasicStepsDirective { }
