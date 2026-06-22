// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideAnimations } from '@angular/platform-browser/animations';

import { LfLoginComponent } from '../../ui-components/lf-login/lf-login.component';
import { environment } from './environments/environment';
import {
  GeneralDialogLayoutComponent,
  LfLoaderComponent,
  LfPopupModalComponent,
  LfToastMessageComponent,
} from '../../ui-components/internal-shared/lf-internal-shared-public-api';
import { ItemsComponent } from '../../ui-components/lf-checklist/items/items.component';
import { LfChecklistComponent } from '../../ui-components/lf-checklist/lf-checklist-public-api';
import { OptionsComponent } from '../../ui-components/lf-checklist/options/options.component';
import { DateFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/date-field/date-field.component';
import { DateTimeFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/date-time-field/date-time-field.component';
import { DynamicFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/dynamic-field/dynamic-field.component';
import { LfFieldBaseComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/lf-field-base/lf-field-base.component';
import { ListFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/list-field/list-field.component';
import { NumberFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/number-field/number-field.component';
import { TextFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/text-field/text-field.component';
import { TimeFieldComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-field-base/time-field/time-field.component';
import { LfTokenPickerComponent } from '../../ui-components/lf-metadata/field-components/field-base-parts/lf-token-picker/lf-token-picker.component';
import { LfFieldComponent } from '../../ui-components/lf-metadata/field-components/lf-field/lf-field.component';
import { LfFieldGroupComponent } from '../../ui-components/lf-metadata/field-components/lf-field-group/lf-field-group.component';
import { LfFieldMultivalueComponent } from '../../ui-components/lf-metadata/field-components/lf-field-multivalue/lf-field-multivalue.component';
import { UniDateTimeComponent } from '../../ui-components/lf-metadata/lf-date-time-picker/uni-date-time.component';
import { LfFieldAdhocContainerComponent } from '../../ui-components/lf-metadata/lf-field-adhoc-container/lf-field-adhoc-container.component';
import { LfFieldAddRemoveComponent } from '../../ui-components/lf-metadata/lf-field-adhoc-container/lf-field-add-remove/lf-field-add-remove.component';
import { LfFieldContainerComponent } from '../../ui-components/lf-metadata/lf-field-container/lf-field-container.component';
import { LfFieldTemplateContainerComponent } from '../../ui-components/lf-metadata/lf-field-template-container/lf-field-template-container.component';
import { LfRepositoryBrowserComponent } from '../../ui-components/lf-repository-browser/lf-repository-browser.component';
import { LfSelectionListComponent } from '../../ui-components/lf-selection-list/lf-selection-list.component';
import { LfTagsComponent } from '../../ui-components/lf-tags/tags.component';
import { LfUserFeedbackComponent } from '../../ui-components/lf-user-feedback/lf-user-feedback.component';
import { FeedbackImageUploadComponent } from '../../ui-components/lf-user-feedback/feedback-image-upload/feedback-image-upload.component';
import { FeedbackSubmissionComponent } from '../../ui-components/lf-user-feedback/feedback-submission/feedback-submission.component';
import { FeedbackSuggestionSelectionComponent } from '../../ui-components/lf-user-feedback/feedback-suggestion-selection/feedback-suggestion-selection.component';
import { UserFeedbackDialogComponent } from '../../ui-components/lf-user-feedback/user-feedback-dialog/user-feedback-dialog.component';
import { LfBreadcrumbsComponent } from '../../ui-components/shared/lf-breadcrumbs/lf-breadcrumbs.component';
import { LfToolbarComponent } from '../../ui-components/shared/lf-toolbar/lf-toolbar.component';

if (environment.production) {
  enableProdMode();
}

const components = [
  { tag: 'lf-general-dialog-layout', component: GeneralDialogLayoutComponent },
  { tag: 'lf-loader-component', component: LfLoaderComponent },
  { tag: 'lf-popup-modal-component', component: LfPopupModalComponent },
  { tag: 'lf-toast-message', component: LfToastMessageComponent },
  { tag: 'lf-items-component', component: ItemsComponent },
  { tag: 'lf-checklist', component: LfChecklistComponent },
  { tag: 'lf-options-component', component: OptionsComponent },
  { tag: 'lf-login', component: LfLoginComponent },
  { tag: 'lf-date-field-component', component: DateFieldComponent },
  { tag: 'lf-date-time-field-component', component: DateTimeFieldComponent },
  { tag: 'lf-dynamic-field-component', component: DynamicFieldComponent },
  { tag: 'lf-field-base-component', component: LfFieldBaseComponent },
  { tag: 'lf-list-field-component', component: ListFieldComponent },
  { tag: 'lf-number-field-component', component: NumberFieldComponent },
  { tag: 'lf-text-field-component', component: TextFieldComponent },
  { tag: 'lf-time-field-component', component: TimeFieldComponent },
  { tag: 'lf-token-picker-component', component: LfTokenPickerComponent },
  { tag: 'lf-field-component', component: LfFieldComponent },
  { tag: 'lf-field-group-component', component: LfFieldGroupComponent },
  { tag: 'lf-field-multivalue-component', component: LfFieldMultivalueComponent },
  { tag: 'lf-uni-date-time', component: UniDateTimeComponent },
  { tag: 'lf-field-adhoc-container', component: LfFieldAdhocContainerComponent },
  { tag: 'lf-field-add-remove-component', component: LfFieldAddRemoveComponent },
  { tag: 'lf-field-container', component: LfFieldContainerComponent },
  { tag: 'lf-field-template-container', component: LfFieldTemplateContainerComponent },
  { tag: 'lf-repository-browser', component: LfRepositoryBrowserComponent },
  { tag: 'lf-selection-list-component', component: LfSelectionListComponent },
  { tag: 'lf-tags', component: LfTagsComponent },
  { tag: 'lf-user-feedback', component: LfUserFeedbackComponent },
  { tag: 'lf-feedback-image-upload', component: FeedbackImageUploadComponent },
  { tag: 'lf-feedback-submission', component: FeedbackSubmissionComponent },
  { tag: 'lf-feedback-suggestion-selection', component: FeedbackSuggestionSelectionComponent },
  { tag: 'lf-user-feedback-dialog-component', component: UserFeedbackDialogComponent },
  { tag: 'lf-breadcrumbs', component: LfBreadcrumbsComponent },
  { tag: 'lf-toolbar', component: LfToolbarComponent },
];

createApplication({
  providers: [provideAnimations(), provideZonelessChangeDetection()],
})
  .then((appRef) => {
    const injector = appRef.injector;

    // Expose standalone components as a custom elements
    for (const c of components) {
      const el = createCustomElement(c.component, { injector });
      customElements.define(c.tag, el);
    }
  })
  .catch((err) => console.error(err));
