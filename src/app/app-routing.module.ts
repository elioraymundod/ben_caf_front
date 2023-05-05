import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AgricultorMainComponent } from './agricultorComponents/agricultor-main/agricultor-main.component';
import { UserGuard } from './securityComponents/user.guard';
import { BeneficioMainComponent } from './beneficioComponents/beneficio-main/beneficio-main.component';
import { PesoCabalMainComponent } from './pesoCabalComponent/peso-cabal-main/peso-cabal-main.component';
import { InformacionPublicaComponent } from './informacion-publica/informacion-publica.component';
//import { MapaComponent } from './mapa/mapa.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'agricultor-main', component: AgricultorMainComponent, canActivate: [UserGuard]},
  {path: 'beneficio-main', component: BeneficioMainComponent, canActivate: [UserGuard]},
  {path: 'peso-cabal-main', component: PesoCabalMainComponent, canActivate: [UserGuard]},
  {path: 'consulta-beneficio-cafe/:transportista', component: InformacionPublicaComponent},
  {path: '**', component: LoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
