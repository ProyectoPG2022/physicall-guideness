import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { PublicProfilePage } from './public-profile.page';
import { PublicProfilePageRoutingModule } from './public-profile-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PublicProfilePageRoutingModule
  ],
  declarations: [PublicProfilePage]
})
export class PublicProfilePageModule {}
