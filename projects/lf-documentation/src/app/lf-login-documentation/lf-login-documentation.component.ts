// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbortedLoginError, LfLoginComponent } from './../../../../ui-components/lf-login/lf-login-public-api';
import { LoginMode, LoginState, RedirectBehavior } from './../../../../ui-components/shared/lf-shared-public-api';
import { CardComponent } from '../card/card.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lf-login-documentation',
  templateUrl: './lf-login-documentation.component.html',
  styleUrls: ['./lf-login-documentation.component.css', './../app.component.css'],
  standalone: true,
  imports: [CardComponent, CommonModule, LfLoginComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LfLoginDocumentationComponent {
  get menuState(): LoginState {
    return this.loginElem?.state ?? LoginState.LoggedOut;
  }

  private location = window.location;
  redirect_uri: string = this.location.origin + this.location.pathname + this.location.hash;
  scope = 'All';
  redirect_behavior = RedirectBehavior.Replace;
  menuMode = LoginMode.Menu;
  authorizeUrlHostName = 'a.clouddev.laserfiche.com'; // TODO this is hardcoded to clouddev for now

  @ViewChild('loginMenu') loginElem?: LfLoginComponent;

  //us
  client_id = 'b91PgGR2dQpeYeL2s790VY0w';

  constructor() {}

  loginInitHandler(event: void) {
    console.log('logging in');
  }

  logoutInitHandler(event: void) {
    console.log('logging out');
  }

  logoutCompleteHandler(error: AbortedLoginError | void) {
    console.log('logged out', error);
  }

  loginCompleteHandler(error: AbortedLoginError | void) {
    console.log('logged in');
  }

  async refresh() {
    await this.loginElem?.refreshTokenAsync(true);
  }
}
