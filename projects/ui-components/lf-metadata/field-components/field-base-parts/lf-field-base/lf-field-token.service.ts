import { Injectable } from '@angular/core';
import { AppLocalizationService } from '@laserfiche/laserfiche-ui-components/shared';
import { FieldType } from '@laserfiche/laserfiche-ui-components/shared';
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

  private readonly TOKEN_DATE_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_DATE_FRIENDLYNAME');
  private readonly TOKEN_TIME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_TIME_FRIENDLYNAME');
  private readonly TOKEN_DATETIME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_DATETIME_FRIENDLYNAME');
  private readonly TOKEN_COUNT_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_COUNT_FRIENDLYNAME');
  private readonly TOKEN_GCOUNT_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_GCOUNT_FRIENDLYNAME');
  private readonly TOKEN_USERNAME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_USERNAME_FRIENDLYNAME');
  private readonly TOKEN_NAME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_NAME_FRIENDLYNAME');
  private readonly TOKEN_PARENTNAME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_PARENTNAME_FRIENDLYNAME');
  private readonly TOKEN_ID_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_ID_FRIENDLYNAME');
  private readonly TOKEN_PARENTID_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_PARENTID_FRIENDLYNAME');
  private readonly TOKEN_PARENT_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_PARENT_FRIENDLYNAME');
  private readonly TOKEN_FILENAME_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_FILENAME_FRIENDLYNAME');
  private readonly TOKEN_FILE_EXTENSION_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_FILE_EXTENSION_FRIENDLYNAME');
  private readonly TOKEN_FILE_MODIFIED_FRIENDLYNAME = this.localizationService.getStringObservable('TOKEN_FILE_MODIFIED_FRIENDLYNAME');

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
        return this.TOKEN_DATE_FRIENDLYNAME;
      }
      case LfFieldTokenId.TIME: {
        return this.TOKEN_TIME_FRIENDLYNAME;
      }
      case LfFieldTokenId.DATETIME: {
        return this.TOKEN_DATETIME_FRIENDLYNAME;
      }
      case LfFieldTokenId.SESSION_COUNT: {
        return this.TOKEN_COUNT_FRIENDLYNAME;
      }
      case LfFieldTokenId.REPOSITORY_COUNT: {
        return this.TOKEN_GCOUNT_FRIENDLYNAME;
      }
      case LfFieldTokenId.USER_NAME: {
        return this.TOKEN_USERNAME_FRIENDLYNAME;
      }
      case LfFieldTokenId.ENTRY_NAME: {
        return this.TOKEN_NAME_FRIENDLYNAME;
      }
      case LfFieldTokenId.PARENT_NAME: {
        return this.TOKEN_PARENTNAME_FRIENDLYNAME;
      }
      case LfFieldTokenId.ENTRY_ID: {
        return this.TOKEN_ID_FRIENDLYNAME;
      }
      case LfFieldTokenId.PARENT_ID: {
        return this.TOKEN_PARENTID_FRIENDLYNAME;
      }
      case LfFieldTokenId.PARENT_FIELD: {
        return this.TOKEN_PARENT_FRIENDLYNAME;
      }
      case LfFieldTokenId.FILE_NAME: {
        return this.TOKEN_FILENAME_FRIENDLYNAME;
      }
      case LfFieldTokenId.FILE_EXTENSION: {
        return this.TOKEN_FILE_EXTENSION_FRIENDLYNAME;
      }
      case LfFieldTokenId.FILE_MODIFIED: {
        return this.TOKEN_FILE_MODIFIED_FRIENDLYNAME;
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

  containsTokenForFieldType(fieldValue: string | null, fieldType: FieldType, isImport: boolean): boolean {
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
