import { Component, ElementRef, ViewChild } from '@angular/core';
import { AbortedLoginError, LfLoginComponent, LoginState, RedirectBehavior, LoginMode } from '@laserfiche/types-laserfiche-ui-components';

@Component({
  selector: 'app-lf-login-documentation',
  templateUrl: './lf-login-documentation.component.html',
  styleUrls: ['./lf-login-documentation.component.css', './../app.component.css']
})
export class LfLoginDocumentationComponent {

  get menuState(): LoginState {
    return this.loginElem?.nativeElement.state ?? LoginState.LoggedOut;
  }

  private location = window.location;
  redirect_uri: string = this.location.origin + this.location.pathname + this.location.hash;
  scope = "All";
  redirect_behavior = RedirectBehavior.Replace;
  menuMode = LoginMode.Menu;
  authorizeUrlHostName = 'a.clouddev.laserfiche.com'; // TODO this is hardcoded to clouddev for now

  @ViewChild('loginMenu') loginElem?: ElementRef<LfLoginComponent>;

  //us
  client_id = 'b91PgGR2dQpeYeL2s790VY0w';

  constructor() { }

  loginInitHandler(event: CustomEvent<void>) {
    console.log("logging in");
  }

  logoutInitHandler(event: CustomEvent<void>) {
    console.log("logging out");
  }

  logoutCompleteHandler(event: CustomEvent<AbortedLoginError | void>) {
    console.log("logged out", event.detail);
  }

  loginCompleteHandler(event: CustomEvent<AbortedLoginError | void>) {
    console.log("logged in");
  }

  async refresh() {
    await this.loginElem?.nativeElement.refreshTokenAsync(true);
  }
}
