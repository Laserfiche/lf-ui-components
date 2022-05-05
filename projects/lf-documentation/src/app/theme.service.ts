import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }

  changeStylesheet(stylesheetName: string) {
    if (stylesheetName === 'laserfiche') {
      this.setStyleHref(`./lf-laserfiche-lite.css`);
    }
    else if (stylesheetName === 'microsoft') {
      this.setStyleHref(`./lf-ms-office-lite.css`);
    }
  }

  removeTheme() {
    this.setStyleHref('');
  }

  private setStyleHref(url: string) {
    const stylesheet = document.getElementById('lf-stylesheet');
    stylesheet?.setAttribute('href', url);
  }
}
