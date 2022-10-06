export interface AuthorizationCredentials {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
}

export interface AccountEndpoints {
    webClientUrl: string;
    wsignoutUrl: string;
    repositoryApiBaseUrl: string;
    regionalDomain: string;
    oauthAuthorizeUrl: string;
    oauthTokenUrl: string;
}

export interface AbortedLoginError {
    ErrorType: string;
    ErrorMessage: string;
}
