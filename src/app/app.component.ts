import { AfterViewInit, Component,ComponentFactoryResolver, Input, OnInit, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'login-spa';
  @ViewChild('dynamicComponent', {read: ViewContainerRef}) myRef!: any;
  @Input() view!: any;
  @Input() data!: any;
  @Input() route: any;
  ref: any;

  mappingView: any = [
    {name: 'login', component: LoginComponent},
    {name: 'settings', component: SettingsComponent}
  ]

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.view = 'login';
    let viewData = this.mappingView.find((data: { name: string }) => data.name === this.view);
    const factory = this.componentFactoryResolver.resolveComponentFactory(viewData.component);
    this.ngOnDestroy();
    this.ref = this.myRef.createComponent(factory);
    this.ref.changeDetectionRef?.detectChanges();
    this.ref.instance.route = this.route;
    // ref.instance.view = "View View";

  }

  ngOnDestroy(): void {
    if (this.ref) {
      this.ref.changeDetectorRef?.detach();
    }
  }
 
}
