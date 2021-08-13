import { Component } from '@angular/core';
import { BackendService } from './shared/services/backend.service';

@Component({
  selector: 'qsort-root',
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  constructor(public backendService: BackendService) {
    
  }
  title = 'qsort';
}
