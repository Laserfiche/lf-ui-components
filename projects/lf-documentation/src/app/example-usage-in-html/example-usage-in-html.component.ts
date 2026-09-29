// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ExampleUsageBasicStepsDirective } from '../example-usage-basic-steps.directive';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-example-usage-in-html',
  templateUrl: './example-usage-in-html.component.html',
  styleUrls: ['./example-usage-in-html.component.css', '../app.component.css'],
  standalone: true,
  imports: [CardComponent],
})
export class ExampleUsageInHtmlComponent extends ExampleUsageBasicStepsDirective implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  demoFileContent = signal('');

  ngOnInit() {
    this.http.get('./framework-agnostic-ui-component-demo.html', { responseType: 'text' }).subscribe((content) => {
      this.demoFileContent.set(content);
    });
  }

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
