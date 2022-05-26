import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PrivateProfilePageRoutingModule } from './private-profile-routing.module';

import { PrivateProfilePage } from './private-profile.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PrivateProfilePageRoutingModule
  ],
  declarations: [PrivateProfilePage]
})
export class PrivateProfilePageModule {}
