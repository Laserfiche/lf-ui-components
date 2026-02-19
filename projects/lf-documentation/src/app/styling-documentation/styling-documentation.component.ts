// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { Component, inject } from '@angular/core';
import { ThemeService } from '../theme.service';
import { CardComponent } from '../card/card.component';

@Component({
    selector: 'app-styling-documentation',
    templateUrl: './styling-documentation.component.html',
    styleUrls: ['./styling-documentation.component.css', './../app.component.css'],
    standalone: true,
    imports: [CardComponent]
})
export class StylingDocumentationComponent {
  private themeService = inject(ThemeService);


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
