// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

interface ObjectWithName {
    name: string;
}

/** @internal */
export function filterObjectsByName<T extends ObjectWithName>(nodesToFilter?: T[], filterText?: string): T[] | undefined {
    if (!filterText) {
        return nodesToFilter;
    }
    else {
        const lowercaseFilterText: string = filterText.toLowerCase();
        return nodesToFilter?.filter(node => {
            if (node.name) {
                const lowercaseName: string = node.name.toLowerCase();
                return lowercaseName.includes(lowercaseFilterText);
            }
            return false;
        });
    }
}
