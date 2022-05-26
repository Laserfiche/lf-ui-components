import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { RouterLinks } from './app-routing.module';
import { ThemeService } from './theme.service';

interface ComponentNode {
  name: string;
  children?: ComponentNode[];
  routerLink?: string;
}

const TREE_DATA: ComponentNode[] = [
  { name: 'Overview', routerLink: RouterLinks.OVERVIEW },
  {
    name: 'Getting Started',
    routerLink: RouterLinks.GETTING_STARTED,
    children: [
      { name: 'Example via CDN', routerLink: RouterLinks.GETTING_STARTED_CDN },
      { name: 'Example via NPM', routerLink: RouterLinks.GETTING_STARTED_NPM },
    ]
  },
  // { name: 'Localization', routerLink: RouterLinks.LOCALIZATION },
  { name: 'Styling', routerLink: RouterLinks.STYLING },
  {
    name: 'UI Components',
    children: [
      { name: 'lf-user-feedback', routerLink: RouterLinks.LF_USER_FEEDBACK },
      { name: 'lf-login', routerLink: RouterLinks.LF_LOGIN },
      {
        name: 'Lists & Trees',
        children: [
          { name: 'lf-breadcrumbs', routerLink: RouterLinks.LF_BREADCRUMBS },
          { name: 'lf-checklist', routerLink: RouterLinks.LF_CHECKLIST },
          { name: 'lf-file-explorer', routerLink: RouterLinks.LF_FILE_EXPLORER },
          { name: 'lf-folder-browser', routerLink: RouterLinks.LF_FOLDER_BROWSER },
          { name: 'lf-toolbar', routerLink: RouterLinks.LF_TOOLBAR },
          { name: 'lf-tree', routerLink: RouterLinks.LF_TREE },
        ]
      },
      {
        name: 'Metadata',
        children: [
          {
            name: 'lf-field-container',
            routerLink: RouterLinks.LF_FIELD_CONTAINER,
            children: [
              { name: 'lf-field-adhoc-container', routerLink: RouterLinks.LF_FIELD_ADHOC_CONTAINER },
              { name: 'lf-field-template-container', routerLink: RouterLinks.LF_FIELD_TEMPLATE_CONTAINER },
            ]
          },
          { name: 'Field Types and Interfaces', routerLink: RouterLinks.LF_FIELD_TYPES },
        ]
      }
    ]
  },
  {
    name: 'Tips and Tricks',
    children: [
      { name: 'Troubleshooting', routerLink: RouterLinks.TROUBLESHOOTING },
      { name: 'Converting Angular Component to Element', routerLink: RouterLinks.CONVERT_COMPONENT }
    ]
  },
  {
    name: 'Release Notes',
    routerLink: RouterLinks.RELEASE_NOTES
  }
];

@Component({
  selector: 'app-root-lf-documentation',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {

  title = 'lf-documentation';
  treeControl = new NestedTreeControl<ComponentNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<ComponentNode>();

  constructor(private themeService: ThemeService) {
    this.dataSource.data = TREE_DATA;
  }

  ngOnInit() {
    const urlParts = location.href.split('/').filter((part) => part !== '');
    const treeNodeToOpen: string | undefined = urlParts.pop();
    this.expandToNode(TREE_DATA, treeNodeToOpen);
  }

  hasChild = (_: number, node: ComponentNode) => !!node.children && node.children.length > 0;

  setTheme(selectClassName: string) {
    const selectElement = document.getElementById(selectClassName) as HTMLSelectElement;
    const themeSelected = selectElement.options[selectElement.selectedIndex].value;
    this.themeService.changeStylesheet(themeSelected);
  }

  async setLanguage(language: string) {
    if (!language || language.length === 0) {
      language = navigator.language;
    }
    const langObj = {
      'lf-localization-service-set-language': language
    };
    window.postMessage(JSON.stringify(langObj), window.origin);
  }

  private expandToNode(data: ComponentNode[], routerLink: string | undefined): boolean {
    for (let i = 0; i < data.length; i++) {
      const node: ComponentNode = data[i];
      if (node.children && node.children.find(c => c.routerLink === routerLink)) {
        this.treeControl.expand(node);
        return true;
      }
      else if (node.children && node.children.find(c => c.children)) {
        const found: boolean = this.expandToNode(node.children, routerLink);
        if (found) {
          this.treeControl.expand(node);
          return true;
        }
      }
    }
    return false;
  }
}
