import { CloudLoginProvider } from './cloud-login-provider';
import { TokenClient } from '@laserfiche/lf-api-client-core';
import { LfLoginService } from './lf-login.service';
import { AccountEndpoints, AuthorizationCredentials } from './lf-login-types';
import { TestBed } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { AccountInfo } from './lf-login-internal-types';

describe('CloudLoginProvider', () => {
  let provider: CloudLoginProvider;
  const lfLoginServiceMock: jasmine.SpyObj<LfLoginService> = jasmine.createSpyObj('LfLoginService', [
    'storeAccessToken',
    'parseAccessToken',
    'storeAccountInfo',
    'storeAccountEndpoints',
    'getAccountEndpoints',
    'extractCodeFromUrl',
    'extractDomainFromUrl',
    'extractCustomerIdFromUrl',
    'extractErrorFromUrl',
    'accessTokenStorageKey',
  ]);

  beforeEach(() => {
    provider = new CloudLoginProvider(lfLoginServiceMock);
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
      lfLoginServiceMock.getAccountEndpoints.and.returnValue({
        oauthAuthorizeUrl: 'https://example.com/oauth/authorize',
      } as AccountEndpoints);

      const baseAuthorizeUrl = provider.getBaseAuthorizeUrl();
      expect(baseAuthorizeUrl).toBe('https://example.com/oauth/authorize');
    });

    it('should return the base authorize URL when last OAuth authorize URL does not exist', () => {
      lfLoginServiceMock.getAccountEndpoints.and.returnValue(undefined);
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
      };

      provider.storeInLocalStorage(accessTokenCredentials, 'account-id', 'regional-domain');

      expect(lfLoginServiceMock.storeAccessToken).toHaveBeenCalledWith(accessTokenCredentials);
      expect(lfLoginServiceMock.storeAccountInfo).toHaveBeenCalled();
      expect(lfLoginServiceMock.storeAccountEndpoints).toHaveBeenCalled();
    });
  });

  describe('exchangeRedirectUriQueryParams', () => {
    it('should return RedirectUriQueryParams with authorization code and domain when available', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue('abc');
      lfLoginServiceMock.extractDomainFromUrl.and.returnValue('example.com');
      lfLoginServiceMock.extractCustomerIdFromUrl.and.returnValue('customer-123');
      const url = new URL('https://example.com/callback?code=abc&domain=example.com');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        authorizationCode: 'abc',
        cloudSubDomain: 'example.com',
        customerId: 'customer-123',
      });
    });

    it('should return RedirectUriQueryParams with error when available', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue('abc');
      lfLoginServiceMock.extractDomainFromUrl.and.returnValue('example.com');
      lfLoginServiceMock.extractCustomerIdFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl.and.returnValue({ name: 'xyz', description: 'unknown' });
      const url = new URL('https://example.com/callback?error=xyz');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        error: { name: 'xyz', description: 'unknown' },
      });
    });

    it('should return undefined when particular query parameters are missing', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractDomainFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractCustomerIdFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl.and.returnValue(undefined);
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
      const loginService = TestBed.inject(LfLoginService);
      spyOnProperty(loginService, 'accessTokenStorageKey', 'get').and.returnValue('access-token-key');

      const loginCompleteEmitMock = jasmine.createSpyObj('EventEmitter', ['emit']);
      const logoutCompleted = new EventEmitter();

      spyOn(localStorage, 'getItem').and.returnValues(
        'access-token-value',
        'account-endpoints-value',
        'account-id-value',
      );

      spyOn(JSON, 'parse')
        .withArgs('access-token-value')
        .and.returnValue(authorizationCredentialsMock)
        .withArgs('account-endpoints-value')
        .and.returnValue(accountEndpointsMock)
        .withArgs('account-id-value')
        .and.returnValue(accountInfoMock);

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
      const loginCompleted = new EventEmitter();
      const logoutCompletedEmitMock = jasmine.createSpyObj('EventEmitter', ['emit']);

      const currentState = provider.determineCurrentState(undefined, loginCompleted, logoutCompletedEmitMock);

      expect(currentState).toBe(LoginState.LoggedOut);
      expect(logoutCompletedEmitMock.emit).toHaveBeenCalled();
    });
  });

  describe('logoutInitiatedViaUrl', () => {
    it('should emit the provided URL when logout initiated via URL', () => {
      const emitSpy = jasmine.createSpy('emit');
      const url = 'https://example.com/logout';

      provider.logoutInitiatedViaUrl(url, { emit: emitSpy });

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith(url);
    });
  });
});
