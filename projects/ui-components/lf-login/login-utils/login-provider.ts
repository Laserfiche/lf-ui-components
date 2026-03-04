// Copyright Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { BaseTokenClient } from '@laserfiche/lf-api-client-core';
import { AuthorizationCredentials } from './lf-login-types';
import { RedirectUriQueryParams } from './lf-login-internal-types';
import { LoginState } from '@laserfiche/lf-ui-components/shared';

/** @internal */
export interface LoginProvider {
  /**
   * Returns a {@link BaseTokenClient} instance with the provided token client URL.
   *
   * @param tokenClientUrl - The URL of the token client (optional).
   * @returns A new instance of {@link BaseTokenClient}.
   */
  getTokenClient(tokenClientUrl?: string): BaseTokenClient;

  /**
   * Returns the base authorize URL for the login process.
   *
   * @return The base authorize URL as a string.
   */
  getBaseAuthorizeUrl(): string;

  /**
   * Stores access token credentials and account information in local storage.
   *
   * @param accessTokenCredentials - The access token credentials to store.
   * @param accountId - The account ID associated with the access token.
   * @param regionalDomain - The regional domain associated with the access token.
   */
  storeInLocalStorage(
    accessTokenCredentials: AuthorizationCredentials,
    accountId: string,
    regionalDomain: string,
  ): void;

  /**
   * Exchanges redirect URI query parameters from a URL into a {@link RedirectUriQueryParams} object.
   *
   * @param url - The URL containing the query parameters to exchange.
   * @return A new instance of {@link RedirectUriQueryParams} or undefined if no valid query parameters are found.
   */
  exchangeRedirectUriQueryParams(url: URL): RedirectUriQueryParams | undefined;

  /**
   * Determines the current state of the login process based on callback URI parameters and emits events to notify
   * other components of the login state change.
   *
   * @param callBackURIParams - The callback URI parameters received from the login provider.
   * @param loginCompleted - An event emitter that will be notified when the login is completed successfully.
   * @param logoutCompleted - An event emitter that will be notified when the logout is completed successfully.
   * @return The current state of the login process as a {@link LoginState} enum value.
   */
  determineCurrentState(
    callBackURIParams: RedirectUriQueryParams | undefined,
    loginCompleted: { emit: () => void },
    logoutCompleted: { emit: () => void },
  ): LoginState;

  /**
   * Initiates the logout process by emitting a URL to the provided event emitter.
   *
   * @param url - The URL that will be emitted to initiate the logout process (optional).
   * @param logoutInitiated - An event emitter that will receive the URL to initiate the logout process.
   */
  logoutInitiatedViaUrl(url: string | undefined, logoutInitiated: { emit: (url: string) => void }): void;
}
