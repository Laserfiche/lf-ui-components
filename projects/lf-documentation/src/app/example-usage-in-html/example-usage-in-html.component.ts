// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';
import { LfTagsDemoService } from '../lf-tags-documentation/lf-tags-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-example-usage-in-html',
  templateUrl: './example-usage-in-html.component.html',
  styleUrls: ['./example-usage-in-html.component.css', '../app.component.css'],
  standalone: true,
  imports: [CardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExampleUsageInHtmlComponent extends ExampleUsageBasicStepsDirective implements AfterViewInit {
  private tagsService = new LfTagsDemoService();

  ngAfterViewInit() {
    const container = document.getElementById('demoTagsContainer');
    const output = document.getElementById('demoOutput') as HTMLTextAreaElement;

    const appendTags = () => {
      const tags = document.createElement('lf-tags') as any;
      tags.tagsService = this.tagsService;
      tags.initialTags = ['Reviewed'];
      tags.addEventListener('selectedTagsChanged', (event: CustomEvent) => {
        if (output) output.value = JSON.stringify(event.detail, null, 2);
      });
      container?.appendChild(tags);
    };

    if (customElements.get('lf-tags')) {
      appendTags();
    } else {
      const script = document.createElement('script');
      script.src = 'lf-ui-components.js';
      script.onload = appendTags;
      document.head.appendChild(script);
    }
  }
}
