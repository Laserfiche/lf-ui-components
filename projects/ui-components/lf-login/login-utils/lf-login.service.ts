import { EventEmitter, Injectable, Output } from '@angular/core';
import { AccountInfo, AccessTokenError, OAuthAccessTokenData } from './lf-login-internal-types';
import { AbortedLoginError, AuthorizationCredentials, AccountEndpoints } from './lf-login-types';
import { LoginState, RedirectBehavior } from '@laserfiche/lf-ui-components/shared';
import { JwtUtils  } from '@laserfiche/lf-api-client-core';
const CONTENT_TYPE_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';

@Injectable({
  providedIn: 'root'
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
  regionSpecificHostName?: string;

  /** @internal */
  client_id!: string;
  /** @internal */
  redirect_uri!: string;
  /** @internal */
  scope!: string;
  /** @internal */
  redirect_behavior: RedirectBehavior = RedirectBehavior.Replace;
  /** @internal */
  authorize_url_host_name: string = 'laserfiche.com';
  /** @internal */
  code_verifier?: string;

  /** @internal */
  @Output() logoutCompletedInService: EventEmitter<AbortedLoginError | undefined> = new EventEmitter<AbortedLoginError | undefined>();
  /** @internal */
  @Output() loginCompletedInService: EventEmitter<void> = new EventEmitter<void>();

  /** @internal */
  private get base64EncodedClientId(): string {
    return btoa(this.client_id);
  }

  /** @internal */
  get accountIdStorageKey() {
    return `lf-login.${this.base64EncodedClientId}.account-id`;
  }

  /** @internal */
  get accountEndpointsStorageKey() {
    return `lf-login.${this.base64EncodedClientId}.account-endpoints`;
  }

  /** @internal */
  get accessTokenStorageKey() {
    return `lf-login.${this.base64EncodedClientId}.access-token`;
  }

  /** @internal */
  get codeVerifierStorageKey() {
    return `lf-login.${this.base64EncodedClientId}.code-verifier`;
  }

  /** @internal */
  private exchangeCodeForToken_lock: boolean = false;

  /** @internal */
  async exchangeCodeForTokenAsync(callBackURIParams: { error?: { name: string; description: string } | undefined; authorizationCode?: string | undefined }) {
    let concurrentCallsDetected: boolean = false;
    try {
      if (this.exchangeCodeForToken_lock) {
        concurrentCallsDetected = true;
        console.warn('exchangeCodeForTokenAsync is already running. Will not try again.');
        return;
      }
      this.exchangeCodeForToken_lock = true;
      this.code_verifier = localStorage.getItem(this.codeVerifierStorageKey)!;
      if (callBackURIParams.authorizationCode && this.code_verifier) {
        const response = await this.getTokenAsync(callBackURIParams.authorizationCode);
        await this.parseTokenResponseAsync(response);
      }
      else if (callBackURIParams.error) {
        this._state = LoginState.LoggedOut;
        this.removeFromLocalStorage();
        this.logoutCompletedInService.emit({
          ErrorType: callBackURIParams.error.name,
          ErrorMessage: callBackURIParams.error.description!
        });
        console.error('Login Error (state changed to Logged Out): ' + callBackURIParams.error.name + ', ' + callBackURIParams.error.description);
      }
      else if (callBackURIParams.authorizationCode && !this.code_verifier) {
        this._state = LoginState.LoggedOut;
        this.removeFromLocalStorage();
        this.logoutCompletedInService.emit({
          ErrorType: 'no code verifier',
          ErrorMessage: 'code verifier not found'
        });
        console.error('Login Error (state changed to Logged Out): unable to find code verifier');
      }
      else {
        throw new Error('Unexpected callBackURIParams');
      }
    }
    finally {
      if (!concurrentCallsDetected) {
        this.exchangeCodeForToken_lock = false;
      }
    }
  }

  /** @internal */
  private async getTokenAsync(code: string) {
    const request = this.createPostTokenRequest(code);
    const response = await fetch(
      this.getOAuthTokenUrl(),
      request
    );
    return response;
  }

  /** @internal */
  getOAuthTokenUrl(): RequestInfo {
    return `https://signin.${this.authorize_url_host_name}/oauth/token`;
  }

  /** @internal */
  async parseTokenResponseAsync(response: Response, refresh: boolean = false): Promise<string | undefined> {
    const jsonResponse = await response.json();
    if (jsonResponse['access_token']) {
      const accessTokenSuccess: AuthorizationCredentials = this.getExchangeCodeSuccessResponse(jsonResponse);
      this.storeInLocalStorage(accessTokenSuccess);
      this._state = LoginState.LoggedIn;
      console.info('state changed to LoggedIn');
      this.loginCompletedInService.emit();
      return accessTokenSuccess.accessToken;
    } else {
      const accessTokenError: AccessTokenError = this.getExchangeCodeErrorResponse(jsonResponse, response.status);
      this.removeFromLocalStorage();
      this._state = LoginState.LoggedOut;
      console.error('Login Error (state changed to LoggedOut): ' + accessTokenError);
      this.logoutCompletedInService.emit(
        {
          ErrorType: accessTokenError.status.toString(),
          ErrorMessage: accessTokenError.title
        });
      return undefined;
    }
  }

  /** @internal */
  removeFromLocalStorage() {
    this.removeCodeVerifierFromLocalStorage();
    localStorage.removeItem(this.accessTokenStorageKey!);
    localStorage.removeItem(this.accountIdStorageKey!);
    localStorage.removeItem(this.accountEndpointsStorageKey!);
    this.removeFromCache();
  }

  removeFromCache() {
    this._accessToken = undefined;
    this._accountInfo = undefined;
    this._accountEndpoints = undefined;
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
      code_verifier: this.code_verifier
    };
    const requestBody = this.objToWWWFormUrlEncodedBody(body);
    request.headers = headers;
    request.body = requestBody;
    return request;
  }

  /** @internal */
  getExchangeCodeSuccessResponse(jsonResponse: any) {
    const accessToken = jsonResponse['access_token'];
    const refreshToken = jsonResponse['refresh_token'];
    const expiresIn = jsonResponse['expires_in'];
    const tokenType = jsonResponse['token_type'];
    if (!accessToken) throw new Error('access_token undefined');
    if (!refreshToken) throw new Error('refresh_token undefined');
    if (!expiresIn) throw new Error('expires_in undefined');
    if (!tokenType) throw new Error('token_type undefined');

    const accessTokenResponse: AuthorizationCredentials = {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType
    };
    return accessTokenResponse;
  }

  /** @internal */
  private storeAccessToken(responseBody: AuthorizationCredentials) {
    localStorage.setItem(this.accessTokenStorageKey!, JSON.stringify(responseBody));
    this._accessToken = responseBody;
  }

  /** @internal */
  storeCodeVerifier(code_verifier: string) {
    localStorage.setItem(this.codeVerifierStorageKey!, code_verifier);
  }

  /** @internal */
  storeInLocalStorage(accessTokenCredentials: AuthorizationCredentials) {
    const parsedAccessToken: OAuthAccessTokenData = this.parseAccessToken(accessTokenCredentials.accessToken);
    this.storeAccountInfo(parsedAccessToken);
    this.storeAccountEndpoints(parsedAccessToken);
    this.storeAccessToken(accessTokenCredentials);
  }

  /** @internal */
  getExchangeCodeErrorResponse(jsonResponse: any, responseStatus: number) {
    const responseError: AccessTokenError = {
      type: jsonResponse['type'],
      title: jsonResponse['title'] ?? responseStatus.toString(),
      status: responseStatus,
      instance: jsonResponse['instance'],
      operationId: jsonResponse['operationId'],
      traceId: jsonResponse['traceId']
    };
    return responseError;
  }

  /** @internal */
  getPostRequestHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': CONTENT_TYPE_WWW_FORM_URLENCODED
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
  parseAccessToken(accessToken: string): OAuthAccessTokenData {
    const decodedAccessToken = JwtUtils.parseAccessToken(accessToken);
    const accountId = JwtUtils.getAccountIdFromLfJWT(decodedAccessToken);
    const trusteeId = JwtUtils.getTrusteeIdFromLfJWT(decodedAccessToken);
    this.regionSpecificHostName = JwtUtils.getLfRegionalDomainFromAccountId(accountId);
    const devEnvironment = JwtUtils.getLfDevEnvironmentSubDomain(this.authorize_url_host_name);
    const endpoints = JwtUtils.getLfEndpoints(accountId, devEnvironment);
    const parsedAccessToken: OAuthAccessTokenData = {
      accountId,
      trusteeId,
      webClientUrl: endpoints.webClientUrl,
      repositoryApiBaseUrl: endpoints.repositoryApiBaseUrl,
      wsignoutUrl: endpoints.wsignoutUrl,
    };
    return parsedAccessToken;
  }

  /** @internal */
  private storeAccountEndpoints(accessToken: OAuthAccessTokenData) {
    const accountEndpoints: AccountEndpoints = {
      webClientUrl: accessToken.webClientUrl,
      repositoryApiBaseUrl: accessToken.repositoryApiBaseUrl,
      wsignoutUrl: accessToken.wsignoutUrl
    };
    localStorage.setItem(this.accountEndpointsStorageKey!, JSON.stringify(accountEndpoints));
    this._accountEndpoints = accountEndpoints;
  }

  /** @internal */
  private storeAccountInfo(accessToken: OAuthAccessTokenData) {
    const accountInfo = {
      accountId: accessToken.accountId,
      trusteeId: accessToken.trusteeId
    };
    localStorage.setItem(this.accountIdStorageKey!, JSON.stringify(accountInfo));
    this._accountInfo = accountInfo;
  }
}
