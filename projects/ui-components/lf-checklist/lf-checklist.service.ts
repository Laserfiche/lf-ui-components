// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Checklist } from './checklist';

export interface LfChecklistService {
  loadChecklistsAsync(): Promise<Checklist[]>;
}
