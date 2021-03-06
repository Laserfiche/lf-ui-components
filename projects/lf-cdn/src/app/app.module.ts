import { DoBootstrap, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LfChecklistModule } from '../../../ui-components/lf-checklist/lf-checklist-public-api';
import { LfLoginModule } from '../../../ui-components/lf-login/lf-login-public-api';
import { LfMetadataModule } from '../../../ui-components/lf-metadata/lf-metadata-public-api';
import { LfUserFeedbackModule } from '../../../ui-components/lf-user-feedback/lf-user-feedback-public-api';
import { TreeComponentsModule } from '../../../ui-components/tree-components/lf-tree-components-public-api';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LfLoginModule,
    LfUserFeedbackModule,
    LfChecklistModule,
    LfMetadataModule,
    TreeComponentsModule
  ],
  providers: [],
})
export class AppModule implements DoBootstrap {
  constructor() { }

  /* eslint-disable @angular-eslint/no-empty-lifecycle-method */
  ngDoBootstrap() {}
}
