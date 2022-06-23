import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountInfo } from './login-utils/lf-login-internal-types';
import { AbortedLoginError, AccountEndpoints, AuthorizationCredentials } from './login-utils/lf-login-types';
import { LoginMode, LoginState, RedirectBehavior } from '@laserfiche/lf-ui-components/shared';
import { LfLoginService } from './login-utils/lf-login.service';
import { HTTPError, PKCEUtils, TokenClient } from '@laserfiche/lf-api-client-core';

const LOGIN_REDIRECT_STATE = 'lf-login-redirect';
const CODE_CHALLENGE_METHOD = 'S256';
@Component({
  selector: 'lf-login-component',
  templateUrl: './lf-login.component.html',
  styleUrls: ['./lf-login.component.css']
})
export class LfLoginComponent implements OnChanges, OnDestroy {

  @Input() mode: LoginMode = LoginMode.Button;

  /** @internal */
  get isMenuMode(): boolean {
    return this.mode === LoginMode.Menu;
  };
  // TODO localize
  @Input() sign_in_text: string = 'Sign in';
  @Input() sign_out_text: string = 'Sign out';
  @Input() signing_in_text: string = 'Signing in...';
  @Input() signing_out_text: string = 'Signing out...';

  @Input() set client_id(val: string) {
    this.loginService.client_id = val;
  };
  get client_id(): string {
    return this.loginService.client_id;
  }

  @Input() set redirect_uri(val: string) {
    this.loginService.redirect_uri = val;
  };
  get redirect_uri(): string {
    return this.loginService.redirect_uri;
  }

  @Input() set scope(val: string) {
    this.loginService.scope = val;
  };
  get scope(): string {
    return this.loginService.scope;
  }

  @Input() set redirect_behavior(val: RedirectBehavior) {
    this.loginService.redirect_behavior = val;
  };
  get redirect_behavior(): RedirectBehavior {
    return this.loginService.redirect_behavior;
  }

  @Input() set authorize_url_host_name(val: string) {
    this.loginService.authorize_url_host_name = val;
    this.loginService.tokenClient = new TokenClient(this.loginService.authorize_url_host_name);
  };
  get authorize_url_host_name(): string {
    return this.loginService.authorize_url_host_name;
  }

