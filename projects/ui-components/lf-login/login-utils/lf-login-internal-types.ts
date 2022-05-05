/** @internal */
export interface AccessTokenError {
    type?: string;
    title: string;
    status: number;
    instance?: string;
    operationId?: string;
    traceId?: string;
}

/** @internal */
export interface OAuthAccessTokenData {
    accountId: string;
    webClientUrl: string;
    wsignoutUrl: string;
    repositoryApiBaseUrl: string;
    trusteeId: string;
}

/** @internal */
export interface AccountInfo {
    accountId: string;
    trusteeId: string;
}