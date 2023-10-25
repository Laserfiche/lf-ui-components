// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

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
export interface AccountInfo {
    accountId: string;
    trusteeId: string;
}

/** @internal */
export interface RedirectUriQueryParams {
  error?: { name: string; description: string };
  authorizationCode?: string;
  cloudSubDomain?: string;
  customerId?: string;
}
