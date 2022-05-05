import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LfTreeModule } from './lf-tree/lf-tree.module';
import { FlatTreeComponentsModule } from './flat-tree-components/flat-tree-components.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    LfTreeModule,
    FlatTreeComponentsModule
  ]
})
export class TreeComponentsModule { }
