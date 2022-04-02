import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MensagesPage } from './mensages.page';

const routes: Routes = [
  {
    path: '',
    component: MensagesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MensagesPageRoutingModule {}
