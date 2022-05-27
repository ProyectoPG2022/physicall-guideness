import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PerfilPage } from './perfil/perfil.page';

import { PublicProfilePage } from './public-profile/public-profile.page';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: 'perfil',
    loadChildren: () =>
      import('./perfil/perfil.module').then((m) => m.PerfilPageModule),
  },

  {
    path: 'mensages',
    loadChildren: () =>
      import('./mensages/mensages.module').then((m) => m.MensagesPageModule),
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./register/register.module').then((m) => m.RegisterPageModule),
  },
  {
    path: 'verify-email',
    loadChildren: () =>
      import('./verify-email/verify-email.module').then(
        (m) => m.VerifyEmailPageModule
      ),
  },
  {
    path: 'forgot-password',
    loadChildren: () =>
      import('./forgot-password/forgot-password.module').then(
        (m) => m.ForgotPasswordPageModule
      ),
  },
  {
    path: 'public-profile',
    loadChildren: () => import('./public-profile/public-profile.module').then( m => m.PublicProfilePageModule)
  },  {
    path: 'public-profile/:id',
    component: PublicProfilePage,
  },

];
@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
