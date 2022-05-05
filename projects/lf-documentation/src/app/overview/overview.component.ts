import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { LfFieldContainerComponent } from '@laserfiche/types-lf-ui-components';
import { LfFieldContainerDemoService } from '../lf-field-container-documentation/lf-field-container-demo.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', './../app.component.css']
})
export class OverviewComponent implements AfterViewInit {

  @ViewChild('overviewField') elementFieldContainerRef!: ElementRef<LfFieldContainerComponent>;

  constructor() { }

  async ngAfterViewInit() {
      const elementService = new LfFieldContainerDemoService();
      await this.elementFieldContainerRef?.nativeElement.initAsync(elementService, 1);
  }
}
