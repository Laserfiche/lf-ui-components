# @laserfiche/type-lf-ui-components

This is the type NPM package that contains the declaration files for lf-prefixed elements.

# What is a declaration file?
A declaration file (`*.d.ts`) is an interface to the components in the compiled JavaScript. It is similar to a header file (`.hpp`) in C++. For example,
``` typescript
export interface ChecklistOption {
    name: string;
    checked: boolean;
    disabled: boolean;
}
```
A declaration file can also export other declaration files, so it can concatenate all the interfaces together
``` typescript
export * from './lib/lf-checklist.service';
export * from './lib/lf-checklist/lf-checklist.component';
export * from './lib/lf-checklist.module';
export * from './lib/checklist';
export * from './lib/items/checklist-item';
export * from './lib/options/checklist-option';
```
# Why do we need it?
The `laserfiche-ui-components` in CDN is essentially loosely typed JavaScript. For this reason, if an application use elements imported from CDN, it will not have any typing information about those elements. To compliment this, we provide ***@laserfiche/type-lf-ui-components***, a type NPM package that contains the declaration files for those elements.

# How to use the type NPM Package for laserfiche-ui-components?

## With Angular Applications
1. `npm install @laserfiche/type-lf-ui-components` (use the link from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes) to obtain the NPM package for the desired version)
2. Import the lf-elements from the CDN by adding this line in `./index.html` inside your application (use the url from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes)).
   ```html
   <script src="https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/lf-ui-components.js" defer></script>
   ```
3. Inside `./app.module.ts`, add `CUSTOM_ELEMENTS_SCHEMA` to @NgModule.schemas. This enables custom elements in your Angular application.
   ```TypeScript
      import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

      @NgModule({
        declarations: [
           AppComponent,
           ...
           ],
         imports: [
           ...
          ],
         schemas: [CUSTOM_ELEMENTS_SCHEMA]
       })
   ```
4. example usage of using `lf-cheklist` whose implementation is provided in CDN, while type information is provided in the `@laserfiche/type-laserfiche-ui-components` NPM package.

   In a html file, 
   ```html
   <lf-checklist-element #myChecklist (checklistChanged)="onChecklistChangedAsync($event)"></lf-checklist-element>
   <!-- checklistChanged is a HTML custom event -->
   ```
   To add a handle of this element, in the `.ts` file,
   ```ts
   import { AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
   // we can directly import types from the NPM package
   import {LfChecklistComponent, Checklist} from '@laserfiche/types-laserfiche-ui-components'  
  
   @Component({
     selector: 'app-attachments',
     templateUrl: './attachments.component.html',
     styleUrls: ['./attachments.component.css'],
   })
   export class ExampleApp implements AfterViewInit {

     // a handle of the LfCheckistElement in the html above, available after ngAfterViewInit
     @ViewChild('myChecklist') componentChecklist!: ElementRef<LfChecklistComponent>; 

     // type Checklist is the type of the custom element imported from the NPM pakage
     currentChecklist: Checklist[]; 

     // event that emits the custom type  outputs are dispatched as HTML Custom Events
     onClick(event: CustomEvent<Checklist>) {
       const checklist = event.detail;   // data will be stored in the detail property
     }

     ngAfterViewInit() {
        // the element's view is initialized after ngAfterViewInit
       this.componentChecklist.initAsync(...)
     }
   }
   ```
   
## With Javascript Application

The CDN should work without the type npm package in a non angular application. 

