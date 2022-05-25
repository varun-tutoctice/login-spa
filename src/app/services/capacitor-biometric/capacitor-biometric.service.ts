import { Injectable } from '@angular/core';
import {
  AvailableResult,
  BiometryType,
  NativeBiometric,
} from 'capacitor-native-biometric';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';
import { Router } from  "@angular/router";
import { IonLoaderService } from '../ion-loader/ion-loader.service';

@Injectable({
  providedIn: 'root'
})
export class CapacitorBiometricService {

  biometricChecked$: any = new BehaviorSubject(false);
  constructor(private auth: AuthenticationService, private  router:  Router, private ionLoader: IonLoaderService) { }

  setCredential(username: any, password: any) {
    NativeBiometric.setCredentials({
      username: username,
      password: password,
      server: window.location.host,
    }).then((response)=> {
      console.log("Response from set credential", response);
    });
  }

  deleteCredential() {
    // Delete user's credentials
    NativeBiometric.deleteCredentials({
      server: window.location.host,
    });
  }

  checkCredential() {
    NativeBiometric.isAvailable().then((result: AvailableResult) => {
      const isAvailable = result.isAvailable;
      //alert('RESULT ' + JSON.stringify(result));
      var biometricResult;

      // const isFaceId=result.biometryType==BiometryType.FACE_ID;
      // const isFaceId = result.biometryType == BiometryType.FACE_ID;
      if(result.biometryType == 0) {
        biometricResult = "No Biometrics Available on this Device"
      } else if(result.biometryType == 1) {
        biometricResult = "Touch_ID available"
      } else if(result.biometryType == 2) {
        biometricResult = "Face_ID available"
      } else if(result.biometryType == 3) {
        biometricResult = "Fingerprint Available"
      } else if(result.biometryType == 4) {
        biometricResult = "Face Authentication Available"
      } else if(result.biometryType == 5) {
        biometricResult = "IRIS Authentication Available"
      }

      alert('Biometrics Availability on the Device' + biometricResult);
      if (isAvailable) {
        // Get user's credentials

        NativeBiometric.getCredentials({
          server: window.location.host,
        }).then((credentials) => {
          this.biometricChecked$.next(true);
          // alert('CREDENTIAL ' + JSON.stringify(credentials));
          // Authenticate using biometrics before logging the user in
          NativeBiometric.verifyIdentity({
            reason: 'For easy log in',
            title: 'Biometric Login',
            subtitle: `Login with your credentials`+` `+credentials.username,
            description: 'Scan you fingerprint',
          })
            .then(() => {
              //     // Authentication successful
              this.ionLoader.simpleLoader("Please wait")
              this.auth.loginWithPassword(credentials.username, credentials.password);
             // alert('SUCCESS!!');
              //     // this.login(credentials.username, credentials.password);
            })
            .catch((err) => {
              //   // Failed to authenticate
              this.router.navigateByUrl('login');
              //alert('FAIL!');
            });
        });
      }
    });
  }

}
