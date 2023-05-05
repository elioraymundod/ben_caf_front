import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MaterialExampleModule } from './material.module';
import { DatePipe } from '@angular/common';
import { LoginService } from './Services/LoginService.service';
import { LoginComponent } from './login/login.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AgricultorMainComponent } from './agricultorComponents/agricultor-main/agricultor-main.component';
import { PesoCabalMainComponent } from './pesoCabalComponent/peso-cabal-main/peso-cabal-main.component';
import { BeneficioMainComponent } from './beneficioComponents/beneficio-main/beneficio-main.component';
import { CuentasService } from './Services/CuentasService.service';
import { SolicitudesService } from './Services/SolicitudesService.service';
import { QRCodeModule } from 'angularx-qrcode';
import { InformacionPublicaComponent } from './informacion-publica/informacion-publica.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AgricultorMainComponent,
    PesoCabalMainComponent,
    BeneficioMainComponent,
    InformacionPublicaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatNativeDateModule,
    MaterialExampleModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    QRCodeModule,
  ],
  providers: [LoginService, DatePipe, CuentasService, SolicitudesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
