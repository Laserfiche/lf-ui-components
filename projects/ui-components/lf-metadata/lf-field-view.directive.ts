import { Directive, ViewContainerRef } from '@angular/core';

/** @internal */
@Directive({
  selector: '[lfFieldView]',
})
export class LfFieldViewDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
