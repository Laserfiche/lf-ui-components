// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { LfLoginComponent } from './lf-login.component';
import { LoginState } from '@laserfiche/lf-ui-components/shared';

describe('LfLoginComponent', () => {
  let component: LfLoginComponent;
  let fixture: ComponentFixture<LfLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LfLoginComponent ],
      imports: [
        MatMenuModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // @ts-ignore
    component.loginService.removeFromLocalStorage();
    // @ts-ignore
    component.loginService._state = LoginState.LoggedOut;
    // @ts-ignore
    component.loginService.authorize_url_host_name = 'laserfiche.com';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('parseCallbackURI with no state', () => {
    const uriParams = component.parseCallbackURI('https://testurl.com');
    expect(uriParams).toBeUndefined();
  });

  it('parseCallbackURI with code, domain, and customerId', () => {
    const uriParams = component.parseCallbackURI('https://testurl.com/hi?code=auth-code&state=lf-login-redirect&domain=laserfiche.com&customerId=123456789');
    expect(uriParams).toEqual(
      {
        authorizationCode: 'auth-code',
        cloudSubDomain: 'laserfiche.com',
        customerId: '123456789'
      });
  });

  it('parseCallbackURI with error', () => {
    const uriParams = component.parseCallbackURI('https://testurl.com/hi?state=lf-login-redirect&error=test-name&description=test-description');
    expect(uriParams).toEqual({ error: { name: 'test-name', description: 'test-description' } });
  });

  it('parseCallbackURI with state but no code or error', () => {
    expect(() => component.parseCallbackURI('https://testurl.com/hi?state=lf-login-redirect')).toThrow();
  });

  it('extractErrorFromUrl with error', () => {
    const testUrl = new URL('https://test-url.com?error=test-name&description=test-description');
    const error = component.extractErrorFromUrl(testUrl);
    expect(error).toEqual({ name: 'test-name', description: 'test-description' });
  });

  it('extractErrorFromUrl with error, no description', () => {
    const testUrl = new URL('https://test-url.com?error=test-name');
    const error = component.extractErrorFromUrl(testUrl);
    expect(error).toEqual({ name: 'test-name', description: 'unknown' });
  });

  it('extractErrorFromUrl no error, no description', () => {
    const testUrl = new URL('https://test-url.com');
    const error = component.extractErrorFromUrl(testUrl);
    expect(error).toBeUndefined();
  });

  it('determineCurrentState as LoggedIn', () => {
    const testHeader = btoa('{"test": "test"}');
    const encodedJWT = btoa('{"csid": "123456789", "trid": "1"}');
    // @ts-ignore
    component.loginService.storeInLocalStorage(
      {
        accessToken: `${testHeader}.${encodedJWT}.test`,
        refreshToken: 'test-refresh',
        expiresIn: '100',
        tokenType: 'bearer'
      },
      '123456789',
      'laserfiche.com'
      );

    const currentState = component.determineCurrentState(undefined);
    expect(currentState).toEqual(LoginState.LoggedIn);
  });

  it('determineCurrentState as LoggedOut', () => {
    const currentState = component.determineCurrentState(undefined);
    expect(currentState).toEqual(LoginState.LoggedOut);
  });

  it('determineCurrentState as LoggingIn', () => {
    const currentCodeState = component.determineCurrentState({ authorizationCode: 'test-code' });
    expect(currentCodeState).toEqual(LoginState.LoggingIn);
    const currentErrorState = component.determineCurrentState({ error: { name: 'test-name', description: 'test-description' } });
    expect(currentErrorState).toEqual(LoginState.LoggingIn);
  });

  it('createRefreshTokenRequest creates request', () => {
    // @ts-ignore
    component.loginService._accessToken = { accessToken: 'test-access', refreshToken: 'test-refresh', expiresIn: '100', tokenType: 'bearer' };
    const refreshTokenRequest = component.createRefreshTokenRequest();
    expect(refreshTokenRequest.body).toEqual('grant_type=refresh_token&refresh_token=test-refresh&client_id=undefined');
    expect(refreshTokenRequest.method).toEqual('POST');
    expect(refreshTokenRequest.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
  });

  it('createRefreshTokenRequest throws when no refresh token', () => {
    expect(() => component.createRefreshTokenRequest()).toThrow();
  });

  it('extractCodeFromUrl gets code from url', () => {
    const testUrl = new URL('https://test-url.com?code=test-code');
    const codeFromUrl = component.extractCodeFromUrl(testUrl);
    expect(codeFromUrl).toEqual('test-code');

    const testUrlNoCode = new URL('https://test-url.com');
    const noCodeFromUrl = component.extractCodeFromUrl(testUrlNoCode);
    expect(noCodeFromUrl).toBeUndefined();
  });

  it('getAuthorizeUrl returns full OAuth url', () => {
    const authUrl = component.getAuthorizeUrl();
    expect(authUrl).toEqual('https://signin.laserfiche.com/oauth/Authorize?client_id=undefined&redirect_uri=undefined&scope=undefined&response_type=code&response_mode=query&state=lf-login-redirect&code_challenge=undefined&code_challenge_method=S256');
  });

  it('getFullLogoutUrl returns logout url', () => {
    const testHeader = btoa('{"test": "test"}');
    const encodedJWT = btoa('{"csid": "123456789", "trid": "1"}');
    // @ts-ignore
    component.loginService.storeInLocalStorage(
      {
        accessToken: `${testHeader}.${encodedJWT}.test`,
        refreshToken: 'test-refresh',
        expiresIn: '100',
        tokenType: 'bearer'
      },
      '123456789',
      'laserfiche.com');
    component.redirect_uri = 'test-url';
    const logoutUrl = component.getFullLogoutUrl();

    expect(logoutUrl).toEqual('https://accounts.laserfiche.com/WebSTS/?wa=wsignout1.0&wreply=test-url');
  });

  it('getFullLogoutUrl when no signout url available', () => {
    // @ts-ignore
    component.loginService._accountEndpoints = undefined;
    expect(component.getFullLogoutUrl()).toBeUndefined();
  });

  it('concatStrings should return second string when no first string', () => {
    expect(component.concatStrings(undefined, 'test')).toEqual('test');
  });

  it('concatStrings should return concatenated strings when there is first string', () => {
    expect(component.concatStrings('hi', 'test')).toEqual('hi test');
    expect(component.concatStrings('hi ', 'test')).toEqual('hi test');
    expect(component.concatStrings('hi ', ' test')).toEqual('hi test');
    expect(component.concatStrings('hi', ' test')).toEqual('hi test');
  });
});
