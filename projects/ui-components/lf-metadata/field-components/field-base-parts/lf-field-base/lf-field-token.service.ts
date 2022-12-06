import { Injectable } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/shared';
import { FieldType } from '@laserfiche/lf-ui-components/shared';
import { Observable } from 'rxjs';
import { LfToken, LfTokenService } from '../lf-token-picker/lf-token.service';

/** @internal */
@Injectable({
  providedIn: 'root'
})
export class LfFieldTokenService implements LfTokenService {

  private readonly defaultStringTokens: LfFieldTokenId[] = [
    LfFieldTokenId.DATE,
    LfFieldTokenId.TIME,
    LfFieldTokenId.DATETIME,
    // LfFieldTokenId.SESSION_COUNT,
    LfFieldTokenId.REPOSITORY_COUNT,
    LfFieldTokenId.USER_NAME,
    LfFieldTokenId.ENTRY_NAME,
    LfFieldTokenId.PARENT_NAME,
    LfFieldTokenId.ENTRY_ID,
    LfFieldTokenId.PARENT_ID,
    LfFieldTokenId.PARENT_FIELD
  ];

  private readonly defaultNumberTokens: LfFieldTokenId[] = [
    LfFieldTokenId.SESSION_COUNT,
    LfFieldTokenId.REPOSITORY_COUNT,
    LfFieldTokenId.ENTRY_ID,
    LfFieldTokenId.PARENT_ID,
    LfFieldTokenId.PARENT_FIELD
  ];

  private readonly DATE = this.localizationService.getStringLaserficheObservable('DATE');
  private readonly TIME = this.localizationService.getStringLaserficheObservable('TIME');
  private readonly DATE_TIME = this.localizationService.getStringLaserficheObservable('DATE_TIME');
  private readonly SESSION_COUNT = this.localizationService.getStringLaserficheObservable('SESSION_COUNT');
  private readonly REPOSITORY_COUNT = this.localizationService.getStringLaserficheObservable('REPOSITORY_COUNT');
  private readonly USER_NAME = this.localizationService.getStringLaserficheObservable('USER_NAME');
  private readonly ENTRY_NAME = this.localizationService.getStringLaserficheObservable('ENTRY_NAME');
  private readonly PARENT_NAME = this.localizationService.getStringLaserficheObservable('PARENT_NAME');
  private readonly ENTRY_ID = this.localizationService.getStringLaserficheObservable('ENTRY_ID');
  private readonly PARENT_ID = this.localizationService.getStringLaserficheObservable('PARENT_ID');
  private readonly PARENT_FIELD = this.localizationService.getStringLaserficheObservable('PARENT_FIELD');
  private readonly FILE_NAME = this.localizationService.getStringLaserficheObservable('FILE_NAME');
  private readonly FILE_EXTENSION = this.localizationService.getStringLaserficheObservable('FILE_EXTENSION');
  private readonly FILE_MODIFIED = this.localizationService.getStringLaserficheObservable('FILE_MODIFIED');

  private readonly defaultDateTokens: LfFieldTokenId[] = [LfFieldTokenId.DATE];

  private readonly defaultDateTimeTokens: LfFieldTokenId[] = [LfFieldTokenId.DATETIME];

  private readonly defaultTimeTokens: LfFieldTokenId[] = [LfFieldTokenId.TIME];

  private readonly fieldTokenTexts: Map<LfFieldTokenId, string> = new Map([
    [LfFieldTokenId.DATE, 'date'],
    [LfFieldTokenId.TIME, 'time'],
    [LfFieldTokenId.DATETIME, 'datetime'],
    [LfFieldTokenId.SESSION_COUNT, 'count'],
    [LfFieldTokenId.REPOSITORY_COUNT, 'gcount'],
    [LfFieldTokenId.USER_NAME, 'username'],
    [LfFieldTokenId.ENTRY_NAME, 'name'],
    [LfFieldTokenId.PARENT_NAME, 'parentname'],
    [LfFieldTokenId.ENTRY_ID, 'id'],
    [LfFieldTokenId.PARENT_ID, 'parentid'],
    [LfFieldTokenId.PARENT_FIELD, 'parent'],
    [LfFieldTokenId.FILE_NAME, 'filename'],
    [LfFieldTokenId.FILE_EXTENSION, 'fileextension'],
    [LfFieldTokenId.FILE_MODIFIED, 'filemodified']
  ]);

  constructor(
    private localizationService: AppLocalizationService
  ) { }

  async getTokensAsync(lfFieldTokenData: LfFieldTokenData): Promise<LfToken[]> {
    if (lfFieldTokenData?.fieldType === undefined) {
      throw new Error('getTokensAsync() parameter lfFieldTokenData must be of type LfFieldTokenData');
    }
    let tokenIds: LfFieldTokenId[] = [];
    switch (lfFieldTokenData.fieldType) {
      case FieldType.Date:
        tokenIds = this.defaultDateTokens;
        break;
      case FieldType.DateTime:
        tokenIds = this.defaultDateTimeTokens;
        break;
      case FieldType.Time:
        tokenIds = this.defaultTimeTokens;
        break;
      case FieldType.LongInteger:
      case FieldType.Number:
      case FieldType.ShortInteger:
        tokenIds = this.defaultNumberTokens;
        break;
      case FieldType.String:
        tokenIds = this.defaultStringTokens;
        break;
      default:
        tokenIds = [];
        break;
    }

    return this.convertTokenIdsToTokens(tokenIds);
  }

