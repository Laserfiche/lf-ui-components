// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfFieldContainerComponent } from './../../../../ui-components/lf-metadata/lf-metadata-public-api';
import { LfFieldContainerDemoService } from '../lf-field-container-documentation/lf-field-container-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfFieldContainerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class OverviewComponent implements AfterViewInit {
  @ViewChild('overviewField') elementFieldContainerRef!: LfFieldContainerComponent;

  constructor() {}

  async ngAfterViewInit() {
    const elementService = new LfFieldContainerDemoService();
    await this.elementFieldContainerRef?.initAsync(elementService, 1);
  }
}
