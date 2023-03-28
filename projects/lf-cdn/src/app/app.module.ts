import { DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfRepositoryBrowserModule } from '../../../ui-components/lf-repository-browser/lf-repository-browser-public-api';
import { LfChecklistModule } from '../../../ui-components/lf-checklist/lf-checklist-public-api';
import { LfLoginModule } from '../../../ui-components/lf-login/lf-login-public-api';
import { LfMetadataModule } from '../../../ui-components/lf-metadata/lf-metadata-public-api';
import { LfUserFeedbackModule } from '../../../ui-components/lf-user-feedback/lf-user-feedback-public-api';
import { LfBreadcrumbsModule, LfToolbarModule } from './../../../ui-components/shared/lf-shared-public-api';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LfLoginModule,
    LfUserFeedbackModule,
    LfChecklistModule,
    LfMetadataModule,
    LfRepositoryBrowserModule,
    LfToolbarModule,
    LfBreadcrumbsModule
  ],
  providers: [],
})
export class AppModule implements DoBootstrap {
  constructor() { }

  /* eslint-disable @angular-eslint/no-empty-lifecycle-method */
  ngDoBootstrap() {}
}
