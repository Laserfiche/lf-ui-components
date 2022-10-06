import { TestBed } from '@angular/core/testing';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { LfLoginService } from './lf-login.service';

fdescribe('LfLoginService', () => {
  let service: LfLoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfLoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('exchangeCodeForTokenAsync should logout if error', () => {
    service.exchangeCodeForTokenAsync({ error: { description: 'Test error description', name: 'Test error name' } });
    expect(service._state).toEqual(LoginState.LoggedOut);
    expect(localStorage.getItem(service.accessTokenStorageKey)).toBeFalsy();
  });

  it('exchangeCodeForTokenAsync should throw error if empty params', async () => {
    await expectAsync(service.exchangeCodeForTokenAsync({})).toBeRejectedWithError();
  });

  it('exchangeCodeForTokenAsync should emit logoutCompletedInService if empty code verifier in local storage', async () => {
    localStorage.removeItem(service.codeVerifierStorageKey);
    spyOn(service.logoutCompletedInService, 'emit');
    await service.exchangeCodeForTokenAsync({authorizationCode: 'test authorization code' });
    expect(service.logoutCompletedInService.emit).toHaveBeenCalledWith({
      ErrorType: 'no code verifier',
      ErrorMessage: 'code verifier not found'
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
      code_verifier: 'test-code-verifier'
    });

    expect(request.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    expect(request.method).toEqual('POST');
    expect(request.body).toEqual(bodyEncoded);
  });

  it('getExchangeCodeSuccessResponse should get access token response', () => {
    const accessTokenCredentials = service.getExchangeCodeSuccessResponse({
      "access_token": "test-access",
      "expires_in": '3600',
      "token_type": "bearer",
      "refresh_token": "test-refresh"
    });
    expect(accessTokenCredentials).toEqual({ accessToken: 'test-access', refreshToken: 'test-refresh', expiresIn: '3600', tokenType: 'bearer' });
  });

  it('getExchangeCodeSuccessResponse should throw when not all properties exist', () => {
    expect(() => service.getExchangeCodeSuccessResponse({
      "token_type": "bearer",
      "refresh_token": "test-refresh"
    })).toThrow();
  });

  it('getPostRequestHeaders should get headers', () => {
    const requestHeaders = service.getPostRequestHeaders();
    expect(requestHeaders).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
  });

  it('storeInLocalStorage should have correct data in local storage', () => {
    const testHeader = btoa('{"test": "test"}');
    const encodedJWT = btoa('{"csid": "123456789", "trid": "1"}');
    const credentials = {
      accessToken: `${testHeader}.${encodedJWT}.hello`,
      refreshToken: 'test-refresh',
      expiresIn: '100',
      tokenType: 'bearer'
    };
    service.storeInLocalStorage(credentials, '123456789', 'laserfiche.com');
    expect(localStorage.getItem(service.accessTokenStorageKey)).toEqual(JSON.stringify(credentials));
    expect(localStorage.getItem(service.accountEndpointsStorageKey)).toEqual('{"webClientUrl":"https://app.laserfiche.com/laserfiche","repositoryApiBaseUrl":"https://api.laserfiche.com/repository/","wsignoutUrl":"https://accounts.laserfiche.com/WebSTS/?wa=wsignout1.0","regionalDomain":"laserfiche.com","oauthAuthorizeUrl":"https://signin.laserfiche.com/oauth/Authorize","oauthTokenUrl":"https://signin.laserfiche.com/oauth/Token"}');
    expect(localStorage.getItem(service.accountIdStorageKey)).toEqual('{"accountId":"123456789","trusteeId":"1"}');
  });

  it('objToWWWFormUrlEncodedBody should format correctly', () => {
    const urlEncoded = service.objToWWWFormUrlEncodedBody({ test: 'hi', hello: 'bye', free: 't3st!ng&fun here' });
    expect(urlEncoded).toEqual('test=hi&hello=bye&free=t3st%21ng%26fun+here');
  });

  it('parseAccessToken should parse data from jwt', () => {
    const testHeader = btoa('{"test": "test"}');
    const JWT = {csid: '123456789', trid: '1'};
    const encodedJWT = btoa(JSON.stringify(JWT));
    const parsedToken = service.parseAccessToken(`${testHeader}.${encodedJWT}.hello`);
    expect(parsedToken).toEqual('1');
  });

  it('parseAccessToken should parse data from jwt with different environment/region', () => {
    service.authorize_url_host_name = 'a.clouddev.laserfiche.com';
    const testHeader = btoa('{"test": "test"}');
    const JWT = {csid: '1123456789', trid: '1'};
    const encodedJWT = btoa(JSON.stringify(JWT));
    const parsedToken = service.parseAccessToken(`${testHeader}.${encodedJWT}.hello`);
    expect(parsedToken).toEqual('1');
  });
});
