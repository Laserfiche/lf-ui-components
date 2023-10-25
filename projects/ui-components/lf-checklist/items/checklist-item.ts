// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

export interface ChecklistItem {
    icon: string | string[];
    name: string;
    id: string;
    checked: boolean;
    disabled: boolean;
    editable: boolean;
    constraint?: string;
    constraintError?: string;
    isRequired?: boolean;
    requiredError?: string;
}
