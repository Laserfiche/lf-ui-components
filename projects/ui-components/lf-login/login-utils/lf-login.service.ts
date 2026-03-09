// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { EventEmitter, Injectable, Output } from '@angular/core';
import { AccountInfo, RedirectUriQueryParams } from './lf-login-internal-types';
import { AbortedLoginError, AuthorizationCredentials, AccountEndpoints, LoginType } from './lf-login-types';
import { LoginState, RedirectBehavior } from '@laserfiche/lf-ui-components/shared';
import { GetAccessTokenResponse, ApiException, JwtUtils } from '@laserfiche/lf-api-client-core';
import { LoginProvider } from './login-provider';
const CONTENT_TYPE_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';

@Injectable({
  providedIn: 'root',
})
export class LfLoginService {
  /** @internal */
  _accessToken?: AuthorizationCredentials;
  /** @internal */
  _accountInfo?: AccountInfo;
  /** @internal */
  _accountEndpoints?: AccountEndpoints;
  /** @internal */
  _state?: LoginState;

  /** @internal */
  client_id?: string;
  /** @internal */
  redirect_uri!: string;
  /** @internal */
  scope?: string;
  /** @internal */
  redirect_behavior: RedirectBehavior = RedirectBehavior.Replace;
  /** @internal */
  authorize_url_host_name: string = 'laserfiche.com';
  /** @internal */
  self_hosted_base_url?: string;
  /** @internal */
  self_hosted_account_endpoints?: AccountEndpoints;

  /** @internal */
  code_verifier?: string;
  /** @internal */
  login_type: LoginType = 'Cloud';
  /** @internal */
  loginProvider?: LoginProvider;
  /** @internal */
  login_identifier: string = this.client_id ?? '';

  /** @internal */
  @Output() logoutCompletedInService: EventEmitter<AbortedLoginError | undefined> = new EventEmitter<
    AbortedLoginError | undefined
  >();
  /** @internal */
  @Output() loginCompletedInService: EventEmitter<void> = new EventEmitter<void>();

  /** @internal */
  private get base64EncodedLoginIdentifier(): string {
    return btoa(this.login_identifier);
  }

  /** @internal */
  get accountIdStorageKey() {
    return `lf-login.${this.base64EncodedLoginIdentifier}.account-id`;
  }

  /** @internal */
  get accountEndpointsStorageKey() {
    return `lf-login.${this.base64EncodedLoginIdentifier}.account-endpoints`;
  }

  /** @internal */
  get accessTokenStorageKey() {
    return `lf-login.${this.base64EncodedLoginIdentifier}.access-token`;
  }

  /** @internal */
  get codeVerifierStorageKey() {
    return `lf-login.${this.base64EncodedLoginIdentifier}.code-verifier`;
  }

  /** @internal */
  private exchangeCodeForToken_lock: boolean = false;

  /** @internal */
  getAccountEndpoints(): AccountEndpoints | undefined {
    try {
      const accountEndpointsFromStorage = localStorage.getItem(this.accountEndpointsStorageKey);
      if (accountEndpointsFromStorage) {
        const accountEndpoints: AccountEndpoints = JSON.parse(accountEndpointsFromStorage);
        return accountEndpoints;
      } else {
        return undefined;
      }
      // }
    } catch (err: any) {
      console.warn('Unable to retrieve accountEndpoints: ' + err.message);
      return undefined;
    }
  }

  /** @internal */
  async exchangeCodeForTokenAsync(callBackURIParams: RedirectUriQueryParams) {
    let concurrentCallsDetected: boolean = false;
    try {
      if (this.exchangeCodeForToken_lock) {
        concurrentCallsDetected = true;
        console.warn('exchangeCodeForTokenAsync is already running. Will not try again.');
        return;
      }
      this.exchangeCodeForToken_lock = true;
      this.code_verifier = localStorage.getItem(this.codeVerifierStorageKey)!;
      const tokenClient = this.loginProvider?.getTokenClient(callBackURIParams.cloudSubDomain!);
      if (callBackURIParams.authorizationCode && this.code_verifier && tokenClient) {
        try {
          const response = await tokenClient.getAccessTokenFromCode(
            callBackURIParams.authorizationCode,
            this.redirect_uri,
            this.client_id,
            undefined,
            this.code_verifier,
          );
          const accessToken = await this.parseTokenResponseAsync(response);
          this.loginProvider?.storeInLocalStorage(
            accessToken!,
            callBackURIParams.customerId!,
            callBackURIParams.cloudSubDomain!,
          );
          this._state = LoginState.LoggedIn;
          console.info('state changed to LoggedIn');
          this.loginCompletedInService.emit();
        } catch (e) {
          const status = (<ApiException>e).status ?? 0;
          const message = (<ApiException>e).message;
          this.removeFromLocalStorage();
          this._state = LoginState.LoggedOut;
          console.error('Login Error (state changed to LoggedOut): ' + message);
          this.logoutCompletedInService.emit({
            ErrorType: status.toString(),
            ErrorMessage: message,
          });
        }
      } else if (callBackURIParams.error) {
        this._state = LoginState.LoggedOut;
        this.removeFromLocalStorage();
        this.logoutCompletedInService.emit({
          ErrorType: callBackURIParams.error.name,
          ErrorMessage: callBackURIParams.error.description!,
        });
        console.error(
          'Login Error (state changed to Logged Out): ' +
            callBackURIParams.error.name +
            ', ' +
            callBackURIParams.error.description,
        );
      } else if (callBackURIParams.authorizationCode && !this.code_verifier) {
        this._state = LoginState.LoggedOut;
        this.removeFromLocalStorage();
        this.logoutCompletedInService.emit({
          ErrorType: 'no code verifier',
          ErrorMessage: 'code verifier not found',
        });
        console.error('Login Error (state changed to Logged Out): unable to find code verifier');
      } else if (!tokenClient) {
        this._state = LoginState.LoggedOut;
        this.removeFromLocalStorage();
        this.logoutCompletedInService.emit({
          ErrorType: 'TokenClient is undefined',
          ErrorMessage: 'TokenClient is undefined',
        });
        console.error('Login Error (state changed to Logged Out): unable to use an undefined TokenClient', tokenClient);
      } else {
        throw new Error('Unexpected callBackURIParams');
      }
    } finally {
      if (!concurrentCallsDetected) {
        this.exchangeCodeForToken_lock = false;
      }
    }
  }

