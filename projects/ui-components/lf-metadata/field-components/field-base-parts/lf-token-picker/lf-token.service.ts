import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** @internal */
@Injectable({
  providedIn: 'root'
})
export abstract class LfTokenService {
  abstract getTokensAsync(lfTokenSubject: any): Promise<LfToken[]>;
}

/** @internal */
export interface LfToken {
  id: string | number;
  friendlyName: Observable<string>;
  text: string;
}
