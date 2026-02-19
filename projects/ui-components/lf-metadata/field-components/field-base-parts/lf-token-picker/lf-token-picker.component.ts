// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { LfFieldTokenService } from '../lf-field-base/lf-field-token.service';
import { LfToken } from './lf-token.service';

@Component({
    selector: 'lf-token-picker-component',
    templateUrl: './lf-token-picker.component.html',
    styleUrls: ['./lf-token-picker.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatMenuModule]
})
export class LfTokenPickerComponent implements OnInit {
  tokenService = inject(LfFieldTokenService);


  @Input() data: any;
  @Output() tokenPicked: EventEmitter<string> = new EventEmitter();
  tokens: LfToken[] = [];

  async ngOnInit() {
    this.tokens = await this.tokenService.getTokensAsync(this.data);
  }

  async onTokenChosen(token: LfToken) {
    if (token) {
      this.tokenPicked.emit(token.text);
    }
  }
}
