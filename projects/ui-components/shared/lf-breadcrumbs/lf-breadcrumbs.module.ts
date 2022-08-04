import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfBreadcrumbsComponent } from './lf-breadcrumbs.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [
    LfBreadcrumbsComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonToggleModule
  ],
  exports: [
    LfBreadcrumbsComponent
  ]
})
export class LfBreadcrumbsModule { }
