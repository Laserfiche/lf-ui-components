// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { LfLoginService } from './lf-login.service';
import { CloudLoginProvider } from './cloud-login-provider';

function createJwt(payload: Record<string, unknown>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encode = (obj: Record<string, unknown>) => btoa(JSON.stringify(obj));
  return `${encode(header)}.${encode(payload)}.signature`;
}

describe('LfLoginService', () => {
  let service: LfLoginService;

  beforeEach(async () => {
    // Clear local storage before each test to avoid test interference
    localStorage.clear();

    await TestBed.configureTestingModule({
      providers: [LfLoginService],
    }).compileComponents();

    service = TestBed.inject(LfLoginService);
  });

  afterEach(() => {
    // Cleanup local storage and test doubles after each test
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exchangeCodeForTokenAsync should throw error if empty params', async () => {
    service.loginProvider = new CloudLoginProvider(service);
    await expect(service.exchangeCodeForTokenAsync({})).rejects.toThrow();
  });

  it('exchangeCodeForTokenAsync should logout if error', async () => {
    const mockEmit = vi.spyOn(service.logoutCompletedInService, 'emit');

    await service.exchangeCodeForTokenAsync({
      error: {
        description: 'Test error description',
        name: 'Test error name',
      },
    });

    expect(mockEmit).toHaveBeenCalled();
    expect(service._state).toEqual(LoginState.LoggedOut);
    expect(localStorage.getItem(service.accessTokenStorageKey)).toBeFalsy();
  });

  it('exchangeCodeForTokenAsync should emit logoutCompletedInService if empty code verifier in local storage', async () => {
    localStorage.removeItem(service.codeVerifierStorageKey);
    const mockEmit = vi.spyOn(service.logoutCompletedInService, 'emit');

    await service.exchangeCodeForTokenAsync({ authorizationCode: 'test authorization code' });

    expect(mockEmit).toHaveBeenCalledWith({
      ErrorType: 'no code verifier',
      ErrorMessage: 'code verifier not found',
    });
  });

  it('removeFromLocalStorage should have empty local storage after being called', () => {
    localStorage.setItem(service.accessTokenStorageKey, 'test token');
    service.removeFromLocalStorage();
    expect(localStorage.getItem(service.accessTokenStorageKey)).toBeFalsy();
  });

  it('removeFromLocalStorage should not throw error if local storage is already empty', () => {
    expect(() => service.removeFromLocalStorage()).not.toThrow();
    expect(localStorage.getItem(service.accessTokenStorageKey)).toBeFalsy();
  });

  it('createPostTokenRequest should encode body in wwwUrlFormEncoded format', () => {
    service.redirect_uri = 'test-url';
    service.client_id = 'test-id';
    service.code_verifier = 'test-code-verifier';

    const request = service.createPostTokenRequest('testcode-string-hi');
    const bodyEncoded = service.objToWWWFormUrlEncodedBody({
      grant_type: 'authorization_code',
      code: 'testcode-string-hi',
      redirect_uri: service.redirect_uri,
      client_id: service.client_id,
      code_verifier: 'test-code-verifier',
    });

    expect(request.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    expect(request.method).toEqual('POST');
    expect(request.body).toEqual(bodyEncoded);
  });

  it('getExchangeCodeSuccessResponse should get access token response', () => {
    const accessTokenCredentials = service.getExchangeCodeSuccessResponse({
      access_token: 'test-access',
      expires_in: '3600',
      token_type: 'bearer',
      refresh_token: 'test-refresh',
    });
    expect(accessTokenCredentials).toEqual({
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresIn: '3600',
      tokenType: 'bearer',
    });
  });

  it('getExchangeCodeSuccessResponse should throw when not all properties exist', () => {
    expect(() =>
      service.getExchangeCodeSuccessResponse({
        token_type: 'bearer',
        refresh_token: 'test-refresh',
      })
    ).toThrow();
  });

  it('getPostRequestHeaders should get headers', () => {
    const requestHeaders = service.getPostRequestHeaders();
    expect(requestHeaders).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
  });

  it('objToWWWFormUrlEncodedBody should format correctly', () => {
    const urlEncoded = service.objToWWWFormUrlEncodedBody({ test: 'hi', hello: 'bye', free: 't3st!ng&fun here' });
    expect(urlEncoded).toEqual('test=hi&hello=bye&free=t3st%21ng%26fun+here');
  });

  it('parseAccessToken should parse data from jwt', () => {
    const accessToken = createJwt({ csid: '123456789', trid: '1' });
    const parsedToken = service.parseAccessToken(accessToken);

    expect(parsedToken).toEqual('1');
  });

  it('parseAccessToken should parse data from jwt with different environment/region', () => {
    service.authorize_url_host_name = 'a.clouddev.laserfiche.com';
    const accessToken = createJwt({ csid: '1123456789', trid: '1' });
    const parsedToken = service.parseAccessToken(accessToken);

    expect(parsedToken).toEqual('1');
  });

  it('extractErrorFromUrl with error', () => {
    const testUrl = new URL('https://test-url.com?error=test-name&description=test-description');
    const error = service.extractErrorFromUrl(testUrl);
    expect(error).toEqual({ name: 'test-name', description: 'test-description' });
  });

  it('extractErrorFromUrl with error, no description', () => {
    const testUrl = new URL('https://test-url.com?error=test-name');
    const error = service.extractErrorFromUrl(testUrl);
    expect(error).toEqual({ name: 'test-name', description: 'unknown' });
  });

  it('extractErrorFromUrl no error, no description', () => {
    const testUrl = new URL('https://test-url.com');
    const error = service.extractErrorFromUrl(testUrl);
    expect(error).toBeUndefined();
  });

  it('extractCodeFromUrl gets code from url', () => {
    const testUrl = new URL('https://test-url.com?code=test-code');
    const codeFromUrl = service.extractCodeFromUrl(testUrl);
    expect(codeFromUrl).toEqual('test-code');

    const testUrlNoCode = new URL('https://test-url.com');
    const noCodeFromUrl = service.extractCodeFromUrl(testUrlNoCode);
    expect(noCodeFromUrl).toBeUndefined();
  });
});
