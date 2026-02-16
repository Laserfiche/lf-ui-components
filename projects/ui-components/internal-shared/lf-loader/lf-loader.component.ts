// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AppLocalizationService } from '../app-localization.service';

/**
 * @internal
 * Not for public use
 */
@Component({
    selector: 'lf-loader-component',
    templateUrl: './lf-loader.component.html',
    styleUrls: ['./lf-loader.component.css'],
    standalone: true,
    imports: [CommonModule]
})
export class LfLoaderComponent {

  /** @internal */
  constructor(
    /**@internal */
    private localizationService: AppLocalizationService
  ) {
  }

  readonly LOADING: Observable<string> = this.localizationService.getStringLaserficheObservable('LOADING');

}
