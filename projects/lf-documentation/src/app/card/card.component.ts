// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, Input, booleanAttribute } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  standalone: true,
  imports: [MatCardModule],
})
export class CardComponent {
  @Input() cardTitle: string | undefined;
  /** Span the full column width and stretch the projected content to fill the card as it is resized. */
  @Input({ transform: booleanAttribute }) fill = false;

  constructor() {}
}
