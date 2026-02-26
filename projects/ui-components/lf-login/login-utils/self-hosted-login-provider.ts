// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { EventEmitter, Inject, Injectable } from '@angular/core';
import { LoginProvider } from './login-provider';
import { LfLoginService } from './lf-login.service';
import { SelfHostedTokenClient, BaseTokenClient} from '@laserfiche/lf-api-client-core';
import { AuthorizationCredentials } from './lf-login-types';
import { RedirectUriQueryParams } from './lf-login-internal-types';
import { LoginState } from '@laserfiche/lf-ui-components/shared';

@Injectable({
  providedIn: 'root',
})
export class SelfHostedLoginProvider implements LoginProvider {
  constructor(
    private lfLoginService: LfLoginService,
    @Inject('repositoryId') private readonly repositoryId: string,
  ) {}

  getTokenClient() {
    return new SelfHostedTokenClient(`${this.lfLoginService.self_hosted_base_url}/v2/Repositories/${this.repositoryId}/Token`);
  }

  getBaseAuthorizeUrl(): string {
    return this.lfLoginService.self_hosted_account_endpoints?.oauthAuthorizeUrl ?? '';
  }

  storeInLocalStorage(accessTokenCredentials: AuthorizationCredentials, _accountId: string, _regionalDomain: string) {
    this.lfLoginService.storeAccessToken(accessTokenCredentials);
    if (this.lfLoginService.self_hosted_account_endpoints) {
      this.lfLoginService.storeAccountEndpoints(this.lfLoginService.self_hosted_account_endpoints);
    }
  }

  exchangeRedirectUriQueryParams(url: URL): RedirectUriQueryParams {
    const authorizationCode = this.lfLoginService.extractCodeFromUrl(url);
    const error = this.lfLoginService.extractErrorFromUrl(url);
    if (authorizationCode) {
      return {
        authorizationCode,
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
    if (storedAccessToken && storedAccountEndpoints) {
      this.lfLoginService._accessToken = JSON.parse(storedAccessToken);
      this.lfLoginService._accountEndpoints = JSON.parse(storedAccountEndpoints);
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
    if (url) {
      logoutInitiated.emit(url);
    }
  }
}
