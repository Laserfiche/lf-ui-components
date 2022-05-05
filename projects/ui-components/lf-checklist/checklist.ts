import { ChecklistOption } from './options/checklist-option';
import { ChecklistItem } from './items/checklist-item';

export interface Checklist {
    name: string;
    checklistItems: ChecklistItem[];
    checklistOptions: ChecklistOption[];
    collapsible?: boolean;
}
