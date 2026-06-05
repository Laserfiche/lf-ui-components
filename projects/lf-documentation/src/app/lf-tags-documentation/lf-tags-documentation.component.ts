// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LfTagsComponent, LfTagDefinition } from './../../../../ui-components/lf-tags/lf-tags-public-api';
import { LfTagsDemoService } from './lf-tags-demo.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-lf-tags-documentation',
  templateUrl: './lf-tags-documentation.component.html',
  styleUrls: ['./lf-tags-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, LfTagsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfTagsDocumentationComponent {
  tagsService = new LfTagsDemoService();
  selectedTagsOutput: string | undefined;
  initialTags: string[] = ['Reviewed'];

  onSelectedTagsChanged(tagDefinitions: LfTagDefinition[]) {
    this.selectedTagsOutput = JSON.stringify(tagDefinitions, null, 2);
  }
}
