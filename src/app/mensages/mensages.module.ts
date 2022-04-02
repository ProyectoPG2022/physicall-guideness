import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MensagesPageRoutingModule } from './mensages-routing.module';

import { MensagesPage } from './mensages.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MensagesPageRoutingModule
  ],
  declarations: [MensagesPage]
})
export class MensagesPageModule {}
