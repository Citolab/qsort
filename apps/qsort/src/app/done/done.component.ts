import { Component } from '@angular/core';
import { baseUrl } from '../shared/utils';
import { environment } from '../../environments/environment';

@Component({
  selector: 'qsort-done',
  templateUrl: './done.component.html',
  styleUrls: ['./done.component.scss']
})
export class DoneComponent {
  // loading = true;
  showResult = environment.showResult;
  resultTable: { title: string, value: string}[] = [];
  contextsWithScore: { title: string, average: number }[];

  restart() {
    window.location.href = baseUrl(window.location.href);
  }

}
