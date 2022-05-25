import { NgModule,DoBootstrap, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {createCustomElement} from '@angular/elements';
import { LoginComponent } from './components/login/login.component';
import { SettingsComponent } from './components/settings/settings.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OAuthModule } from 'angular-oauth2-oidc';
import { QRCodeModule } from 'angular2-qrcode';

import { AuthenticationService } from './services/authentication/authentication.service';
import { CapacitorBiometricService } from './services/capacitor-biometric/capacitor-biometric.service';
import { IonLoaderService } from './services/ion-loader/ion-loader.service';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    OAuthModule.forRoot(),
    AppRoutingModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    QRCodeModule,
  ],
  providers: [AuthenticationService,CapacitorBiometricService,IonLoaderService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private injector: Injector) {}
  ngDoBootstrap() {
    const el = createCustomElement(AppComponent, { injector: this.injector });
    customElements.define('login-spa', el);
  }
 }
