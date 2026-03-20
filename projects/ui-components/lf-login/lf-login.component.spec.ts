// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { LfLoginComponent } from './lf-login.component';
import { LoginState } from '@laserfiche/lf-ui-components/shared';
import { LfLoginService } from './login-utils/lf-login.service';
import { AccountEndpoints } from './lf-login-public-api';

describe('LfLoginComponent', () => {
  let loginService: LfLoginService;
  let component: LfLoginComponent;
  let fixture: ComponentFixture<LfLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LfLoginComponent, MatMenuModule],
      providers: [LfLoginService],
    }).compileComponents();
    loginService = TestBed.inject(LfLoginService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loginService.removeFromLocalStorage();
    loginService._state = LoginState.LoggedOut;
    loginService.authorize_url_host_name = 'laserfiche.com';
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('parseCallbackURI with no state', () => {
    const uriParams = component.parseCallbackURI('https://testurl.com');
    expect(uriParams).toBeUndefined();
  });

  it('parseCallbackURI should call exchangeRedirectUriQueryParams from login provider', () => {
    const mockExchangeRedirectUriQueryParams = vi.fn();
    loginService.loginProvider = {
      exchangeRedirectUriQueryParams: mockExchangeRedirectUriQueryParams,
    } as any;

    component.parseCallbackURI(
      'https://testurl.com/hi?code=auth-code&state=lf-login-redirect&domain=laserfiche.com&customerId=123456789',
    );
    expect(mockExchangeRedirectUriQueryParams).toHaveBeenCalled();
  });

  it('createRefreshTokenRequest creates request', () => {
    loginService._accessToken = {
      accessToken: 'test-access',
      refreshToken: 'test-refresh',
      expiresIn: '100',
      tokenType: 'bearer',
    };
    const refreshTokenRequest = component.createRefreshTokenRequest();
    expect(refreshTokenRequest.body).toEqual('grant_type=refresh_token&refresh_token=test-refresh&client_id=undefined');
    expect(refreshTokenRequest.method).toEqual('POST');
    expect(refreshTokenRequest.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
  });

  it('createRefreshTokenRequest throws when no refresh token', () => {
    expect(() => component.createRefreshTokenRequest()).toThrow();
  });

  it('getAuthorizeUrl returns full OAuth url', () => {
    const testLoginProvider = { getBaseAuthorizeUrl: () => 'https://signin.laserfiche.com/oauth/Authorize' } as any;
    loginService.loginProvider = testLoginProvider;

    const authUrl = component.getAuthorizeUrl();
    expect(authUrl).toEqual(
      'https://signin.laserfiche.com/oauth/Authorize?redirect_uri=undefined&response_type=code&response_mode=query&state=lf-login-redirect&code_challenge=undefined&code_challenge_method=S256',
    );
  });

  describe('getFullLogoutUrl', () => {
    it('should return a logout URL when wsignoutUrl is available', () => {
      const accountEndpoints: AccountEndpoints | undefined = {
        wsignoutUrl: 'https://accounts.laserfiche.com/WebSTS/?wa=wsignout1.0',
        webClientUrl: '',
        regionalDomain: '',
        oauthAuthorizeUrl: '',
      };
      const originalGetAccountEndpointsSpy = vi.spyOn<any>(loginService, 'getAccountEndpoints');
      originalGetAccountEndpointsSpy.mockReturnValue(accountEndpoints);

      component.redirect_uri = 'test-url';
      const logoutUrl = component.getFullLogoutUrl();

      expect(logoutUrl).toEqual('https://accounts.laserfiche.com/WebSTS/?wa=wsignout1.0&wreply=test-url');
    });

    it('should return undefined when wsignoutUrl is unavailable', () => {
      const originalGetAccountEndpointsSpy = vi.spyOn<any>(loginService, 'getAccountEndpoints');
      originalGetAccountEndpointsSpy.mockReturnValue(undefined);

      expect(component.getFullLogoutUrl()).toBeUndefined();
    });
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
