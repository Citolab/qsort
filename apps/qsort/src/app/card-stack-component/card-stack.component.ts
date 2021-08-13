import { Component, Input, ViewChildren, QueryList, ElementRef, EventEmitter, Output, Renderer2, AfterViewInit } from '@angular/core';
import { StatementWithResponseAndImage } from '../shared/model/model';

@Component({
  selector: 'qsort-card-stack',
  templateUrl: 'card-stack.component.html',
  styleUrls: ['card-stack.component.scss'],
})
export class CardStackComponent implements AfterViewInit{

  @Input() cards: Array<StatementWithResponseAndImage>;
  @ViewChildren('card') stackCards: QueryList<ElementRef>;
  cardArray: Array<ElementRef>;

  @Output() choiceMade = new EventEmitter<{choice: 'left' | 'right', statement: StatementWithResponseAndImage}>();
  @Output() currentCardChanged = new EventEmitter<string>();

  moveOutWidth: number;
  shiftRequired: boolean;
  heartVisible: boolean;
  crossVisible: boolean;

  constructor(private renderer: Renderer2) {
  }

  
  ngAfterViewInit() {
    this.moveOutWidth = document.documentElement.clientWidth * 1.5;
    this.cardArray = this.stackCards.toArray();
    this.stackCards.changes.subscribe(() => {
      this.cardArray = this.stackCards.toArray();
    });
  };

  userClickedButton(event: Event, side: 'left' | 'right') {
    event.preventDefault();
    if (!this.cards.length) return false;
    this.renderer.setStyle(this.cardArray[0].nativeElement, 
      'transform', `translate(${this.moveOutWidth}px, -100px) rotate(${side === 'left' ? '-' : ''}30deg)`);
    this.toggleChoiceIndicator(false, true);
    this.emitChoice(side, this.cards[0]);
    this.shiftRequired = true;
    return true;
  };

  handlePan(event: any) {
    if (event.deltaX === 0 || (event.center.x === 0 && event.center.y === 0) || !this.cards.length) return;
    this.renderer.addClass(this.cardArray[0].nativeElement, 'moving');

    if (event.deltaX > 0) { this.toggleChoiceIndicator(false, true) }
    if (event.deltaX < 0) { this.toggleChoiceIndicator(true, false) }

    const xMulti = event.deltaX * 0.03;
    const yMulti = event.deltaY / 80;
    const rotate = xMulti * yMulti;

    this.renderer.setStyle(this.cardArray[0].nativeElement, 'transform', 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)');

    this.shiftRequired = true;

  };

  handlePanEnd(event: any) {

    this.toggleChoiceIndicator(false, false);

    if (!this.cards.length) return;

    this.renderer.removeClass(this.cardArray[0].nativeElement, 'moving');

    const keep = Math.abs(event.deltaX) < 80; //  || Math.abs(event.velocityX) < 0.5;
    if (keep) {

      this.renderer.setStyle(this.cardArray[0].nativeElement, 'transform', '');
      this.shiftRequired = false;

    } else {

      const endX = Math.max(Math.abs(event.velocityX) * this.moveOutWidth, this.moveOutWidth);
      const toX = event.deltaX > 0 ? endX : -endX;
      const endY = Math.abs(event.velocityY) * this.moveOutWidth;
      const toY = event.deltaY > 0 ? endY : -endY;
      const xMulti = event.deltaX * 0.03;
      const yMulti = event.deltaY / 80;
      const rotate = xMulti * yMulti;

      this.renderer.setStyle(this.cardArray[0].nativeElement, 'transform', 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)');

      this.shiftRequired = true;

      this.emitChoice((event.deltaX > 0) ? 'right' : 'left', this.cards[0]);
    }
  };

  toggleChoiceIndicator(cross: boolean, heart: boolean) {
    this.crossVisible = cross;
    this.heartVisible = heart;
  };

  emitChoice(choice: 'left' | 'right', statement: StatementWithResponseAndImage) {
    this.cards.shift();
    this.choiceMade.emit({
      choice,
      statement
    });
    if (this.cards.length > 0) {
      this.currentCardChanged.emit(this.cards[0].id);
    }

  };


}