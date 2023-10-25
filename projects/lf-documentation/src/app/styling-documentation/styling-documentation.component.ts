// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component } from '@angular/core';
import { ThemeService } from '../theme.service';

@Component({
  selector: 'app-styling-documentation',
  templateUrl: './styling-documentation.component.html',
  styleUrls: ['./styling-documentation.component.css', './../app.component.css']
})
export class StylingDocumentationComponent {

  constructor(private themeService: ThemeService) {
  }

  showCode(divID: string, tabGroup: string): void {
    const divElement = document.getElementById(divID);
    if (!divElement) {
      console.warn(`showCode: ${divID} not found`);
      return;
    }

    if (divElement.style.display === 'none') {
      const tabContent = Array.from(document.getElementsByClassName(tabGroup) as HTMLCollectionOf<HTMLElement>);
      for (const tab of tabContent) {
        tab.style.display = 'none';
      }
      divElement.style.display = 'block';
    }
    else {
      divElement.style.display = 'none';
    }
  }

  setTheme(selectClassName: string): void {
    const selectElement = document.getElementById(selectClassName) as HTMLSelectElement;
    const themeSelected = selectElement.options[selectElement.selectedIndex].value;
    this.changeStylesheet(themeSelected);
  }

  changeStylesheet(stylesheetName: string): void {
    this.themeService.changeStylesheet(stylesheetName);
  }

  removeTheme(): void {
    this.themeService.removeTheme();
  }

}
