import { Inject, Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
//import { VaultService } from '../ionic-vault/vault.service';
import { IonLoaderService } from '../ion-loader/ion-loader.service';
import { Capacitor } from '@capacitor/core';
import { auth0Config } from './auth0.config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  getPlatformInformation;
  loginFailed: boolean = false;
  userProfile!: object;
  mfa_subject$: any = new Subject();
  mfaList$ = new Subject();
  obb_code$ = new Subject();
  mfa_token$ = new Subject();
  mfa_token: any;
  obbCode: any;
  constructor(
    private oauthService: OAuthService,
    private router: Router,
    //private vaultSerice: VaultService,
    private ionLoader: IonLoaderService,
    private http: HttpClient,
  ) {
    this.getPlatformInformation = Capacitor.getPlatform();
    this.oauthService.configure(auth0Config);
    this.oauthService.loadDiscoveryDocument();
  }


  // Auth0 setup

  loginWithPassword(username: string, password: string) {
    // this.ionLoader.simpleLoader("Please wait");
    this.oauthService
      .fetchTokenUsingPasswordFlowAndLoadUserProfile(
        username,
        password
      )
      .then(() => {
        console.debug('successfully logged in');
        this.oauthService.setStorage(localStorage);
       // this.ionLoader.dismissLoader();
       // this.router.navigateByUrl('home');
        this.loginFailed = false;
      })
      .catch((err) => {
        console.error('error logging in', err);
        if (err.error.error == "mfa_required") {
          this.mfa_token = err.error.mfa_token;

          console.log(true);
          this.checkMFA(err.error.mfa_token).subscribe((response: any) => {
            //console.log("List of MFA's", response);
            if(response != '') {
              this.mfaList$.next([true,response,this.mfa_token]);
            } else {
              this.mfaList$.next([false,response,this.mfa_token]);
            }
            // this.enrollMFA('otp','','').subscribe(response => {
            //   console.log("response from push notificaiton", response)
            // })
           // console.log("MFA Setup response", response[0]);
           // this.mfa_subject$.next(true);
            // this.challengeMFA(response[0]?.authenticator_type, response[0]?.id, err.error.mfa_token).subscribe((response: any) => {
            //  // console.log("List of authenticators",response);
            //   this.obbCode = response?.oob_code
            // },(error)=> {
            //   console.log(error);
            // });
          });
        }
       // this.router.navigateByUrl('login');
        this.loginFailed = true;
      });
  }

  logout() {
    this.oauthService.logOut(true);
    //this.vaultSerice.clearVault();
    if (
      this.getPlatformInformation == 'android' ||
      this.getPlatformInformation == 'ios' || this.getPlatformInformation == 'web'
    ) {
      //this.ionLoader.autoLoaderLogout();
      this.router.navigateByUrl('login');
    }
    // } else if (this.getPlatformInformation == 'web') {
    //   this.router.navigateByUrl('login');
    // }
  }

  enrollMFA(selection: string,email: any, phone: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.mfa_token}`
    })
    console.log(selection, email, phone);
    var data;
    if(selection == 'push') {
      data = { "authenticator_types": ["oob"], "oob_channels": ["auth0"],"allow_multiple_enrollments": true }
    } else if(selection == 'otp') {
      data = { "authenticator_types": ["otp"],"allow_multiple_enrollments": true }
    } else if (selection == 'email') {
      data = { "authenticator_types": ["oob"], "oob_channels": ["email"], "email" : `${email}`,"allow_multiple_enrollments": true }
    } else if (selection == 'sms') {
      data = { "authenticator_types": ["oob"], "oob_channels": ["sms"], "phone_number": `${phone}`,"allow_multiple_enrollments": true }
    }
    console.log("Data before selection", data);

    return this.http.post(`https://thingproxy.freeboard.io/fetch/https://tcb-auth0poc.us.auth0.com/mfa/associate`,data, { headers: headers });
  }

  checkMFA(mfa_token: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${mfa_token}`
    })
    return this.http.get(`https://tcb-auth0poc.us.auth0.com/mfa/authenticators`, { headers: headers });
  }

  challengeMFA(authenticator_type: any, authenticator_id: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    var data = {
      client_id: `${auth0Config.clientId}`,
      client_secret: `${auth0Config.dummyClientSecret}`,
      challenge_type: `${authenticator_type}`,
      authenticator_id: `${authenticator_id}`,
      mfa_token: `${this.mfa_token}`
    }
    return this.http.post('https://thingproxy.freeboard.io/fetch/https://tcb-auth0poc.us.auth0.com/mfa/challenge', data, { headers: headers });
  }

  validateMFACode(authentication_type: string,oob_channel: string,user_otp_code: any, oob_code: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    })
    console.log(authentication_type);
    let body = new URLSearchParams();
    body.set("mfa_token", `${this.mfa_token}`);
    body.set("client_id", `${auth0Config.clientId}`);
    body.set("client_secret", `${auth0Config.dummyClientSecret}`);
    if(authentication_type == 'oob') {
      body.set("oob_code", `${oob_code}`);
      body.set("binding_code", `${user_otp_code}`);
      body.set("grant_type", 'http://auth0.com/oauth/grant-type/mfa-oob');
    } else if (authentication_type == 'otp') {
      body.set("otp", `${user_otp_code}`);
      body.set("grant_type", 'http://auth0.com/oauth/grant-type/mfa-otp');
    } else if (authentication_type == 'oob' && oob_channel == 'push') {
      body.set("oob_code", `${oob_code}`);
      body.set("grant_type", 'http://auth0.com/oauth/grant-type/mfa-oob');
    } else if (authentication_type == 'recovery-code') {
      body.set("recovery_code", `${user_otp_code}`);
      body.set("grant_type", 'http://auth0.com/oauth/grant-type/mfa-recovery-code');
    }
    return this.http.post(`https://thingproxy.freeboard.io/fetch/https://tcb-auth0poc.us.auth0.com/oauth/token`, body, { headers: headers });
  }


  
  getUserHistory(token: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    })
    return this.http.get(`https://thingproxy.freeboard.io/fetch/https://tcb-auth0poc.us.auth0.com/api/v2/logs`,{ headers: headers });
  }

  loadUserProfile(): void {
    this.oauthService.loadUserProfile().then((up) => (this.userProfile = up));
  }

  get access_token() {
    return this.oauthService.getAccessToken();
  }

  get access_token_expiration() {
    return this.oauthService.getAccessTokenExpiration();
  }

}
