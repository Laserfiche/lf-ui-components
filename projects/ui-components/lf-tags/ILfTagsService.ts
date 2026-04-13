// Copyright Laserfiche.

import { BehaviorSubject } from 'rxjs';

export interface LfTagDefinition {
  /** The ID of the tag definition. */
  id?: number;
  /** The name of the tag definition. */
  name?: string | undefined;
  /** The localized name of the tag definition. */
  displayName?: string | undefined;
  /** The description of the tag definition. */
  description?: string | undefined;
  /** A boolean indicating whether or not the tag definition is classified as a security tag (true). */
  isSecure?: boolean;
}

export interface ILfTagsService {
  updateTagDefinitions(newTagDefinitions: LfTagDefinition[]): void;

  getTagDefinitionsSub(): BehaviorSubject<LfTagDefinition[] | undefined>;

  getTagDefinitions(): LfTagDefinition[] | undefined;
}
