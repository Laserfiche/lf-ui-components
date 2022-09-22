import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { OverviewComponent } from './overview/overview.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { StylingDocumentationComponent } from './styling-documentation/styling-documentation.component';
import { LfUserFeedbackDocumentationComponent } from './lf-user-feedback-documentation/lf-user-feedback-documentation.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { LfChecklistDocumentationComponent } from './lf-checklist-documentation/lf-checklist-documentation.component';
import { LfTreeDocumentationComponent } from './lf-tree-documentation/lf-tree-documentation.component';
import { LfFileExplorerDocumentationComponent } from './lf-file-explorer-documentation/lf-file-explorer-documentation.component';
import { LfFieldDocumentationComponent } from './lf-field-documentation/lf-field-documentation.component';
import { LfFieldAdhocContainerDocumentationComponent } from './lf-field-adhoc-container-documentation/lf-field-adhoc-container-documentation.component';
import { LfFieldContainerDocumentationComponent } from './lf-field-container-documentation/lf-field-container-documentation.component';
import { LfFieldTemplateContainerDocumentationComponent } from './lf-field-template-container-documentation/lf-field-template-container-documentation.component';
import { LfBreadcrumbsDocumentationComponent } from './lf-breadcrumbs-documentation/lf-breadcrumbs-documentation.component';
import { LfFolderBrowserDocumentationComponent } from './lf-folder-browser-documentation/lf-folder-browser-documentation.component';
import { LfToolbarDocumentationComponent } from './lf-toolbar-documentation/lf-toolbar-documentation.component';
import { ConvertComponentToElementComponent } from './convert-component-to-element/convert-component-to-element.component';
import { LfLoginDocumentationComponent } from './lf-login-documentation/lf-login-documentation.component';
import { MatMenuModule } from '@angular/material/menu';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { ExampleUsageInAngularComponent } from './example-usage-in-angular/example-usage-in-angular.component';
import { ExampleUsageInReactComponent } from './example-usage-in-react/example-usage-in-react.component';
import { ExampleUsageInHtmlComponent } from './example-usage-in-html/example-usage-in-html.component';
import { ExampleNpmUsageInAngularComponent } from './example-npm-usage-in-angular/example-npm-usage-in-angular.component';
import { ExampleUsageBasicStepsDirective } from './example-usage-basic-steps.directive';
import { LfChecklistModule } from '../../../ui-components/lf-checklist/lf-checklist-public-api';
import { LfLoginModule } from '../../../ui-components/lf-login/lf-login-public-api';
import { LfMetadataModule } from '../../../ui-components/lf-metadata/lf-metadata-public-api';
import { LfUserFeedbackModule } from '../../../ui-components/lf-user-feedback/lf-user-feedback-public-api';
import { TreeComponentsModule } from '../../../ui-components/tree-components/lf-tree-components-public-api';

import { LfRepositoryBrowserModule } from '../../../ui-components/lf-repository-browser/lf-repository-browser.module';
import { LfRepositoryBrowserDocumentationComponent } from './lf-repository-browser-documentation/lf-repository-browser-documentation.component';
import { LfRepositoryBrowserNewFolderComponent } from './lf-repository-browser-documentation/lf-repository-browser-new-folder/lf-repository-browser-new-folder.component';
import { LfNewFolderDialogModalModule } from '../../../ui-components/shared/lf-shared-public-api';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    OverviewComponent,
    GettingStartedComponent,
    StylingDocumentationComponent,
    LfUserFeedbackDocumentationComponent,
    LfChecklistDocumentationComponent,
    LfTreeDocumentationComponent,
    LfFileExplorerDocumentationComponent,
    LfFieldDocumentationComponent,
    LfFieldAdhocContainerDocumentationComponent,
    LfFieldContainerDocumentationComponent,
    LfFieldTemplateContainerDocumentationComponent,
    LfFieldAdhocContainerDocumentationComponent,
    LfBreadcrumbsDocumentationComponent,
    LfFolderBrowserDocumentationComponent,
    LfRepositoryBrowserDocumentationComponent,
    LfRepositoryBrowserNewFolderComponent,
    LfToolbarDocumentationComponent,
    ConvertComponentToElementComponent,
    LfLoginDocumentationComponent,
    TroubleshootingComponent,
    ExampleUsageInAngularComponent,
    ExampleUsageInReactComponent,
    ExampleUsageInHtmlComponent,
    ExampleNpmUsageInAngularComponent,
    ExampleUsageBasicStepsDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    AppRoutingModule,
    MatToolbarModule,
    MatTreeModule,
    MatIconModule,
    MatMenuModule,
    LfLoginModule,
    LfUserFeedbackModule,
    LfChecklistModule,
    LfMetadataModule,
    LfRepositoryBrowserModule,
    TreeComponentsModule,
    LfNewFolderDialogModalModule
  ],
  providers: [
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  constructor() { }
}
