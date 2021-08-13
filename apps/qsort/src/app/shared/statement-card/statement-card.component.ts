import { Component, Input, HostBinding } from '@angular/core';
import { StatementWithResponseAndImage } from '../model/model';


@Component({
  selector: 'qsort-statement-card',
  templateUrl: './statement-card.component.html',
  styleUrls: ['./statement-card.component.scss']
})
export class StatementCardComponent {
  @Input() titleOnly = false;
  @Input() statement: StatementWithResponseAndImage;

  @HostBinding('class.card') someField = true;
}
