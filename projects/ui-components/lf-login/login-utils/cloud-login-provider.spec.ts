import { CloudLoginProvider } from './cloud-login-provider';
import { TokenClient } from '@laserfiche/lf-api-client-core';
import { LfLoginService } from './lf-login.service';
import { AccountEndpoints, AuthorizationCredentials } from './lf-login-types';
import { EventEmitter } from '@angular/core';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { AccountInfo } from './lf-login-internal-types';

describe('CloudLoginProvider', () => {
  let provider: CloudLoginProvider;
  let lfLoginServiceMock: Partial<LfLoginService>;

  beforeEach(() => {
    lfLoginServiceMock = {
      storeAccessToken: vi.fn(),
      parseAccessToken: vi.fn(),
      storeAccountInfo: vi.fn(),
      storeAccountEndpoints: vi.fn(),
      getAccountEndpoints: vi.fn(),
      extractCodeFromUrl: vi.fn(),
      extractDomainFromUrl: vi.fn(),
      extractCustomerIdFromUrl: vi.fn(),
      extractErrorFromUrl: vi.fn(),
      accessTokenStorageKey: 'mock-storage-key',
    };

    provider = new CloudLoginProvider(lfLoginServiceMock as LfLoginService);
  });

  describe('getTokenClient', () => {
    it('should return a TokenClient instance', () => {
      const tokenClientUrl = 'https://example.com/token';
      const tokenClient = provider.getTokenClient(tokenClientUrl);
      expect(tokenClient).toBeInstanceOf(TokenClient);
    });
  });

  describe('getBaseAuthorizeUrl', () => {
    it('should return the base authorize URL when last OAuth authorize URL exist and host name does not include dev and test environments', () => {
      lfLoginServiceMock.authorize_url_host_name = 'example.com';
      lfLoginServiceMock.getAccountEndpoints = vi.fn().mockReturnValue({
        oauthAuthorizeUrl: 'https://example.com/oauth/authorize',
      } as AccountEndpoints);

      const baseAuthorizeUrl = provider.getBaseAuthorizeUrl();
      expect(baseAuthorizeUrl).toBe('https://example.com/oauth/authorize');
    });

    it('should return the base authorize URL when last OAuth authorize URL does not exist', () => {
      lfLoginServiceMock.getAccountEndpoints = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.authorize_url_host_name = 'example.net';

      const baseAuthorizeUrl = provider.getBaseAuthorizeUrl();
      expect(baseAuthorizeUrl).toBe('https://signin.example.net/oauth/Authorize');
    });
  });

  describe('storeInLocalStorage', () => {
    it('should store access token credentials in local storage', () => {
      const accessTokenCredentials = {
        accessToken: 'test-access',
        expiresIn: '3600',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
      };

      provider.storeInLocalStorage(accessTokenCredentials, 'account-id', 'regional-domain');

      expect(lfLoginServiceMock.storeAccessToken).toHaveBeenCalledWith(accessTokenCredentials);
      expect(lfLoginServiceMock.storeAccountInfo).toHaveBeenCalled();
      expect(lfLoginServiceMock.storeAccountEndpoints).toHaveBeenCalled();
    });
  });

  describe('exchangeRedirectUriQueryParams', () => {
    it('should return RedirectUriQueryParams with authorization code and domain when available', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue('abc');
      lfLoginServiceMock.extractDomainFromUrl = vi.fn().mockReturnValue('example.com');
      lfLoginServiceMock.extractCustomerIdFromUrl = vi.fn().mockReturnValue('customer-123');
      const url = new URL('https://example.com/callback?code=abc&domain=example.com');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        authorizationCode: 'abc',
        cloudSubDomain: 'example.com',
        customerId: 'customer-123',
      });
    });

    it('should return RedirectUriQueryParams with error when available', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue('abc');
      lfLoginServiceMock.extractDomainFromUrl = vi.fn().mockReturnValue('example.com');
      lfLoginServiceMock.extractCustomerIdFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl = vi.fn().mockReturnValue({ name: 'xyz', description: 'unknown' });
      const url = new URL('https://example.com/callback?error=xyz');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        error: { name: 'xyz', description: 'unknown' },
      });
    });

    it('should return undefined when particular query parameters are missing', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractDomainFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractCustomerIdFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl = vi.fn().mockReturnValue(undefined);
      const url = new URL('https://example.com/callback?somthing=else');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toBeUndefined();
    });
  });

  describe('determineCurrentState', () => {
    const authorizationCredentialsMock: AuthorizationCredentials = {
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresIn: '3600',
      tokenType: 'bearer',
    };

    const accountEndpointsMock: AccountEndpoints = {
      webClientUrl: 'https://api.example.com',
      wsignoutUrl: 'https://api.example.com/signout',
      regionalDomain: 'example.com',
      oauthAuthorizeUrl: 'https://example.com/oauth/authorize',
    };

    const accountInfoMock: AccountInfo = {
      accountId: 'account-id',
      trusteeId: 'trustee-id',
    };

    it('should return LoginState.LoggedIn when access token and account information are stored in local storage', () => {
      // Reset mocks
      lfLoginServiceMock.storeAccessToken = vi.fn().mockClear();

      const loginCompleteEmitMock = { emit: vi.fn() } as unknown as EventEmitter<void>;
      const logoutCompleted = {} as unknown as EventEmitter<void>;

      localStorage.getItem = vi
        .fn()
        .mockReturnValueOnce('access-token-value')
        .mockReturnValueOnce('account-endpoints-value')
        .mockReturnValueOnce('account-id-value');

      JSON.parse = vi
        .fn()
        .mockReturnValueOnce(authorizationCredentialsMock)
        .mockReturnValueOnce(accountEndpointsMock)
        .mockReturnValueOnce(accountInfoMock);

      const currentState = provider.determineCurrentState(undefined, loginCompleteEmitMock, logoutCompleted);

      expect(currentState).toBe(LoginState.LoggedIn);
      expect(loginCompleteEmitMock.emit).toHaveBeenCalled();
    });

    it('should return LoginState.LoggingIn when authorization code is available in callback URI params', () => {
      const callBackURIParams = { authorizationCode: 'abc' };
      const loginCompleted = new EventEmitter();
      const logoutCompleted = new EventEmitter();

      const currentState = provider.determineCurrentState(callBackURIParams, loginCompleted, logoutCompleted);

      expect(currentState).toBe(LoginState.LoggingIn);
    });

    it('should return LoginState.LoggedOut when no access token or account endpoints are stored in local storage', () => {
      const loginCompleted = { emit: vi.fn() } as unknown as EventEmitter<void>;
      const logoutCompletedEmitMock = { emit: vi.fn() } as unknown as EventEmitter<void>;

      const currentState = provider.determineCurrentState(undefined, loginCompleted, logoutCompletedEmitMock);

      expect(currentState).toBe(LoginState.LoggedOut);
      expect(logoutCompletedEmitMock.emit).toHaveBeenCalled();
    });
  });

  describe('logoutInitiatedViaUrl', () => {
    it('should emit the provided URL when logout initiated via URL', () => {
      const emitSpy = vi.fn();
      const url = 'https://example.com/logout';

      provider.logoutInitiatedViaUrl(url, { emit: emitSpy });

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(url);
    });
  });
});