  @Input()
  get authorization_credentials(): AuthorizationCredentials | undefined {
    try {
      if (this.loginService._accessToken) {
        return this.loginService._accessToken;
      }
      else {
        const accessTokenFromStorage = localStorage.getItem(this.loginService.accessTokenStorageKey);
        if (accessTokenFromStorage) {
          const accessTokenCredentials: AuthorizationCredentials = JSON.parse(accessTokenFromStorage);
          return accessTokenCredentials;
        }
        else {
          return undefined;
        }
      }
    }
    catch (err: any) {
      console.warn('Unable to retrieve accessToken: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get account_endpoints(): AccountEndpoints | undefined {
    try {
      if (this.loginService._accountEndpoints) {
        return this.loginService._accountEndpoints;
      }
      else {
        const accountEndpointsFromStorage = localStorage.getItem(this.loginService.accountEndpointsStorageKey);
        if (accountEndpointsFromStorage) {
          const accountEndpoints: AccountEndpoints = JSON.parse(accountEndpointsFromStorage);
          return accountEndpoints;
        }
        else {
          return undefined;
        }
      }
    }
    catch (err: any) {
      console.warn('Unable to retrieve accountEndpoints: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get account_id(): string | undefined {
    try {
      if (this.loginService._accountInfo) {
        return this.loginService._accountInfo.accountId;
      }
      else {
        const accountInfoFromStorage = localStorage.getItem(this.loginService.accountIdStorageKey);
        if (accountInfoFromStorage) {
          const accountInfo: AccountInfo = JSON.parse(accountInfoFromStorage);
          return accountInfo.accountId;
        }
        else {
          return undefined;
        }
      }
    }
    catch (err: any) {
      console.warn('Unable to retrieve accountId: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get trustee_id(): string | undefined {
    try {
      if (this.loginService._accountInfo) {
        return this.loginService._accountInfo.trusteeId;
      }
      else {
        const accountInfoFromStorage = localStorage.getItem(this.loginService.accountIdStorageKey);
        if (accountInfoFromStorage) {
          const accountInfo: AccountInfo = JSON.parse(accountInfoFromStorage);
          return accountInfo.trusteeId;
        }
        else {
          return undefined;
        }
      }
    }
    catch (err: any) {
      console.warn('Unable to retrieve trusteeId: ' + err.message);
      return undefined;
    }
  }

  @Input()
  get state(): LoginState {
    return this.loginService._state ?? LoginState.LoggedOut;
  }

  @Output() loginInitiated = new EventEmitter<string>();
  @Output() logoutInitiated = new EventEmitter<string>();

  @Output() loginCompleted = new EventEmitter<void>();
  @Output() logoutCompleted = new EventEmitter<AbortedLoginError | void>();

  @Input()
  refreshTokenAsync: (initiateLoginFlowOnRefreshFailure: boolean) => Promise<string | undefined> = async (initiateLoginFlowOnRefreshFailure: boolean = true) => {
    try {
      const refreshToken: string | undefined = this.authorization_credentials?.refreshToken;
      if (!refreshToken) {
        if (initiateLoginFlowOnRefreshFailure && !this.hasLoginError && (this.state === LoginState.LoggedOut)) {
          console.warn('Unable to refresh, refreshToken is not defined. Will attempt to start the OAuth login flow');
          await this.startOAuthLoginFlowAsync();
        }
        else if (this.state === LoginState.LoggingIn) {
          console.log('Logging in. Will not attempt to refresh');
        }
        else {
          console.warn('Unable to refresh, refreshToken is not defined, initiateLoginFlowOnRefreshFailure set to false');
          this.loginService._state = LoginState.LoggedOut;
          this.ref.detectChanges();
          this.loginService.removeFromLocalStorage();
        }
        return undefined;
      }
      else {
        try {
          const response = await this.loginService.tokenClient.refreshAccessToken(refreshToken, this.client_id);
          const newAccessToken = await this.loginService.parseTokenResponseAsync(response);
          return newAccessToken;
        }
        catch (e) {
          const status = (<HTTPError>e).status ?? 0;
          if (status === 401 || status === 403) {
            if (initiateLoginFlowOnRefreshFailure && !this.hasLoginError && (this.state === LoginState.LoggedOut)) {
              console.warn('Unable to refresh. Will attempt to start the OAuth login flow');
              await this.startOAuthLoginFlowAsync();
            }
            else {
              console.warn(`Unable to refresh, initiateLoginFlowOnRefreshFailure set to ${initiateLoginFlowOnRefreshFailure}, state is ${this.state}`);
              this.loginService._state = LoginState.LoggedOut;
              this.ref.detectChanges();
              this.loginService.removeFromLocalStorage();
            }
          }
          throw e;
        }
      }
    }
    catch (err: any) {
      this.loginService._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.loginService.removeFromLocalStorage();
      this.logoutCompleted.emit({
        ErrorType: 'Refresh Token Error',
        ErrorMessage: err.message
      });
      console.error('Unable to refresh, logged out: ' + err.message);
      return undefined;
    }

  };

  @Input()
  initLoginFlowAsync: () => Promise<string | undefined> = async () => {
    try {
      const accessToken: string | undefined = this.authorization_credentials?.accessToken;
      if (this.state === LoginState.LoggedOut && !this.hasLoginError) {
        await this.startOAuthLoginFlowAsync();
        return undefined;
      }
      else {
        return accessToken;
      }
    }
    catch (err: any) {
      this.loginService._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.loginService.removeFromLocalStorage();
      this.logoutCompleted.emit({
        ErrorType: 'Login Error',
        ErrorMessage: err.message
      });
      console.error('Unable to login, logged out: ' + err.message);
      return undefined;
    }
  };

  @Input() handleRedirectURICallbackAsync = async (url: string) => {
    try {
      const callbackURIParams = this.parseCallbackURI(url);
      if (callbackURIParams) {
        await this.loginService.exchangeCodeForTokenAsync(callbackURIParams);
      }
    }
    catch (err: any) {
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
  constructor(
    /** @internal */
    private ref: ChangeDetectorRef,
    /** @internal */
    private loginService: LfLoginService
  ) {
    window.addEventListener('storage', (ev) => {
      this.onStorageChanged(ev);
    });
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
      this.loginService._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      this.logoutCompleted.emit();
    }
    else if (!oldValue && newValue) {
      // newly logged in
      this.loginService._state = LoginState.LoggingIn;
      this.ref.detectChanges();

      this.loginService.storeInLocalStorage(JSON.parse(newValue));

      this.loginService._state = LoginState.LoggedIn;
      this.ref.detectChanges();
      this.loginCompleted.emit();
    }
    else if (newValue && oldValue && oldValue !== newValue) {
      // refreshed
      const newAccessToken: AuthorizationCredentials = JSON.parse(newValue);
      this.loginService.storeInLocalStorage(newAccessToken);

      this.loginService._state = LoginState.LoggedIn;
      this.ref.detectChanges();
      this.loginCompleted.emit();
    }
    else {
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
  async ngOnChanges(changes: SimpleChanges) {
    const currentClientId = changes['client_id'];
    if (currentClientId?.currentValue && currentClientId?.isFirstChange()) {
      this.logoutCompleteSub = this.loginService.logoutCompletedInService.subscribe((error) => {
        this.hasLoginError = true;
        this.logoutCompleted.emit(error);
      });
      this.loginCompleteSub = this.loginService.loginCompletedInService.subscribe(() => {
        this.loginCompleted.emit();
      });
      await this.initializeLoginAsync();
    }
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
      this.loginService._state = this.determineCurrentState(callBackURIParams);
      if (this.loginService._state === LoginState.LoggingIn) {
        await this.loginService.exchangeCodeForTokenAsync(callBackURIParams!);
      }
    }
    catch (err: any) {
      this.logoutCompleted.emit({
        ErrorType: 'Login Error',
        ErrorMessage: err.message
      });
      this.loginService.removeFromLocalStorage();
      this.loginService._state = LoginState.LoggedOut;
      console.warn('Login Error: ' + err.message);
      this.ref.detectChanges();
    }
  }

  /** @internal */
  parseCallbackURI(urlString: string): { error?: { name: string; description: string }; authorizationCode?: string } | undefined {
    const url = new URL(urlString);

    const state = url.searchParams.get('state');
    if (state === LOGIN_REDIRECT_STATE) {
      const authorizationCode = this.extractCodeFromUrl(url);
      const error = this.extractErrorFromUrl(url);
      if (authorizationCode) {
        return { authorizationCode };
      }
      else if (error) {
        return { error };
      }
      else {
        throw new Error('Unable to parse callback');
      }
    }
    else {
      return undefined;
    }
  }

  /** @internal */
  extractErrorFromUrl(url: URL): { name: string; description: string } | undefined {
    const error = url.searchParams.get('error');
    if (error) {
      const description = url.searchParams.get('description') ?? 'unknown';
      return { name: error, description };
    }
    else {
      return undefined;
    }
  }

  /** @internal */
  determineCurrentState(callBackURIParams: { error?: { name: string; description: string } | undefined; authorizationCode?: string | undefined } | undefined): LoginState {
    const storedAccessToken = localStorage.getItem(this.loginService.accessTokenStorageKey!);
    const storedAccountEndpoints = localStorage.getItem(this.loginService.accountEndpointsStorageKey);
    const storedAccountId = localStorage.getItem(this.loginService.accountIdStorageKey);
    if (storedAccessToken && storedAccountEndpoints && storedAccountId) {
      this.loginService._accessToken = JSON.parse(storedAccessToken);
      this.loginService._accountEndpoints = JSON.parse(storedAccountEndpoints);
      const accountInfo = JSON.parse(storedAccountId);
      this.loginService._accountInfo = accountInfo;
      return LoginState.LoggedIn;
    }
    else if (callBackURIParams?.authorizationCode || callBackURIParams?.error) {
      return LoginState.LoggingIn;
    } else {
      return LoginState.LoggedOut;
    }
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
        client_id: this.client_id
      };
      const requestBody = this.loginService.objToWWWFormUrlEncodedBody(body);
      request.headers = headers;
      request.body = requestBody;
      return request;
    }
    else {
      throw new Error('RefreshToken is not defined');
    }
  }

  /** @internal */
  extractCodeFromUrl(url: URL): string | undefined {
    return url.searchParams.get('code') ?? undefined;
  }

  /** @internal */
  get buttonText(): string {
    if (this.state === LoginState.LoggedIn) {
      return this.sign_out_text;
    }
    else if (this.state === LoginState.LoggingIn) {
      return this.signing_in_text;
    }
    else if (this.state === LoginState.LoggingOut) {
      return this.signing_out_text;
    }
    else {
      return this.sign_in_text;
    }
  }

  /** @internal */
  async onLoginButtonClickAsync() {
    if (this.state === LoginState.LoggedIn) {
      this.startLogout();
    }
    else if (this.state === LoginState.LoggedOut) {
      await this.startLoginAsync();
    }
    else {
      // Do not expect to get here as the button should be disabled.
      console.warn('Intermediate state. Should not attempt to login.');
    }
  }

  /** @internal */
  async startLoginAsync() {
    try {
      await this.startOAuthLoginFlowAsync();
    }
    catch (err: any) {
      if (this.loginService._state !== LoginState.LoggedOut) {
        this.loginService._state = LoginState.LoggedOut;
        this.ref.detectChanges();
        this.loginService.removeFromLocalStorage();
        this.logoutCompleted.emit(
          {
            ErrorType: 'Login Error',
            ErrorMessage: err.message
          }
        );
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
    this.loginService._state = LoginState.LoggingIn;
    this.ref.detectChanges();
    console.info('state changed to LoggingIn');
    this.handleRedirectBehavior(fullAuthorizeUrl, 'Log in button clicked.');
  }

  /** @internal */
  getAuthorizeUrl(): string {
    const baseUrl = new URL(`https://signin.${this.authorize_url_host_name}/oauth/Authorize`);
    baseUrl.searchParams.set('client_id', this.client_id);
    baseUrl.searchParams.set('redirect_uri', this.redirect_uri);
    baseUrl.searchParams.set('scope', this.scope);
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
      this.loginService._state = LoginState.LoggingOut;
      this.ref.detectChanges();
      console.info('state changed to LoggingOut');

      const logoutUrl = this.getFullLogoutUrl();
      this.logoutInitiated.emit(logoutUrl);

      this.loginService.removeFromLocalStorage();
      this.loginService._state = LoginState.LoggedOut;
      this.ref.detectChanges();
      console.info('state changed to LoggedOut');

      this.logoutCompleted.emit();
      if (logoutUrl) {
        this.handleRedirectBehavior(logoutUrl, 'Logout button clicked.');
      }
    }
    catch (err: any) {
      if (this.loginService._state !== LoginState.LoggedOut) {
        this.loginService.removeFromLocalStorage();
        this.loginService._state = LoginState.LoggedOut;
        this.ref.detectChanges();

        console.error('Logout error (state changed to LoggedOut): ' + err.message);
        this.logoutCompleted.emit(
          {
            ErrorType: 'Logout Error',
            ErrorMessage: err.message
          }
        );
      }
    }
  }

  /** @internal */
  getFullLogoutUrl(): string | undefined {
    if (this.loginService._accountEndpoints?.wsignoutUrl) {
      const acsToLfLogout = new URL(this.loginService._accountEndpoints?.wsignoutUrl);
      // Warning: if we are already logged out this will behave strangely
      // won't redirect back to redirect Url
      acsToLfLogout.searchParams.set('wreply', this.redirect_uri);
      const stringUrl = acsToLfLogout.toString();
      return stringUrl;
    }
    else {
      console.warn('No account endpoint available. Did not redirect');
      return undefined;
    }
  }

  /** @internal */
  private handleRedirectBehavior(stringUrl: string, additionalContext?: string) {
    if (this.redirect_behavior === RedirectBehavior.Replace) {
      window.location.replace(stringUrl);
    }
    else if (this.redirect_behavior === RedirectBehavior.Popup) {
      throw new Error('Not implemented');
    }
    else {
      const concatStrings = this.concatStrings(additionalContext, 'Redirect behavior none. Redirect must be implemented by container in event initiated handler');
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
      }
      else if (lastCharOfFirstString === ' ' && firstCharOfSecondString === ' ') {
        return firstString + secondString.substring(1);
      }
      return firstString + secondString;
    }
    else {
      return secondString;
    }
  }


}
