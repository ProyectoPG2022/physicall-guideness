import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrivateProfilePage } from './private-profile.page';

const routes: Routes = [
  {
    path: '',
    component: PrivateProfilePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivateProfilePageRoutingModule {}
