// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ChecklistOption } from './options/checklist-option';
import { ChecklistItem } from './items/checklist-item';

export interface Checklist {
    name: string;
    checklistItems: ChecklistItem[];
    checklistOptions: ChecklistOption[];
    collapsible?: boolean;
}
