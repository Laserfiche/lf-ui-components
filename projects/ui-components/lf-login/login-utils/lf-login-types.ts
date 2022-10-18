export interface AuthorizationCredentials {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
}

export interface AccountEndpoints {
    webClientUrl: string;
    wsignoutUrl: string;
    regionalDomain: string;
    oauthAuthorizeUrl: string;
}

export interface AbortedLoginError {
    ErrorType: string;
    ErrorMessage: string;
}
