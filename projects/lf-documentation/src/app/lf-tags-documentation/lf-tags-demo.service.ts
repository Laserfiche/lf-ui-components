// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ILfTagsService, LfTagDefinition } from './../../../../ui-components/lf-tags/lf-tags-public-api';

@Injectable({
  providedIn: 'root',
})
export class LfTagsDemoService implements ILfTagsService {
  private demoTagDefinitions: LfTagDefinition[] = [
    {
      id: 1,
      name: 'Confidential',
      displayName: 'Confidential',
      description: 'Contains sensitive information',
      isSecure: true,
    },
    {
      id: 2,
      name: 'Reviewed',
      displayName: 'Reviewed',
      description: 'Document has been reviewed',
      isSecure: false,
    },
    {
      id: 3,
      name: 'Approved',
      displayName: 'Approved',
      description: 'Document has been approved',
      isSecure: false,
    },
    {
      id: 4,
      name: 'Draft',
      displayName: 'Draft',
      description: 'Work in progress document',
      isSecure: false,
    },
    {
      id: 5,
      name: 'Archived',
      displayName: 'Archived',
      description: 'Document is archived',
      isSecure: false,
    },
  ];

  private tagDefinitionsSub = new BehaviorSubject<LfTagDefinition[] | undefined>(this.demoTagDefinitions);

  getTagDefinitionsSub(): BehaviorSubject<LfTagDefinition[] | undefined> {
    return this.tagDefinitionsSub;
  }

  getTagDefinitions(): LfTagDefinition[] | undefined {
    return this.demoTagDefinitions;
  }
}
