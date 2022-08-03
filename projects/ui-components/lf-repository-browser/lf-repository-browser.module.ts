import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ScrollingModule} from '@angular/cdk/scrolling'

import { LfRepositoryBrowserComponent } from './lf-repository-browser.component';



@NgModule({
  declarations: [
    LfRepositoryBrowserComponent
  ],
  imports: [
    CommonModule,
    ScrollingModule
  ]
})
export class LfRepositoryBrowserModule { }
