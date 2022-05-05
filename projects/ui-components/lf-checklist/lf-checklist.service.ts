import { Checklist } from './checklist';

export interface LfChecklistService {
  loadChecklistsAsync(): Promise<Checklist[]>;
}
