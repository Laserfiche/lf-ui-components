// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LfFieldAdhocContainerService } from '../lf-field-adhoc-container/lf-field-adhoc-container.service';
import { LfFieldTemplateContainerService } from '../lf-field-template-container/lf-field-template-container.service';

export interface LfFieldContainerService extends LfFieldAdhocContainerService, LfFieldTemplateContainerService {

}
