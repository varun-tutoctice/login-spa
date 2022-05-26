import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { delay, retry, retryWhen } from 'rxjs/operators';
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { CapacitorBiometricService } from '../../services/capacitor-biometric/capacitor-biometric.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @Input() data: any;
  @Input() route: any;
  loginValues: any;
  getPlatformInformation: any;
  hideBiometric = false;
  biometricChecked: any;
  state: any;
  displayOTP = false;
  smsOTP: any;
  displaySelections: any;
  selectionForm: any;
  mfaList: any;
  displayLogin: boolean = true;
  displayPhoneRegistration: boolean = false;
  displayPlayStoreInfo: boolean = false;
  displayQRCodeInfo: boolean = false;
  mfa_token: any;
  oobCode: any;
  oobChannel: any;
  authenticationType: any;
  enrolmentResponse: any;
  phoneForm: any;
  barCode: any;
  recoveryCode: any;
  changeString:any;
  backtoMfa!: boolean;
  listofAuthentications = [
    {
      authenticator_type: "oob",
      oob_channel: "auth0"
    },
    {
      authenticator_type: "oob",
      oob_channel: "sms"
    },
    // {
    //   authenticator_type: "oob",
    //   oob_channel: "email"
    // },
    {
      authenticator_type: "otp",
    },
    // {
    //   authenticator_type: "recovery-code",
    // },
  ];
  enrol: any;
  enrolForm: any;
  isModalOpen = false;
  dataTypeEnroll!: any;
  authListTypes:boolean = false;
  deviceName!: string;
  titleString!: string;
  verifyMFA: boolean = false;
  // @Input() view: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public loadingController: LoadingController,
    private auth: AuthenticationService,
    private cb: CapacitorBiometricService,
  ) { }


  ngOnInit() {

    this.getPlatformInformation = Capacitor.getPlatform();
    if (
      this.getPlatformInformation == 'android' ||
      this.getPlatformInformation == 'ios'
    ) {
      this.cb.checkCredential();
      this.hideBiometric = true;
      this.biometricChecked = this.cb.biometricChecked$;
    } else if (this.getPlatformInformation == 'web') {
      this.hideBiometric = false;
    }
    this.loginValues = new FormGroup({
      username: new FormControl(),
      password: new FormControl(),
      smsOPT: new FormControl(),
    });

    this.smsOTP = new FormGroup({
      smsOPT: new FormControl(),
    });

    this.selectionForm = new FormGroup({
      selection: new FormControl(),
    });

    this.enrolForm = new FormGroup({
      enrolOption: new FormControl(),
    });

    this.phoneForm = new FormGroup({
      phoneNumber: new FormControl(),
    });

    this.auth.mfa_subject$.subscribe((response: any) => {
      console.log("Response from mfa", response);
      if (response === true) {
        this.displayOTP = true;
        this.displayLogin = false;
        this.displaySelections = false;
      }
    })

    this.auth.mfaList$.subscribe((mfalist: any) => {
      console.log("Response from mfa list subject", mfalist);
      if (mfalist[0] == false) {
        this.displaySelections = true
        this.displayOTP = false;
        this.displayLogin = false;
        this.mfa_token = mfalist[3];
      } else if (mfalist[0] == true) {
        this.displaySelections = true;
        this.displayOTP = false;
        this.displayLogin = false;
        this.mfaList = mfalist[1];
        console.log(this.mfaList);
        this.mfa_token = mfalist[3];
        this.mfaList.filter((o2:any)=>{
         // console.log(o2.active == true && o2.oob_channel == 'auth0')
          if((o2.active == true && o2.oob_channel == 'auth0') || (o2.active == true && o2.authenticator_type == 'otp') && (o2.active == true && o2.oob_channel == 'sms')) {
            console.log(true);
            this.backtoMfa = true;
            this.displaySelections = false;
            this.authListTypes = true;
            this.titleString = "Login"
          } else if((o2.active != true && o2.oob_channel == 'auth0') || (o2.active != true && o2.authenticator_type == 'otp') && (o2.active != true && o2.oob_channel == 'sms')) {
            console.log(false);
            this.backtoMfa = false;
            this.titleString = "Secure Your Account"
            this.displaySelections = true;
            this.authListTypes = false;
          }
        })
        this.enrol = this.listofAuthentications.filter(function (o1) {
          return !mfalist[1].some((o2: any) => {
            return (o1.oob_channel === o2.oob_channel) && (o2!.active === true); // return the ones with equal id
          });
        });
        console.log(this.enrol);
      }
    })
  }

  ngAfterViewInit(): void {
    this.displayLogin = true;
    const inputs = document.querySelectorAll("input");

    inputs.forEach((input) => {
      input.addEventListener("blur", (event: any) => {
        if (event?.target?.value) {
          input.classList.add("is-valid");
        } else {
          input.classList.remove("is-valid");
        }
      });
    });
  }

  login(form: any) {
    if (
      this.getPlatformInformation == 'android' ||
      this.getPlatformInformation == 'ios'
    ) {
      if (this.biometricChecked == true) {
        this.cb.setCredential(form.value.username, form.value.password);
        this.cb.checkCredential();
      } else if (this.biometricChecked == false) {
        this.cb.deleteCredential();
        this.auth.loginWithPassword(form.value.username, form.value.password);
      }
    } else if (this.getPlatformInformation == 'web') {
      this.auth.loginWithPassword(form.value.username, form.value.password);
    }
  }

  submitSelection(authenticationType:any, authId: any, deviceName: any) {
    var selectionType = authenticationType;
    var selectionID = authId;
    this.authenticationType = selectionType;
    this.deviceName = deviceName;
    this.oobChannel = selectionID.split('|')[0];
    if (selectionType == 'recovery-code') {
      this.changeString = "Recovery Code"
      this.displayOTP = true;
      this.authListTypes = false;
    } else {
      this.auth.challengeMFA(selectionType, selectionID).subscribe((response: any) => {
        this.oobCode = response?.oob_code;
        if (this.oobChannel == 'push') {
          this.isModalOpen = false;
          this.verifyMFA = true;
          this.displayOTP = false;
          this.authListTypes = false;
          console.log(this.authenticationType, this.oobChannel, '', this.oobCode);
          this.auth.validateMFACode(this.authenticationType, this.oobChannel, '', this.oobCode)
            .pipe(
              retry(60), // you retry 3 times
              delay(1000) // each retry will start after 1 second,
            )
            .subscribe(res => {
              console.log("Success Push Notification", res);
              //this.router.navigateByUrl(this.route);
              window.location.href = window.location.origin + '/' + this.route;
              setTimeout(() => {
                this.displayOTP = false;
                this.displayLogin = true;
                this.displaySelections = false;
                this.displayPhoneRegistration = false;
                this.smsOTP.reset()
                this.loginValues.reset();
              }, 2500);

            }),
            (error: any) => {
              // console.log("Retrying Push Notification")
              console.log("Waiting for users action")
            }
        } else if(this.oobChannel == 'email'){
          this.changeString = "code recieved in the email"
          this.displayOTP = true;
          this.authListTypes = false;
        } else if(this.oobChannel == 'sms'){
          this.changeString = "code recieved on the phone" 
          this.displayOTP = true;
          this.authListTypes = false;
        } else if(this.authenticationType == 'otp'){
          this.changeString = "code from authenticator app (i.e Guardian)" 
          this.displayOTP = true;
          this.authListTypes = false;
        }
      },
        (error) => {
          console.log(error);
        });
    }



  }

  submitEnrolment(authenicator_type: any, obb_channel: any) {
    console.log(authenicator_type, obb_channel);
    this.authenticationType = authenicator_type;
    this.oobChannel = obb_channel;
    if (this.authenticationType == 'oob' && this.oobChannel == 'auth0' || this.authenticationType == 'otp' && this.oobChannel == undefined) {
      this.authenticationType === 'otp'?this.dataTypeEnroll = 'otp':this.dataTypeEnroll = 'push';
      this.displayOTP = false;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayQRCodeInfo = false;
      this.displayPhoneRegistration = false;
      this.displayPlayStoreInfo = true;
    } else if (this.authenticationType != 'oob' && this.oobChannel == '') { 
      this.dataTypeEnroll = this.authenticationType 
    } else if (this.authenticationType == 'oob' && this.oobChannel == 'sms') {
      this.dataTypeEnroll = 'sms',
      this.changeString = "OTP Code recieved on registered phone"
      this.displayOTP = false;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayPlayStoreInfo = false;
      this.displayQRCodeInfo = false;
      this.displayPhoneRegistration = true;
    }
  }

  submitOTP(mfa: any) {
    console.log(mfa.value.smsOPT);
    this.auth.validateMFACode(this.authenticationType, this.oobChannel, mfa.value.smsOPT, this.oobCode).subscribe((response: any) => {
      console.log("Response from validatemfa", response);
      // this.auth.getUserHistory().subscribe(response => {
      //   console.log("Devices Auth History",response);
      // })
      //this.router.navigateByUrl(this.route);
      window.location.href = window.location.origin + '/' + this.route;
      setTimeout(() => {
        this.displayOTP = false;
        this.displayLogin = true;
        this.displaySelections = false;
        this.authListTypes = false;
        this.smsOTP.reset()
        this.loginValues.reset();
      }, 2500);
    },
      error => {
        console.log("Invalid Token")
      })
  }


  submitPhone(phone: any) {
    console.log(phone.value.phoneNumber);
    this.auth.enrollMFA(this.oobChannel, '', phone.value.phoneNumber).subscribe((response: any) => {
      this.displayOTP = true;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayPhoneRegistration = false;
      this.oobCode = response?.oob_code;
    })
  }

  changeChecked(event: any) {
    this.biometricChecked = event.target.checked;
  }

  ContinueQR() {
    this.auth.enrollMFA(this.dataTypeEnroll, '', '').subscribe((response: any) => {
      console.log(response);
      this.enrolmentResponse = response;
      this.barCode = this.enrolmentResponse?.barcode_uri;
      this.recoveryCode = this.enrolmentResponse?.recovery_codes[0];
      this.oobCode = response?.oob_code;
      this.displayQRCodeInfo = true;
      this.displayOTP = false;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayPhoneRegistration = false;
      this.displayPlayStoreInfo = false;
    })


  }


  validatePushOTP() {
    console.log(this.dataTypeEnroll);
    if(this.dataTypeEnroll == 'push') {
    this.auth.validateMFACode(this.authenticationType, this.oobChannel, '', this.oobCode)
      .pipe(
        retry(120), // you retry 3 times
        delay(1000) // each retry will start after 1 second,
      )
      .subscribe((res: any) => {
        console.log("Success Push Notification", res);
        this.isModalOpen = false;
        //this.router.navigateByUrl(this.route);
        window.location.href = window.location.origin + '/' + this.route;
        setTimeout(() => {
          this.displayOTP = false;
          this.displayLogin = false;
          this.displaySelections = false;
          this.displayQRCodeInfo = false;
          this.displayPhoneRegistration = false;
          this.displayPlayStoreInfo = false;
          this.smsOTP.reset()
          this.loginValues.reset();
        }, 2500);

      }),
      (error: any) => {
        // console.log("Retrying Push Notification")
        console.log("Waiting for users action")
      }
    } else if (this.dataTypeEnroll == 'otp') {
      this.changeString = "OTP Code from authenicator app registered (i.e Auth0 guardian app)"
      this.displayOTP = true;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayQRCodeInfo = false;
      this.displayPhoneRegistration = false;
      this.displayPlayStoreInfo = false;
    }
  }
  ContinueOtherMethods() {
    if(this.backtoMfa == true) {
      this.displayQRCodeInfo = false;
      this.displayOTP = false;
      this.displayLogin = false;
      this.displaySelections = false;
      this.displayPhoneRegistration = false;
      this.authListTypes = true;
      this.displayPlayStoreInfo = false;
      this.verifyMFA = false;
    } else if (this.backtoMfa == false) {
      this.displayQRCodeInfo = false;
      this.displayOTP = false;
      this.displayLogin = false;
      this.displaySelections = true;
      this.displayPhoneRegistration = false;
      this.authListTypes = false;
      this.displayPlayStoreInfo = false;
      this.verifyMFA = false;
    }

  }
}