  private convertTokenIdsToTokens(tokenIds: LfFieldTokenId[]): LfToken[] {
    return tokenIds.map((tokenId: LfFieldTokenId) => {
      const LfToken: LfToken = {
        id: tokenId,
        friendlyName: this.getTokenFriendlyName(tokenId),
        text: this.fieldTokenTexts.get(tokenId) ?? ''
      };
      return LfToken;
    });
  }

  private getTokenFriendlyName(tokenId: LfFieldTokenId): Observable<string> {
    switch (tokenId) {
      case LfFieldTokenId.DATE: {
        return this.DATE;
      }
      case LfFieldTokenId.TIME: {
        return this.TIME;
      }
      case LfFieldTokenId.DATETIME: {
        return this.DATE_TIME;
      }
      case LfFieldTokenId.SESSION_COUNT: {
        return this.SESSION_COUNT;
      }
      case LfFieldTokenId.REPOSITORY_COUNT: {
        return this.REPOSITORY_COUNT;
      }
      case LfFieldTokenId.USER_NAME: {
        return this.USER_NAME;
      }
      case LfFieldTokenId.ENTRY_NAME: {
        return this.ENTRY_NAME;
      }
      case LfFieldTokenId.PARENT_NAME: {
        return this.PARENT_NAME;
      }
      case LfFieldTokenId.ENTRY_ID: {
        return this.ENTRY_ID;
      }
      case LfFieldTokenId.PARENT_ID: {
        return this.PARENT_ID;
      }
      case LfFieldTokenId.PARENT_FIELD: {
        return this.PARENT_FIELD;
      }
      case LfFieldTokenId.FILE_NAME: {
        return this.FILE_NAME;
      }
      case LfFieldTokenId.FILE_EXTENSION: {
        return this.FILE_EXTENSION;
      }
      case LfFieldTokenId.FILE_MODIFIED: {
        return this.FILE_MODIFIED;
      }
    }
  }

  getTokenText(token: LfFieldTokenId): string | undefined {
    return this.fieldTokenTexts.get(token);
  }

  getTokensForFieldType(fieldType: FieldType, isImport: boolean): LfFieldTokenId[] {
    switch (fieldType) {
      case FieldType.Date:
        return isImport ? this.defaultDateTokens.concat(LfFieldTokenId.FILE_MODIFIED) : this.defaultDateTokens;
      case FieldType.DateTime:
        return isImport ? this.defaultDateTimeTokens.concat(LfFieldTokenId.FILE_MODIFIED) : this.defaultDateTimeTokens;
      case FieldType.Time:
        return isImport ? this.defaultTimeTokens.concat(LfFieldTokenId.FILE_MODIFIED) : this.defaultTimeTokens;
      case FieldType.LongInteger:
      case FieldType.Number:
      case FieldType.ShortInteger:
        return this.defaultNumberTokens;
      case FieldType.String:
        return isImport ? this.defaultStringTokens.concat([
          LfFieldTokenId.FILE_NAME,
          LfFieldTokenId.FILE_EXTENSION,
          LfFieldTokenId.FILE_MODIFIED
        ]) : this.defaultStringTokens;
      default:
        return [];
    }
  }

  containsTokenForFieldType(fieldValue: string, fieldType: FieldType, isImport: boolean): boolean {
    if (!fieldValue || fieldValue === '') {
      return false;
    }
    const validTokens: LfFieldTokenId[] = this.getTokensForFieldType(fieldType, isImport);
    const lowercaseFieldValue: string = fieldValue.toString().toLowerCase();
    for (const validToken of validTokens) {
      const tokenText = this.getTokenText(validToken)?.toLowerCase();
      if (tokenText) {
        if (fieldType === FieldType.String) {
          if (this.fieldIsToken(lowercaseFieldValue, tokenText)) {
            return true;
          }
        }
        else {
          if (this.fieldIsOnlyToken(lowercaseFieldValue, tokenText)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private fieldIsToken(fieldVal: string, token: string): boolean {
    const trimmedFieldVal = fieldVal.trim();
    const tokenRegExp: RegExp = new RegExp(`%\\(${token}(:.*)?\\)`);
    const matches = trimmedFieldVal.match(tokenRegExp);
    return (matches !== null);
  }

  private fieldIsOnlyToken(fieldVal: string, token: string): boolean {
    const trimmedFieldVal = fieldVal.trim();
    const tokenRegExp: RegExp = new RegExp(`^%\\(${token}(:.*)?\\)$`);
    const matches = trimmedFieldVal.match(tokenRegExp);
    return (matches !== null && trimmedFieldVal === matches[0]);
  }
}

export enum LfFieldTokenId {
  DATE,
  TIME,
  DATETIME,
  SESSION_COUNT,
  REPOSITORY_COUNT,
  USER_NAME,
  ENTRY_NAME,
  PARENT_NAME,
  ENTRY_ID,
  PARENT_ID,
  PARENT_FIELD,
  FILE_MODIFIED,
  FILE_NAME,
  FILE_EXTENSION
}

export interface LfFieldTokenData {
  fieldType: FieldType;
}
