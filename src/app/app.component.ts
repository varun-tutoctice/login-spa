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

  mappingView: any = [
    {name: 'login', component: LoginComponent},
    {name: 'settings', component: SettingsComponent}
  ]

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    //this.view = 'login';
  }

  ngAfterViewInit(): void {
    let viewData = this.mappingView.find((data: { name: string }) => data.name === this.view);
    const factory = this.componentFactoryResolver.resolveComponentFactory(viewData.component);
    const ref = this.myRef.createComponent(factory);
    ref.instance.data = this.data;
    ref.changeDetectionRef.detectChanges();
  }
 
}
