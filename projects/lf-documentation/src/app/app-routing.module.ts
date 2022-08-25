import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';import { LfTreeDocumentationComponent } from './lf-tree-documentation/lf-tree-documentation.component';
import { LfChecklistDocumentationComponent } from './lf-checklist-documentation/lf-checklist-documentation.component';
import { GettingStartedComponent } from './getting-started/getting-started.component';
import { StylingDocumentationComponent } from './styling-documentation/styling-documentation.component';
import { LfFieldDocumentationComponent } from './lf-field-documentation/lf-field-documentation.component';
import { OverviewComponent } from './overview/overview.component';
// import { LocalizationDocumentationComponent } from './localization-documentation/localization-documentation.component';
import { LfUserFeedbackDocumentationComponent } from './lf-user-feedback-documentation/lf-user-feedback-documentation.component';
import { LfFileExplorerDocumentationComponent } from './lf-file-explorer-documentation/lf-file-explorer-documentation.component';
import { LfFieldAdhocContainerDocumentationComponent } from './lf-field-adhoc-container-documentation/lf-field-adhoc-container-documentation.component';
import { LfFieldContainerDocumentationComponent } from './lf-field-container-documentation/lf-field-container-documentation.component';
import { LfFieldTemplateContainerDocumentationComponent } from './lf-field-template-container-documentation/lf-field-template-container-documentation.component';
import { LfBreadcrumbsDocumentationComponent } from './lf-breadcrumbs-documentation/lf-breadcrumbs-documentation.component';
import { LfFolderBrowserDocumentationComponent } from './lf-folder-browser-documentation/lf-folder-browser-documentation.component';
import { LfToolbarDocumentationComponent } from './lf-toolbar-documentation/lf-toolbar-documentation.component';
import { ConvertComponentToElementComponent } from './convert-component-to-element/convert-component-to-element.component';
import { LfLoginDocumentationComponent } from './lf-login-documentation/lf-login-documentation.component';
import { TroubleshootingComponent } from './troubleshooting/troubleshooting.component';
import { ExampleNpmUsageInAngularComponent } from './example-npm-usage-in-angular/example-npm-usage-in-angular.component';
import { ExampleUsageInAngularComponent } from './example-usage-in-angular/example-usage-in-angular.component';
import { ExampleUsageInReactComponent } from './example-usage-in-react/example-usage-in-react.component';
import { ExampleUsageInHtmlComponent } from './example-usage-in-html/example-usage-in-html.component';
import { LfRepositoryBrowserDocumentationComponent } from './lf-repository-browser-documentation/lf-repository-browser-documentation.component';

export enum RouterLinks {
  OVERVIEW = 'overview',
  GETTING_STARTED = 'getting-started',
  EXAMPLE_USAGE_ANGULAR = 'using-ui-components-from-cdn-in-angular',
  EXAMPLE_USAGE_REACT = 'using-ui-components-from-cdn-in-react',
  EXAMPLE_USAGE_HTML = 'using-ui-components-from-cdn-in-html5',
  EXAMPLE_NPM_USAGE_ANGULAR = 'using-ui-components-from-npm-package-in-angular',
  // LOCALIZATION = 'localization',
  STYLING = 'styling',
  TROUBLESHOOTING = 'troubleshooting',
  CONVERT_COMPONENT = 'convert-component',
  RELEASE_NOTES = 'release-notes',
  LF_BREADCRUMBS = 'lf-breadcrumbs',
  LF_CHECKLIST = 'lf-checklist',
  LF_FILE_EXPLORER = 'lf-file-explorer',
  LF_FOLDER_BROWSER = 'lf-folder-browser',
  LF_TOOLBAR = 'lf-toolbar',
  LF_TREE = 'lf-tree',
  LF_FIELD_CONTAINER = 'lf-field-container',
  LF_FIELD_TYPES = 'lf-field-types',
  LF_FIELD_ADHOC_CONTAINER = 'lf-field-adhoc-container',
  LF_FIELD_TEMPLATE_CONTAINER = 'lf-field-template-container',
  LF_LOGIN = 'lf-login',
  LF_USER_FEEDBACK = 'lf-user-feedback',
  LF_REPOSITORY_BROWSER = 'lf-repository-browser'
}

const routes: Routes = [
  { path: RouterLinks.LF_TREE, component: LfTreeDocumentationComponent },
  { path: RouterLinks.LF_FILE_EXPLORER, component: LfFileExplorerDocumentationComponent },
  { path: RouterLinks.LF_FOLDER_BROWSER, component: LfFolderBrowserDocumentationComponent },
  { path: RouterLinks.LF_TOOLBAR, component: LfToolbarDocumentationComponent },
  { path: RouterLinks.LF_BREADCRUMBS, component: LfBreadcrumbsDocumentationComponent },
  { path: RouterLinks.LF_CHECKLIST, component: LfChecklistDocumentationComponent },
  { path: RouterLinks.LF_FIELD_TYPES, component: LfFieldDocumentationComponent },
  { path: RouterLinks.LF_FIELD_ADHOC_CONTAINER, component: LfFieldAdhocContainerDocumentationComponent },
  { path: RouterLinks.LF_FIELD_CONTAINER, component: LfFieldContainerDocumentationComponent },
  { path: RouterLinks.LF_FIELD_TEMPLATE_CONTAINER, component: LfFieldTemplateContainerDocumentationComponent },
  { path: RouterLinks.LF_LOGIN, component: LfLoginDocumentationComponent},
  { path: RouterLinks.LF_USER_FEEDBACK, component: LfUserFeedbackDocumentationComponent },
  { path: RouterLinks.STYLING, component: StylingDocumentationComponent },
  { path: RouterLinks.GETTING_STARTED, component: GettingStartedComponent },
  { path: RouterLinks.EXAMPLE_NPM_USAGE_ANGULAR, component: ExampleNpmUsageInAngularComponent },
  { path: RouterLinks.EXAMPLE_USAGE_ANGULAR, component: ExampleUsageInAngularComponent },
  { path: RouterLinks.EXAMPLE_USAGE_REACT, component: ExampleUsageInReactComponent },
  { path: RouterLinks.EXAMPLE_USAGE_HTML, component: ExampleUsageInHtmlComponent },
  // { path: RouterLinks.LOCALIZATION, component: LocalizationDocumentationComponent },
  { path: RouterLinks.OVERVIEW, component: OverviewComponent },
  { path: RouterLinks.CONVERT_COMPONENT, component: ConvertComponentToElementComponent },
  { path: RouterLinks.TROUBLESHOOTING, component: TroubleshootingComponent },
  { path: RouterLinks.LF_REPOSITORY_BROWSER, component: LfRepositoryBrowserDocumentationComponent },
  { path: '', component: OverviewComponent },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
