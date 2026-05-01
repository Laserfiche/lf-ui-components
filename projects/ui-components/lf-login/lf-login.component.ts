// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Observable, of, Subscription } from 'rxjs';
import { AccountInfo, RedirectUriQueryParams } from './login-utils/lf-login-internal-types';
import {
  AbortedLoginError,
  AccountEndpoints,
  AuthorizationCredentials,
  LfBeforeFetchResult,
  LfHttpRequestHandler,
} from './login-utils/lf-login-types';
import { LoginMode, LoginState, LoginType, RedirectBehavior } from '@laserfiche/lf-ui-components/shared';
import { AppLocalizationService } from '@laserfiche/lf-ui-components/internal-shared';
import { LfLoginService } from './login-utils/lf-login.service';
import { ApiException, PKCEUtils } from '@laserfiche/lf-api-client-core';
import { CloudLoginProvider } from './login-utils/cloud-login-provider';
import { SelfHostedLoginProvider } from './login-utils/self-hosted-login-provider';

const LOGIN_REDIRECT_STATE = 'lf-login-redirect';
const CODE_CHALLENGE_METHOD = 'S256';
@Component({
  selector: 'lf-login-component',
  templateUrl: './lf-login.component.html',
  styleUrls: ['./lf-login.component.css'],
  standalone: true,
  imports: [CommonModule, MatMenuModule],
})
export class LfLoginComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  /**@internal */
  private ref = inject(ChangeDetectorRef);
  /**@internal */
  private loginService = inject(LfLoginService);
  /**@internal */
  private localizationService = inject(AppLocalizationService);

  @Input() mode: LoginMode = LoginMode.Button;

  /**
   * @return {LfHttpRequestHandler}
   * Returns the LfHttpRequestHandler that can be used
   * to instantiate a repository API client.
   */
  @Input()
  get authorizationRequestHandler(): LfHttpRequestHandler {
    return {
      beforeFetchRequestAsync: this.beforeFetchRequestAsync.bind(this),
      afterFetchResponseAsync: this.afterFetchResponseAsync.bind(this),
    };
  }

  /** @internal */
  get isMenuMode(): boolean {
    return this.mode === LoginMode.Menu;
  }

  /** @internal */
  _sign_in_text: Observable<string> = this.localizationService.getStringLaserficheObservable('SIGN_IN');
  /** @internal */
  _sign_out_text: Observable<string> = this.localizationService.getStringLaserficheObservable('SIGN_OUT');
  /** @internal */
  _signing_in_text: Observable<string> = this.localizationService.getStringLaserficheObservable('SIGNING_IN');
  /** @internal */
  _signing_out_text: Observable<string> = this.localizationService.getStringLaserficheObservable('SIGNING_OUT');

  @Input() set sign_in_text(text: string) {
    this._sign_in_text = of(text);
  }
  @Input() set sign_out_text(text: string) {
    this._sign_out_text = of(text);
  }
  @Input() set signing_in_text(text: string) {
    this._signing_in_text = of(text);
  }
  @Input() set signing_out_text(text: string) {
    this._signing_out_text = of(text);
  }

  /** @internal */
  buttonText: Observable<string> = this._sign_in_text;

  @Input() set client_id(val: string) {
    this.loginService.client_id = val;
  }
  get client_id(): string | undefined {
    return this.loginService.client_id;
  }

  @Input() set redirect_uri(val: string) {
    this.loginService.redirect_uri = val;
  }
  get redirect_uri(): string {
    return this.loginService.redirect_uri;
  }

  @Input() set scope(val: string) {
    this.loginService.scope = val;
  }
  get scope(): string | undefined {
    return this.loginService.scope;
  }

  @Input() set redirect_behavior(val: RedirectBehavior) {
    this.loginService.redirect_behavior = val;
  }
  get redirect_behavior(): RedirectBehavior {
    return this.loginService.redirect_behavior;
  }

  @Input() set authorize_url_host_name(val: string) {
    this.loginService.authorize_url_host_name = val;
  }

  get authorize_url_host_name(): string {
    return this.loginService.authorize_url_host_name;
  }

  @Input() set login_type(val: LoginType) {
    this.loginService.login_type = val;
  }

  get login_type(): LoginType {
    return this.loginService.login_type;
  }

  @Input() set login_identifier(val: string) {
    this.loginService.login_identifier = val;
  }

  get login_identifier(): string {
    return this.loginService.login_identifier;
  }

  @Input()
  get authorization_credentials(): AuthorizationCredentials | undefined {
    try {
      if (this.loginService._accessToken) {
        return this.loginService._accessToken;
      } else {
        const accessTokenFromStorage = localStorage.getItem(this.loginService.accessTokenStorageKey);
        if (accessTokenFromStorage) {
          const accessTokenCredentials: AuthorizationCredentials = JSON.parse(accessTokenFromStorage);
          return accessTokenCredentials;
        } else {
          return undefined;
        }
      }
    } catch (err: any) {
      console.warn('Unable to retrieve accessToken: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get account_endpoints(): AccountEndpoints | undefined {
    return this.loginService.getAccountEndpoints();
  }

  @Input()
  get account_id(): string | undefined {
    try {
      if (this.loginService._accountInfo) {
        return this.loginService._accountInfo.accountId;
      } else {
        const accountInfoFromStorage = localStorage.getItem(this.loginService.accountIdStorageKey);
        if (accountInfoFromStorage) {
          const accountInfo: AccountInfo = JSON.parse(accountInfoFromStorage);
          return accountInfo.accountId;
        } else {
          return undefined;
        }
      }
    } catch (err: any) {
      console.warn('Unable to retrieve accountId: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get trustee_id(): string | undefined {
    try {
      if (this.loginService._accountInfo) {
        return this.loginService._accountInfo.trusteeId;
      } else {
        const accountInfoFromStorage = localStorage.getItem(this.loginService.accountIdStorageKey);
        if (accountInfoFromStorage) {
          const accountInfo: AccountInfo = JSON.parse(accountInfoFromStorage);
          return accountInfo.trusteeId;
        } else {
          return undefined;
        }
      }
    } catch (err: any) {
      console.warn('Unable to retrieve trusteeId: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get state(): LoginState {
    return this.loginService._state ?? LoginState.LoggedOut;
  }

  private set _state(state: LoginState) {
    this.loginService._state = state;
    this.setButtonText();
  }

  @Output() loginInitiated = new EventEmitter<string>();
  @Output() logoutInitiated = new EventEmitter<string>();

  @Output() loginCompleted = new EventEmitter<void>();
  @Output() logoutCompleted = new EventEmitter<AbortedLoginError | void>();

  /**
   * Refreshes and returns the access token
   * @param initiateLoginFlowOnRefreshFailure
   * Indicates whether an attempt should be made to login using OAuth flow upon encountering an inability to refresh the access token.
   * @returns  {Promise<string | undefined>}
   */
  @Input()
  refreshTokenAsync: (initiateLoginFlowOnRefreshFailure: boolean) => Promise<string | undefined> = async (
    initiateLoginFlowOnRefreshFailure: boolean = true
  ) => {
    try {
      const refreshToken: string | undefined = this.authorization_credentials?.refreshToken;
      if (!refreshToken) {
        if (initiateLoginFlowOnRefreshFailure && !this.hasLoginError && this.state === LoginState.LoggedOut) {
          console.warn('Unable to refresh, refreshToken is not defined. Will attempt to start the OAuth login flow');
          await this.startOAuthLoginFlowAsync();
        } else if (this.state === LoginState.LoggingIn) {
          console.log('Logging in. Will not attempt to refresh');
        } else {
          console.warn(
            'Unable to refresh, refreshToken is not defined, initiateLoginFlowOnRefreshFailure set to false'
          );
          this._state = LoginState.LoggedOut;
          this.logoutCompleted.emit({
            ErrorType: 'Refresh Token Error',
            ErrorMessage: 'refreshToken is not defined',
          });
          this.ref.detectChanges();
          this.loginService.removeFromLocalStorage();
        }
        return undefined;
      } else {
        try {
          const oauthRegion = this.account_endpoints?.regionalDomain;
          if (!oauthRegion) {
            throw new Error('Unable to refresh. Cannot construct tokenClient.');
          }

          const tokenClient = this.loginService.loginProvider?.getTokenClient(oauthRegion);
          const response = await tokenClient!.refreshAccessToken(refreshToken, this.client_id);
          const newAccessToken = await this.loginService.parseTokenResponseAsync(response);
          this.loginService.storeAccessToken(newAccessToken!);
          this._state = LoginState.LoggedIn;
          console.info('state changed to LoggedIn');
          this.loginCompleted.emit();
          return newAccessToken?.accessToken;
        } catch (e) {
          const status = (<ApiException>e).status ?? 0;
          if (status === 401 || status === 403) {
            if (initiateLoginFlowOnRefreshFailure && !this.hasLoginError && this.state === LoginState.LoggedOut) {
              console.warn('Unable to refresh. Will attempt to start the OAuth login flow');
              await this.startOAuthLoginFlowAsync();
            } else {
              console.warn(
                `Unable to refresh, initiateLoginFlowOnRefreshFailure set to ${initiateLoginFlowOnRefreshFailure}, state is ${this.state}`
              );
              this._state = LoginState.LoggedOut;
              this.ref.detectChanges();
              this.loginService.removeFromLocalStorage();
            }
          }
          throw e;
        }
      }
    } catch (err: any) {
      this._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.loginService.removeFromLocalStorage();
      this.logoutCompleted.emit({
        ErrorType: 'Refresh Token Error',
        ErrorMessage: err.message,
      });
      console.error('Unable to refresh, logged out: ' + err.message);
      return undefined;
    }
  };

  private async loginFlowHandler(startLoginMethodAsync: () => Promise<void>): Promise<string | undefined> {
    try {
      const accessToken: string | undefined = this.authorization_credentials?.accessToken;
      if (this.state === LoginState.LoggedOut && !this.hasLoginError) {
        await startLoginMethodAsync();
        return undefined;
      } else {
        await this.initializeLoginAsync();
        return accessToken;
      }
    } catch (err: any) {
      this._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.loginService.removeFromLocalStorage();
      this.logoutCompleted.emit({
        ErrorType: 'Login Error',
        ErrorMessage: err.message,
      });
      console.error('Unable to login, logged out: ' + err.message);
      return undefined;
    }
  }

  private async startCloudLoginFlowAsync() {
    this.loginService.loginProvider = new CloudLoginProvider(this.loginService);
    await this.startOAuthLoginFlowAsync();
  }

  @Input()
  initLoginFlowAsync: () => Promise<string | undefined> = async () => {
    return await this.loginFlowHandler(() => this.startCloudLoginFlowAsync());
  };

  private async startSelfHostedLoginFlow(accountEndpoints: AccountEndpoints, repositoryId: string) {
    this.loginService.loginProvider = new SelfHostedLoginProvider(this.loginService, repositoryId);
    await this.startSelfHostedLoginFlowAsync(accountEndpoints);
  }

  @Input()
  initSelfHostedLoginFlowAsync: (
    accountEndpoints: AccountEndpoints,
    repositoryId: string
  ) => Promise<string | undefined> = async (accountEndpoints: AccountEndpoints, repositoryId: string) => {
    return await this.loginFlowHandler(() => this.startSelfHostedLoginFlow(accountEndpoints, repositoryId));
  };

  @Input() handleRedirectURICallbackAsync = async (url: string) => {
    try {
      const callbackURIParams = this.parseCallbackURI(url);
      if (callbackURIParams) {
        await this.loginService.exchangeCodeForTokenAsync(callbackURIParams);
      }
    } catch (err: any) {
      console.error('handleRedirectURICallbackAsync error, unable to exchange token: ', err.message);
      throw err;
    }
  };

  /** @internal */
  private logoutCompleteSub?: Subscription;
  /** @internal */
  private loginCompleteSub?: Subscription;
  /** @internal */
  private code_challenge?: string;
  /** @internal */
  private hasLoginError: boolean = false;
  /** @internal */
  private initialized: boolean = false;

  /** @internal */
  constructor() {
    window.addEventListener('storage', (ev) => {
      this.onStorageChanged(ev);
    });
  }

  async ngAfterViewInit() {
    const accessToken = this.authorization_credentials?.accessToken;
    if (accessToken) {
      this._state = LoginState.LoggedIn;
    } else {
      await this.initializeLoginAsync();
    }
  }

  /** @internal */
  async ngOnChanges(changes: SimpleChanges) {
    const currentLoginIdentifier = changes['login_identifier'];
    const currentLoginType = changes['login_type'];

    if (
      !this.loginService.loginProvider &&
      ((currentLoginType?.currentValue && currentLoginType?.isFirstChange()) ||
        currentLoginType?.previousValue !== currentLoginType?.currentValue)
    ) {
      this.loginService.loginProvider =
        currentLoginType.currentValue === LoginType.SelfHosted
          ? new SelfHostedLoginProvider(this.loginService, currentLoginIdentifier.currentValue)
          : new CloudLoginProvider(this.loginService);
    }

    // initialize the login state according to the access token
    if (
      (currentLoginIdentifier?.currentValue && currentLoginIdentifier?.isFirstChange()) ||
      currentLoginIdentifier?.previousValue !== currentLoginIdentifier?.currentValue
    ) {
      const accessToken = this.authorization_credentials?.accessToken;
      if (accessToken) {
        this._state = LoginState.LoggedIn;
      } else {
        await this.initializeLoginAsync();
      }
    }
  }

  private setButtonText() {
    if (this.state === LoginState.LoggedIn) {
      this.buttonText = this._sign_out_text;
    } else if (this.state === LoginState.LoggingIn) {
      this.buttonText = this._signing_in_text;
    } else if (this.state === LoginState.LoggingOut) {
      this.buttonText = this._signing_out_text;
    } else {
      this.buttonText = this._sign_in_text;
    }
  }

  private onStorageChanged(ev: StorageEvent) {
    const keyName = ev.key;
    const oldValue = ev.oldValue;
    const newValue = ev.newValue;
    if (keyName === this.loginService.accessTokenStorageKey) {
      this.onAccessTokenLocalStorageChange(oldValue, newValue);
    }
  }

  private onAccessTokenLocalStorageChange(oldValue: string | null, newValue: string | null) {
    if (oldValue && !newValue) {
      // newly logged out
      this.loginService.removeFromCache();
      this._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.logoutCompleted.emit();
    } else if (!oldValue && newValue) {
      // newly logged in
      this._state = LoginState.LoggingIn;
      this.ref.detectChanges();

      this.loginService.storeAccessToken(JSON.parse(newValue));
      this.loginService.refreshServiceAccountProperties();
      this._state = LoginState.LoggedIn;
      this.ref.detectChanges();
      this.loginCompleted.emit();
    } else if (newValue && oldValue && oldValue !== newValue) {
      // refreshed
      const newAccessToken: AuthorizationCredentials = JSON.parse(newValue);
      this.loginService.storeAccessToken(newAccessToken);
      this.loginService.refreshServiceAccountProperties();
      this._state = LoginState.LoggedIn;
      this.ref.detectChanges();
      this.loginCompleted.emit();
    } else {
      // accessToken didn't change
      // do nothing
    }
  }

  /** @internal */
  get isLoggedIn() {
    return this.loginService._state === LoginState.LoggedIn;
  }

  /** @internal */
  get isIntermediateState() {
    const loggingIn = this.loginService._state === LoginState.LoggingIn;
    const loggingOut = this.loginService._state === LoginState.LoggingOut;
    return loggingIn || loggingOut;
  }

  /** @internal */
  async ngOnInit() {
    this.logoutCompleteSub = this.loginService.logoutCompletedInService.subscribe((error) => {
      this.hasLoginError = true;
      this.setButtonText();
      this.logoutCompleted.emit(error);
    });
    this.loginCompleteSub = this.loginService.loginCompletedInService.subscribe(() => {
      this.setButtonText();
      this.loginCompleted.emit();
    });
  }

  /** @internal */
  ngOnDestroy() {
    this.loginCompleteSub?.unsubscribe();
    this.logoutCompleteSub?.unsubscribe();
  }

  /** @internal */
  private async initializeLoginAsync() {
    try {
      const callBackURIParams = this.parseCallbackURI(window.location.href);
      this._state =
        this.loginService.loginProvider?.determineCurrentState(
          callBackURIParams,
          this.loginCompleted,
          this.logoutCompleted
        ) ?? LoginState.LoggedOut;
      this.ref.detectChanges();
      if (this.loginService._state === LoginState.LoggingIn) {
        await this.loginService.exchangeCodeForTokenAsync(callBackURIParams!);
      }
    } catch (err: any) {
      this.logoutCompleted.emit({
        ErrorType: 'Login Error',
        ErrorMessage: err.message,
      });
      this.loginService.removeFromLocalStorage();
      this._state = LoginState.LoggedOut;
      console.warn('Login Error: ' + err.message);
      this.ref.detectChanges();
    }
  }

  /** @internal */
  parseCallbackURI(urlString: string): RedirectUriQueryParams | undefined {
    const url = new URL(urlString);
    const state = url.searchParams.get('state');
    if (state !== LOGIN_REDIRECT_STATE) {
      return undefined;
    }

    return this.loginService.loginProvider?.exchangeRedirectUriQueryParams(url);
  }

  /** @internal */
  createRefreshTokenRequest(): RequestInit {
    const refreshToken: string | undefined = this.loginService._accessToken?.refreshToken;
    if (refreshToken) {
      const request: RequestInit = { method: 'POST' };
      const headers = this.loginService.getPostRequestHeaders();
      const body = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.client_id,
      };
      const requestBody = this.loginService.objToWWWFormUrlEncodedBody(body);
      request.headers = headers;
      request.body = requestBody;
      return request;
    } else {
      throw new Error('RefreshToken is not defined');
    }
  }

  /** @internal */
  async onLoginButtonClickAsync() {
    if (this.state === LoginState.LoggedIn) {
      this.startLogout();
    } else if (this.state === LoginState.LoggedOut) {
      await this.startLoginAsync();
    } else {
      // Do not expect to get here as the button should be disabled.
      console.warn('Intermediate state. Should not attempt to login.');
    }
  }

  /** @internal */
  async startLoginAsync() {
    try {
      await this.startCloudLoginFlowAsync();
    } catch (err: any) {
      if (this.loginService._state !== LoginState.LoggedOut) {
        this._state = LoginState.LoggedOut;
        this.ref.detectChanges();
        this.loginService.removeFromLocalStorage();
        this.logoutCompleted.emit({
          ErrorType: 'Login Error',
          ErrorMessage: err.message,
        });
        console.error('Login Error: ' + err.message);
      }
    }
  }

  /** @internal */
  private async startOAuthLoginFlowAsync() {
    const code_verifier = PKCEUtils.generateCodeVerifier();
    this.loginService.storeCodeVerifier(code_verifier);

    this.code_challenge = await PKCEUtils.generateCodeChallengeAsync(code_verifier);

    const fullAuthorizeUrl = this.getAuthorizeUrl();
    this.loginInitiated.emit(fullAuthorizeUrl);
    this._state = LoginState.LoggingIn;
    this.ref.detectChanges();
    console.info('state changed to LoggingIn');
    this.handleRedirectBehavior(fullAuthorizeUrl, 'Log in button clicked.');
  }

  private async startSelfHostedLoginFlowAsync(accountEndpoints: AccountEndpoints) {
    this.loginService.self_hosted_account_endpoints = accountEndpoints;
    this.loginService.self_hosted_base_url = accountEndpoints.regionalDomain;
    this.loginService.storeAccountEndpoints(accountEndpoints);
    await this.startOAuthLoginFlowAsync();
  }

  /** @internal */
  getAuthorizeUrl(): string {
    const baseAuthorizeUrl = this.loginService.loginProvider?.getBaseAuthorizeUrl();

    const baseUrl: URL = new URL(baseAuthorizeUrl ?? '');
    if (this.client_id) {
      baseUrl.searchParams.set('client_id', this.client_id);
    }
    if (this.scope) {
      baseUrl.searchParams.set('scope', this.scope);
    }
    baseUrl.searchParams.set('redirect_uri', this.redirect_uri);
    baseUrl.searchParams.set('response_type', 'code');
    baseUrl.searchParams.set('response_mode', 'query');
    baseUrl.searchParams.set('state', LOGIN_REDIRECT_STATE);
    baseUrl.searchParams.set('code_challenge', this.code_challenge!);
    baseUrl.searchParams.set('code_challenge_method', CODE_CHALLENGE_METHOD);

    return baseUrl.toString();
  }

  /** @internal */
  startLogout() {
    try {
      this._state = LoginState.LoggingOut;
      this.ref.detectChanges();
      console.info('state changed to LoggingOut');

      const logoutUrl = this.getFullLogoutUrl();
      this.loginService.loginProvider?.logoutInitiatedViaUrl(logoutUrl, this.logoutInitiated);

      this.loginService.removeFromLocalStorage();
      this._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      console.info('state changed to LoggedOut');

      this.logoutCompleted.emit();
      if (logoutUrl) {
        this.handleRedirectBehavior(logoutUrl, 'Logout button clicked.');
      }
    } catch (err: any) {
      if (this.loginService._state !== LoginState.LoggedOut) {
        this.loginService.removeFromLocalStorage();
        this._state = LoginState.LoggedOut;
        this.ref.detectChanges();

        console.error('Logout error (state changed to LoggedOut): ' + err.message);
        this.logoutCompleted.emit({
          ErrorType: 'Logout Error',
          ErrorMessage: err.message,
        });
      }
    }
  }

  /** @internal */
  getFullLogoutUrl(): string | undefined {
    if (this.account_endpoints?.wsignoutUrl) {
      const acsToLfLogout = new URL(this.account_endpoints?.wsignoutUrl);
      // Warning: if we are already logged out this will behave strangely
      // won't redirect back to redirect Url
      acsToLfLogout.searchParams.set('wreply', this.redirect_uri);
      const stringUrl = acsToLfLogout.toString();
      return stringUrl;
    } else {
      console.warn('No account endpoint available. Did not redirect');
      return undefined;
    }
  }

  /** @internal */
  private handleRedirectBehavior(stringUrl: string, additionalContext?: string) {
    if (this.redirect_behavior === RedirectBehavior.Replace) {
      window.location.replace(stringUrl);
    } else if (this.redirect_behavior === RedirectBehavior.Popup) {
      throw new Error('Not implemented');
    } else {
      const concatStrings = this.concatStrings(
        additionalContext,
        'Redirect behavior none. Redirect must be implemented by container in event initiated handler'
      );
      console.log(concatStrings);
    }
  }

  /** @internal */
  concatStrings(firstString: string | undefined, secondString: string) {
    const firstStringExists = firstString && firstString.length > 0;
    if (firstStringExists) {
      const lastCharOfFirstString = firstString?.charAt(firstString.length - 1);
      const firstCharOfSecondString = secondString.charAt(0);
      if (lastCharOfFirstString !== ' ' && firstCharOfSecondString !== ' ') {
        return firstString + ' ' + secondString;
      } else if (lastCharOfFirstString === ' ' && firstCharOfSecondString === ' ') {
        return firstString + secondString.substring(1);
      }
      return firstString + secondString;
    } else {
      return secondString;
    }
  }

  /** @internal */
  private async beforeFetchRequestAsync(url: string, request: RequestInit): Promise<LfBeforeFetchResult> {
    // must get accessToken each time
    const accessToken = this.authorization_credentials?.accessToken;
    if (accessToken) {
      const headers = request.headers as Record<string, string>;
      headers['Authorization'] = 'Bearer ' + accessToken;
      const regionalDomain: string = this.account_endpoints?.regionalDomain ?? '';
      return { regionalDomain };
    } else {
      throw new Error('Access Token undefined.');
    }
  }

  /** @internal */
  private async afterFetchResponseAsync(url: string, response: Response, request: RequestInit): Promise<boolean> {
    if (response.status === 401) {
      // this will initialize the login flow if refresh is unsuccessful
      const accessToken = await this.refreshTokenAsync(true);
      const retry = accessToken !== undefined;
      return retry;
    }
    return false;
  }
}
