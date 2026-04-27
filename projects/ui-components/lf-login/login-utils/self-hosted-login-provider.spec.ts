// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { SelfHostedTokenClient } from '@laserfiche/lf-api-client-core';
import { LfLoginService } from './lf-login.service';
import { AccountEndpoints, AuthorizationCredentials } from './lf-login-types';
import { EventEmitter } from '@angular/core';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { SelfHostedLoginProvider } from './self-hosted-login-provider';

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

describe('SelfHostedLoginProvider', () => {
  let provider: SelfHostedLoginProvider;
  let lfLoginServiceMock: Partial<LfLoginService>;

  beforeEach(() => {
    lfLoginServiceMock = {
      storeAccessToken: vi.fn(),
      storeAccountInfo: vi.fn(),
      storeAccountEndpoints: vi.fn(),
      extractCodeFromUrl: vi.fn(),
      extractErrorFromUrl: vi.fn(),
      accessTokenStorageKey: 'mock-storage-key',
      getAccountEndpoints: vi.fn(),
    };

    provider = new SelfHostedLoginProvider(lfLoginServiceMock as LfLoginService, 'mock-repository-id');
  });

  describe('getTokenClient', () => {
    it('should return a TokenClient instance', () => {
      const tokenClient = provider.getTokenClient();
      expect(tokenClient).toBeInstanceOf(SelfHostedTokenClient);
    });
  });

  describe('getBaseAuthorizeUrl', () => {
    it('should return the base authorize URL when last OAuth authorize URL exist and host name does not include dev and test environments', () => {
      lfLoginServiceMock.self_hosted_account_endpoints = accountEndpointsMock;
      const baseAuthorizeUrl = provider.getBaseAuthorizeUrl();
      expect(baseAuthorizeUrl).toBe(accountEndpointsMock.oauthAuthorizeUrl);
    });
  });

  describe('storeInLocalStorage', () => {
    it('should store access token credentials and account endpoints in local storage', () => {
      const accessTokenCredentials = {
        accessToken: 'test-access',
        expiresIn: '3600',
        tokenType: 'bearer',
        refreshToken: 'refresh-token',
      };

      provider.storeInLocalStorage(accessTokenCredentials, '', '');

      expect(lfLoginServiceMock.storeAccessToken).toHaveBeenCalledWith(accessTokenCredentials);
      expect(lfLoginServiceMock.storeAccountInfo).not.toHaveBeenCalled();
    });
  });

  describe('exchangeRedirectUriQueryParams', () => {
    it('should return RedirectUriQueryParams with authorization code', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue('abc');
      const url = new URL('https://example.com/callback?code=abc&domain=example.com');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        authorizationCode: 'abc',
      });
    });

    it('should return RedirectUriQueryParams with error when available', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl = vi.fn().mockReturnValue({ name: 'xyz', description: 'unknown' });
      const url = new URL('https://example.com/callback?error=xyz');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        error: { name: 'xyz', description: 'unknown' },
      });
    });

    it('should return undefined when particular query parameters are missing', () => {
      lfLoginServiceMock.extractCodeFromUrl = vi.fn().mockReturnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl = vi.fn().mockReturnValue(undefined);
      const url = new URL('https://example.com/callback?somthing=else');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toBeUndefined();
    });
  });

  describe('determineCurrentState', () => {
    it('should return LoginState.LoggedIn when access token and account information are stored in local storage', () => {
      // Reset mocks
      lfLoginServiceMock.storeAccessToken = vi.fn().mockClear();

      const loginCompleteEmitMock = { emit: vi.fn() } as unknown as EventEmitter<void>;
      const logoutCompleted = {} as unknown as EventEmitter<void>;

      localStorage.getItem = vi
        .fn()
        .mockReturnValueOnce('access-token-value')
        .mockReturnValueOnce('account-endpoints-value');

      JSON.parse = vi.fn().mockReturnValueOnce(authorizationCredentialsMock).mockReturnValueOnce(accountEndpointsMock);

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

    it('should not emit when URL is undefined', () => {
      const emitSpy = vi.fn();
      provider.logoutInitiatedViaUrl(undefined, { emit: emitSpy });

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
