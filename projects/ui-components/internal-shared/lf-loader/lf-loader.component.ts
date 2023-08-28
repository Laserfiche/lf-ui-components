import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppLocalizationService } from '../app-localization.service';

/**
 * @internal
 * Not for public use
 */
@Component({
  selector: 'lf-loader-component',
  templateUrl: './lf-loader.component.html',
  styleUrls: ['./lf-loader.component.css']
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
