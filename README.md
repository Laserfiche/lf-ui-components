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
1. `npm install @laserfiche/types-lf-ui-components`
2. Import the UI elements from the CDN by adding this line in `./index.html` inside your application
   ```html
   <script src="https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/lf-ui-components.js" defer></script>
   ```
3. Import the style sheet from the CDN by adding this line in `./index.html` inside your application
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
5. Example usage of `lf-checklist`, with the implementation coming from the CDN and the types provided in the `@laserfiche/types-lf-ui-components` NPM package.

   In a html file, 
   ```html
   <lf-checklist #myChecklist (checklistChanged)="onChecklistChangedAsync($event)"></lf-checklist>
   <!-- checklistChanged is a HTML custom event -->
   ```
   To add a handle for this element, in the `.ts` file,
   ```ts
   import { AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
   // we can directly import types from the NPM package
   import {LfChecklistComponent, Checklist} from '@laserfiche/types-lf-ui-components';  
  
   @Component({
     selector: 'app-attachments',
     templateUrl: './attachments.component.html',
     styleUrls: ['./attachments.component.css'],
   })
   export class ExampleApp implements AfterViewInit {

     // allows access to the LfChecklistElement in the html above, available starting in ngAfterViewInit hook
     @ViewChild('myChecklist') checklist!: ElementRef<LfChecklistComponent>; 

     // type Checklist is the type of the custom element imported from the NPM package
     currentChecklist: Checklist[]; 

     // events for the elements are received as CustomEvents
     onClick(event: CustomEvent<Checklist>) {
       const checklist = event.detail;   // data will be stored in the detail property
     }

     ngAfterViewInit() {
        // the element's view is initialized after ngAfterViewInit
       this.checklist.nativeElement.initAsync(...)
     }
   }
   ```
## NPM library in Angular Projects

1. `npm install @laserfiche/lf-ui-components`
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
4. the same usage of using `lf-checklist`, except this time, both the implementation and the typing are provided via `@laserfiche/lf-ui-components/lf-checklist`


  ```ts
  import { AfterViewInit, Component, ViewChild, ElementRef} from '@angular/core';
  // we can directly import types from the NPM package
  import { Checklist, LfChecklistComponent, LfChecklistService } from '@laserfiche/lf-ui-components/lf-checklist';
  ...
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

# Development 

## prerequisite

See .github/workflows/main.yml for Node and NPM version used.

## <a name="CDN"></a> Build ui-components CDN script

```sh
npm install -w @laserfiche/lf-ui-components
npm run build-ui-components-prod
npm run create-lf-cdn
```
to create `./dist/lf-cdn/lf-ui-components.js`.

## Build ui-components NPM

```sh
npm install -w @laserfiche/lf-ui-components
npm run build-ui-components-prod
```
to create `./dist/ui-components`.
## Build lf-documentation

Install `@laserfiche/types-lf-ui-components`.
```sh
npm install @laserfiche/types-lf-ui-components@<PREFERRED_VERSION> -w @laserfiche/lf-ui-documentation # to overwrite the version of @laserfiche/types-lf-ui-components in projects/lf-documentation/package.json

```
Build lf-documentation:
```sh
npm install -w @laserfiche/lf-ui-documentation
ng build
```
to create `./dist/lf-documentation`.
Build lf style sheet:
```sh
npm run sass-lf
```

This project is loading the script at `./dist/lf-cdn/lf-ui-components.js`. Please [build the script locally](#CDN) or [download from CDN](https://unpkg.com/@laserfiche/lf-ui-components@12/cdn/lf-ui-components.js) to view the documentation.
