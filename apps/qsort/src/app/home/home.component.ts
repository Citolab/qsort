import { Component } from '@angular/core';
import { BackendService } from '../shared/services/backend.service';
import { Router } from '@angular/router';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';
import { environment } from '../../environments/environment';
@Component({
  selector: 'qsort-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation()
  ]
})
export class HomeComponent {
  name: string;
  enterName = environment.enterName;
  welcomeMessage = environment.welcomeMessage;
  constructor(private backendService: BackendService, private router: Router) { }

  nameChanged(name: string) {
    console.log(name);
    this.name = name;
    //this.name = (event.target as any).value;
  }

  start() {
    this.backendService.startSession(this.name).subscribe(session => {
      const firstItem = session && session.items.length > 0 ? session.items[0].id : null;
      this.router.navigate(['sort', firstItem]);
    });
  }

  log(value: any) {
    console.log(value);
  }
}