  /** @internal */
  async parseTokenResponseAsync(response: GetAccessTokenResponse): Promise<AuthorizationCredentials | undefined> {
    try {
      const authorizationCredentials = this.getExchangeCodeSuccessResponse(response);
      return authorizationCredentials;
    } catch {
      throw Error('Parse token response error.');
    }
  }

  /** @internal */
  getExchangeCodeSuccessResponse(jsonResponse: any) {
    const accessToken = jsonResponse['access_token'];
    const refreshToken = jsonResponse['refresh_token'] ?? jsonResponse['refreshToken'];
    const expiresIn = jsonResponse['expires_in'];
    const tokenType = jsonResponse['token_type'];
    if (!accessToken) throw new Error('access_token undefined');
    if (!expiresIn) throw new Error('expires_in undefined');
    if (!tokenType) throw new Error('token_type undefined');
    if (!refreshToken) throw new Error('refresh_token undefined');

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType,
    };
  }

  /** @internal */
  removeFromLocalStorage() {
    this.removeCodeVerifierFromLocalStorage();
    localStorage.removeItem(this.accessTokenStorageKey!);
    localStorage.removeItem(this.accountIdStorageKey!);
    this.removeFromCache();
  }

  removeFromCache() {
    this._accessToken = undefined;
    this._accountInfo = undefined;
  }

  /** @internal */
  removeCodeVerifierFromLocalStorage() {
    localStorage.removeItem(this.codeVerifierStorageKey!);
    this.code_verifier = undefined;
  }

  /** @internal */
  createPostTokenRequest(code: string): RequestInit {
    const request: RequestInit = { method: 'POST' };
    const headers = this.getPostRequestHeaders();
    const body = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirect_uri,
      client_id: this.client_id,
      code_verifier: this.code_verifier,
    };
    const requestBody = this.objToWWWFormUrlEncodedBody(body);
    request.headers = headers;
    request.body = requestBody;
    return request;
  }

  /** @internal */
  storeAccessToken(responseBody: AuthorizationCredentials) {
    localStorage.setItem(this.accessTokenStorageKey!, JSON.stringify(responseBody));
    this._accessToken = responseBody;
  }

  /** @internal */
  storeCodeVerifier(code_verifier: string) {
    localStorage.setItem(this.codeVerifierStorageKey!, code_verifier);
  }

  /** @internal */
  getPostRequestHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPE_WWW_FORM_URLENCODED,
    };

    return headers;
  }

  /** @internal */
  objToWWWFormUrlEncodedBody(obj: any): string {
    const urlSearchParams = new URLSearchParams();
    for (const i in obj) {
      urlSearchParams.set(i, obj[i]);
    }
    return urlSearchParams.toString();
  }

  /** @internal */
  parseAccessToken(accessToken: string): string {
    const decodedAccessToken = JwtUtils.parseAccessToken(accessToken);
    const trusteeId = JwtUtils.getTrusteeIdFromLfJWT(decodedAccessToken);
    return trusteeId;
  }

  /** @internal */
  storeAccountEndpoints(accountEndpoints: AccountEndpoints) {
    localStorage.setItem(this.accountEndpointsStorageKey!, JSON.stringify(accountEndpoints));
    this._accountEndpoints = accountEndpoints;
  }

  /** @internal */
  storeAccountInfo(accountId: string, trusteeId: string) {
    const accountInfo: AccountInfo = {
      accountId,
      trusteeId,
    };
    localStorage.setItem(this.accountIdStorageKey!, JSON.stringify(accountInfo));
    this._accountInfo = accountInfo;
  }

  refreshServiceAccountProperties() {
    const accountInfo = localStorage.getItem(this.accountIdStorageKey);
    const accountEndpoints = localStorage.getItem(this.accountEndpointsStorageKey);
    this._accountInfo = JSON.parse(accountInfo!);
    this._accountEndpoints = JSON.parse(accountEndpoints!);
  }

  /** @internal */
  extractErrorFromUrl(url: URL): { name: string; description: string } | undefined {
    const error = url.searchParams.get('error');
    if (error) {
      const description = url.searchParams.get('description') ?? 'unknown';
      return { name: error, description };
    } else {
      return undefined;
    }
  }

  /** @internal */
  extractCodeFromUrl(url: URL): string | undefined {
    return url.searchParams.get('code') ?? undefined;
  }

  /** @internal */
  extractDomainFromUrl(url: URL): string | undefined {
    return url.searchParams.get('domain') ?? undefined;
  }

  /** @internal */
  extractCustomerIdFromUrl(url: URL): string | undefined {
    return url.searchParams.get('customerId') ?? undefined;
  }
}
