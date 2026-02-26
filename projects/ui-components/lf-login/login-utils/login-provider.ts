// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { BaseTokenClient } from "@laserfiche/lf-api-client-core";
import { AuthorizationCredentials } from "./lf-login-types";
import { RedirectUriQueryParams } from "./lf-login-internal-types";
import { LoginState } from "@laserfiche/lf-ui-components/shared";

export  interface LoginProvider {
  getTokenClient(tokenClientUrl?: string): BaseTokenClient;

  getBaseAuthorizeUrl(): string;

  storeInLocalStorage(accessTokenCredentials: AuthorizationCredentials, accountId: string, regionalDomain: string): void;

  exchangeRedirectUriQueryParams(url: URL): RedirectUriQueryParams;

  determineCurrentState(callBackURIParams: RedirectUriQueryParams | undefined, loginCompleted: {emit: () => void}, logoutCompleted:{emit: () => void}): LoginState;

  logoutInitiatedViaUrl(url: string | undefined, logoutInitiated: {emit: (url: string) => void}): void
}
