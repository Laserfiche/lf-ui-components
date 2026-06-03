// Copyright Laserfiche.

/*
 * Represents a tag set on a Laserfiche repository entry.
 */
export interface LfTagDefinition {
  /** The ID of the tag definition. */
  id: number;
  /** The name of the tag definition. */
  name: string;
  /** The localized name of the tag definition. */
  displayName: string;
  /** The description of the tag definition. */
  description?: string;
  /** A boolean indicating whether or not the tag definition is classified as a security tag (true). */
  isSecure: boolean;
}

/*
 * Returns all tag definitions in the repository.
 */
export interface LfTagsService {
  getTagDefinitions(): Promise<LfTagDefinition[]>;
}
