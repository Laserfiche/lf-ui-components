// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Directive, ViewContainerRef } from '@angular/core';

/** @internal */
@Directive({
  selector: '[lfFieldView]',
})
export class LfFieldViewDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
