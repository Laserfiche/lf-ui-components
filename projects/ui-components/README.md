# @laserfiche/lf-ui-components

A collection of UI Components to be used to interact with Laserfiche.

It is a library for reusable laserfiche ui web components, as well as its documentation.
The default project is `lf-documentation`.

# Why choose @Laserfiche/lf-ui-components?

- Compatible with many web frameworks including Angular, React, Vue, or no framework at all.
- Pure client side implementation with no dependencies on specific services implementation.

# [Documentation](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/)

# [Getting Started](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/getting-started)

# Example Usages 

## CDN with Angular Applications
1. `npm install @laserfiche/type-lf-ui-components` (use the link from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes) to obtain the NPM package for the desired version)
2. Import the UI elements from the CDN by adding this line in `./index.html` inside your application (use the url from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes)).
   ```html
   <script src="https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/lf-ui-components.js" defer></script>
   ```
3. Import the style sheet from the CDN by adding this line in `./index.html` inside your application (use the url from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes)).
   ```html
   <link href="https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/lf-laserfiche-lite.css"  rel="stylesheet"/>
   ```
4. Inside `./app.module.ts`, add `CUSTOM_ELEMENTS_SCHEMA` to @NgModule.schemas. This enables custom elements in your Angular application.
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
5. example usage of using `lf-cheklist` whose implementation is provided in CDN, while type information is provided in the `@laserfiche/type-lf-ui-components` NPM package.

   In a html file, 
   ```html
   <lf-checklist #myChecklist (checklistChanged)="onChecklistChangedAsync($event)"></lf-checklist>
   <!-- checklistChanged is a HTML custom event -->
   ```
   To add a handle of this element, in the `.ts` file,
   ```ts
   import { AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
   // we can directly import types from the NPM package
   import {LfChecklistComponent, Checklist} from '@laserfiche/types-lf-ui-components'  
  
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
       this.componentChecklist.nativeElement.initAsync(...)
     }
   }
   ```
## NPM library in Angular Projects

1. `npm install @laserfiche/lf-ui-components` (use the link from the [released versions](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/release-notes) to obtain the NPM package for the desired version)
2. Inside `./app.module.ts`, import the Angular modules. For example, we want to use the <lf-checklist> element:
   ```TypeScript
      import { NgModule } from '@angular/core';
      import { LfChecklistModule } from '@laserfiche/lf-ui-components/lf-checklist';

      @NgModule({
        declarations: [
           AppComponent,
           ...
           ],
         imports: [
           LfChecklistModule,
           BrowserAnimationsModule
          ]
       })
   ```
3. Import the style sheet from the npm package by adding this line in `styles.css` in your angular application.
```css
@import '~@laserfiche/lf-ui-components/cdn/lf-laserfiche-lite.css';
```
4. the same usage of using `lf-cheklist`, except this time, both the implementation and the typing are provided via `@laserfiche/lf-ui-components/lf-checklist`

   In a html file, 
   ```html
   <lf-checklist #myChecklist (checklistChanged)="onChecklistChangedAsync($event)"></lf-checklist>
   <!-- checklistChanged is a HTML custom event -->
   ```
   To add a handle of this element, in the `.ts` file,
   ```ts
   import { AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
   // we can directly import types from the NPM package
  import { Checklist, LfChecklistComponent, LfChecklistService } from '@laserfiche/lf-ui-components/lf-checklist';
  
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
       this.componentChecklist.nativeElement.initAsync(...)
     }
   }
   ```
## Setting UI Components Language

- The default language of the UI Components is the browser language.
- To explicitly set the language of the UI Components post a message as follows:

```typescript
const langObj = {
    'lf-localization-service-set-language': language
}
window.postMessage(JSON.stringify(langObj), window.origin);
```

- [Supported Languages](https://www.jsdelivr.com/package/npm/@laserfiche/lf-resource-library?path=resources%2Flaserfiche-base)

# Contribution

We welcome contributions and feedback. Please follow our [contributing guidelines](https://github.com/Laserfiche/lf-ui-components/blob/12.x/CONTRIBUTING.md).

# Development prerequisite

See .github/workflows/main.yml for Node and NPM version used.
