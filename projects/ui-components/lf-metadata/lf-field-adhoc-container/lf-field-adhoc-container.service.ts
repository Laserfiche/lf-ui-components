// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LfFieldInfo } from '../field-components/utils/lf-field-types';

export interface LfFieldAdhocContainerService {
  getAllFieldDefinitionsAsync(): Promise<LfFieldInfo[]>;
}
