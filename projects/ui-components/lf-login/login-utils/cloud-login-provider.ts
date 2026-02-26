// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { EventEmitter, Injectable } from '@angular/core';
import { LoginProvider } from './login-provider';
import { DomainUtils, TokenClient } from '@laserfiche/lf-api-client-core';
import { LfLoginService } from './lf-login.service';
import { AuthorizationCredentials } from './lf-login-types';
import { RedirectUriQueryParams } from './lf-login-internal-types';
import { LoginState } from '@laserfiche/lf-ui-components/shared';

@Injectable({
  providedIn: 'root',
})
export class CloudLoginProvider implements LoginProvider {
    /** @internal */
  readonly CLOUDDEV = 'clouddev';
  /** @internal */
  readonly CLOUDTEST = 'cloudtest';

  constructor(private lfLoginService: LfLoginService) {}

  getTokenClient(tokenClientUrl: string) {
    return new TokenClient(tokenClientUrl);
  }

    /** @internal */
  getBaseAuthorizeUrl(): string  {
    let baseAuthorizeUrl: string;
    const lastOAuthAuthorizeUrl = this.lfLoginService.getAccountEndpoints()?.oauthAuthorizeUrl;
    const configuredHostName = this.lfLoginService.authorize_url_host_name;

    const bothClouddev = configuredHostName.includes(this.CLOUDDEV) && lastOAuthAuthorizeUrl?.includes(this.CLOUDDEV);
    const bothCloudtest =
    configuredHostName.includes(this.CLOUDTEST) && lastOAuthAuthorizeUrl?.includes(this.CLOUDTEST);
    const bothCloudprod =
    lastOAuthAuthorizeUrl &&
    !configuredHostName.includes(this.CLOUDDEV) &&
    !configuredHostName.includes(this.CLOUDTEST) &&
    !lastOAuthAuthorizeUrl?.includes(this.CLOUDDEV) &&
    !lastOAuthAuthorizeUrl?.includes(this.CLOUDTEST);

    const sameEnvironment = bothClouddev || bothCloudtest || bothCloudprod;

    if (sameEnvironment && lastOAuthAuthorizeUrl) {
      baseAuthorizeUrl = lastOAuthAuthorizeUrl;
    } else {
      baseAuthorizeUrl = `https://signin.${this.lfLoginService.authorize_url_host_name}/oauth/Authorize`;
    }

    return baseAuthorizeUrl;
  }


  storeInLocalStorage(accessTokenCredentials: AuthorizationCredentials, accountId: string, regionalDomain: string) {
    this.lfLoginService.storeAccessToken(accessTokenCredentials);
    const trusteeId: string = this.lfLoginService.parseAccessToken(accessTokenCredentials.accessToken);
    const endpoints = DomainUtils.getLfEndpoints(regionalDomain);
    this.lfLoginService.storeAccountInfo(accountId, trusteeId);
    this.lfLoginService.storeAccountEndpoints(endpoints);
  }

  exchangeRedirectUriQueryParams(url: URL): RedirectUriQueryParams {
    const authorizationCode = this.lfLoginService.extractCodeFromUrl(url);
    const domain = this.lfLoginService.extractDomainFromUrl(url);
    const customerId = this.lfLoginService.extractCustomerIdFromUrl(url);
    const error = this.lfLoginService.extractErrorFromUrl(url);
    if (authorizationCode && domain && customerId) {
      return {
        authorizationCode,
        cloudSubDomain: domain,
        customerId,
      };
    } else if (error) {
      return { error };
    } else {
      throw new Error('Unable to parse callback');
    }
  }

  determineCurrentState(
    callBackURIParams: RedirectUriQueryParams | undefined,
    loginCompleted: EventEmitter<void>,
    logoutCompleted: EventEmitter<void>,
  ): LoginState {
    const storedAccessToken = localStorage.getItem(this.lfLoginService.accessTokenStorageKey!);
    const storedAccountEndpoints = localStorage.getItem(this.lfLoginService.accountEndpointsStorageKey);
    const storedAccountId = localStorage.getItem(this.lfLoginService.accountIdStorageKey);

    if (storedAccessToken && storedAccountEndpoints && storedAccountId) {
      this.lfLoginService._accessToken = JSON.parse(storedAccessToken);
      this.lfLoginService._accountEndpoints = JSON.parse(storedAccountEndpoints);
      const accountInfo = JSON.parse(storedAccountId);
      this.lfLoginService._accountInfo = accountInfo;
      loginCompleted.emit();
      return LoginState.LoggedIn;
    } else if (callBackURIParams?.authorizationCode || callBackURIParams?.error) {
      return LoginState.LoggingIn;
    } else {
      logoutCompleted.emit();
      return LoginState.LoggedOut;
    }
  }

  logoutInitiatedViaUrl(url: string | undefined, logoutInitiated: { emit: (url?: string) => void; }): void {
    logoutInitiated.emit(url);
  }
}
