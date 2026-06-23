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
    const tags = document.getElementById('demoTags') as any;
    const output = document.getElementById('demoOutput') as HTMLTextAreaElement;

    if (tags) {
      tags.tagsService = this.tagsService;
      tags.initialTags = ['Reviewed'];
    }

    const attachListener = () => {
      tags?.addEventListener('selectedTagsChanged', (event: CustomEvent) => {
        if (output) output.value = JSON.stringify(event.detail, null, 2);
      });
    };

    if (customElements.get('lf-tags')) {
      attachListener();
    } else {
      const script = document.createElement('script');
      script.src = 'lf-ui-components.js';
      script.onload = attachListener;
      document.head.appendChild(script);
    }
  }
}
