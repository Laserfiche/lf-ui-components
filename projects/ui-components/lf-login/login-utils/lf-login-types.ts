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

export interface LfBeforeFetchResult {
  regionalDomain: string;
}

/**
 * This object handles obtaining the accessToken and
 * setting the authorization header
 */
export interface LfHttpRequestHandler {
  /**
   * Called to prepare the request to the API service.
   * @param url The HTTP url
   * @param request The HTTP request
   */
  beforeFetchRequestAsync: (url: string, request: RequestInit) => Promise<LfBeforeFetchResult>;
  /**
   * Called to handle the response from the API service.
   * @param url The HTTP url
   * @param response The HTTP response
   * @param request The HTTP request
   * @returns true if the request should be retried.
   */
  afterFetchResponseAsync: (url: string, response: Response, request: RequestInit) => Promise<boolean>;
}
