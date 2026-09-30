// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, DestroyRef, inject } from '@angular/core';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-example-usage-in-html',
  templateUrl: './example-usage-in-html.component.html',
  styleUrls: ['./example-usage-in-html.component.css', '../app.component.css'],
  standalone: true,
  imports: [CardComponent],
})
export class ExampleUsageInHtmlComponent extends ExampleUsageBasicStepsDirective {
  private destroyRef = inject(DestroyRef);

  /** Grows the demo iframe to its content height, so it opens without a scrollbar; the demo renders asynchronously. */
  onDemoFrameLoad(frame: HTMLIFrameElement) {
    const frameWindow = frame.contentWindow as (Window & typeof globalThis) | null;
    const frameRoot = frame.contentDocument?.documentElement;
    if (!frameWindow || !frameRoot) {
      return;
    }
    const observer = new frameWindow.ResizeObserver(() => {
      const frameBorder = frame.offsetHeight - frame.clientHeight;
      frame.style.height = `${Math.ceil(frameRoot.getBoundingClientRect().height) + frameBorder}px`;
    });
    observer.observe(frameRoot);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
