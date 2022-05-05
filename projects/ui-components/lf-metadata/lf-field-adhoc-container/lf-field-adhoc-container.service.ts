import { LfFieldInfo } from '../field-components/utils/lf-field-types';

export interface LfFieldAdhocContainerService {
  getAllFieldDefinitionsAsync(): Promise<LfFieldInfo[]>;
}
