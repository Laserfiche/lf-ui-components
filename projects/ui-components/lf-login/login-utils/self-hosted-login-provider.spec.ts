// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { SelfHostedTokenClient } from '@laserfiche/lf-api-client-core';
import { LfLoginService } from './lf-login.service';
import { AccountEndpoints, AuthorizationCredentials } from './lf-login-types';
import { TestBed } from '@angular/core/testing';
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
  const lfLoginServiceMock: jasmine.SpyObj<LfLoginService> = jasmine.createSpyObj(
    'LfLoginService',
    [
      'storeAccessToken',
      'storeAccountEndpoints',
      'storeAccountInfo',
      'extractCodeFromUrl',
      'extractErrorFromUrl',
      'accessTokenStorageKey',
    ],
    {
      self_hosted_base_url: 'https://example.com',
      self_hosted_account_endpoints: accountEndpointsMock,
    },
  );

  beforeEach(() => {
    provider = new SelfHostedLoginProvider(lfLoginServiceMock, 'repository-id');
  });

  describe('getTokenClient', () => {
    it('should return a TokenClient instance', () => {
      const tokenClient = provider.getTokenClient();
      expect(tokenClient).toBeInstanceOf(SelfHostedTokenClient);
    });
  });

  describe('getBaseAuthorizeUrl', () => {
    it('should return the base authorize URL when last OAuth authorize URL exist and host name does not include dev and test environments', () => {
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
      };

      provider.storeInLocalStorage(accessTokenCredentials, '', '');

      expect(lfLoginServiceMock.storeAccessToken).toHaveBeenCalledWith(accessTokenCredentials);
      expect(lfLoginServiceMock.storeAccountEndpoints).toHaveBeenCalledWith(accountEndpointsMock);
      expect(lfLoginServiceMock.storeAccountInfo).not.toHaveBeenCalled();
    });
  });

  describe('exchangeRedirectUriQueryParams', () => {
    it('should return RedirectUriQueryParams with authorization code', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue('abc');
      const url = new URL('https://example.com/callback?code=abc&domain=example.com');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        authorizationCode: 'abc',
      });
    });

    it('should return RedirectUriQueryParams with error when available', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl.and.returnValue({ name: 'xyz', description: 'unknown' });
      const url = new URL('https://example.com/callback?error=xyz');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toEqual({
        error: { name: 'xyz', description: 'unknown' },
      });
    });

    it('should return undefined when particular query parameters are missing', () => {
      lfLoginServiceMock.extractCodeFromUrl.and.returnValue(undefined);
      lfLoginServiceMock.extractErrorFromUrl.and.returnValue(undefined);
      const url = new URL('https://example.com/callback?somthing=else');

      const redirectUriQueryParams = provider.exchangeRedirectUriQueryParams(url);

      expect(redirectUriQueryParams).toBeUndefined();
    });
  });

  describe('determineCurrentState', () => {
    it('should return LoginState.LoggedIn when access token and account information are stored in local storage', () => {
      const loginService = TestBed.inject(LfLoginService);
      spyOnProperty(loginService, 'accessTokenStorageKey', 'get').and.returnValue('access-token-key');
      spyOnProperty(loginService, 'accountEndpointsStorageKey', 'get').and.returnValue('account-endpoints-value');

      const loginCompleteEmitMock = jasmine.createSpyObj('EventEmitter', ['emit']);
      const logoutCompleted = new EventEmitter();

      spyOn(localStorage, 'getItem').and.returnValues('access-token-value', 'account-endpoints-value');

      spyOn(JSON, 'parse')
        .withArgs('access-token-value')
        .and.returnValue(authorizationCredentialsMock)
        .withArgs('account-endpoints-value')
        .and.returnValue(accountEndpointsMock);

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

    it('should not emit when URL is undefined', () => {
      const emitSpy = jasmine.createSpy('emit');
      provider.logoutInitiatedViaUrl(undefined, { emit: emitSpy });

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
