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
