// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Directive, ViewContainerRef, inject } from '@angular/core';

/** @internal */
@Directive({
    selector: '[lfFieldView]',
    standalone: true
})
export class LfFieldViewDirective {  viewContainerRef = inject(ViewContainerRef);

}
