import { Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, NgZone, ViewChildren, QueryList, ViewChild, AfterViewInit } from '@angular/core';
import { CdkDragDrop, transferArrayItem, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { flatten } from '@angular/compiler';
import { StatementWithResponseAndImage, ItemWithImageAndResponses, DragglebleStatementListWithValue } from '../shared/model/model';
import { BackendService } from '../shared/services/backend.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { getUnique } from '../shared/utils';

import {
  fadeInOnEnterAnimation, fadeOutOnLeaveAnimation, slideInDownOnEnterAnimation,
  slideInDownAnimation, fadeInDownOnEnterAnimation
} from 'angular-animations';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { environment } from '../../environments/environment';


@Component({
  selector: 'qsort-sort-grid',
  templateUrl: './sort-grid.component.html',
  styleUrls: ['./sort-grid.component.scss'],
  animations: [
    slideInDownAnimation(),
    slideInDownOnEnterAnimation(),
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation(),
    fadeInDownOnEnterAnimation(),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SortGridComponent implements OnDestroy, AfterViewInit {
  state: 'stack' | 'sort' | 'done' = 'stack';
  selectedStatement: StatementWithResponseAndImage;
  private afterviewInit = false;
  gridTiles: Array<Array<DragglebleStatementListWithValue>> = [];
  draggableStatements: Array<DragglebleStatementListWithValue>;
  allDropLists: string[] = []
  cat = '';
  targetId: string;
  target: StatementWithResponseAndImage;
  draggedId: string;
  routeSubscription: Subscription;
  categories = environment.categories;
  statementsLists = new Map<string, StatementWithResponseAndImage[]>();
  statements: StatementWithResponseAndImage[];
  currentItem: ItemWithImageAndResponses;
  currentPiramid: { order: number[], neutral: number } = null;
  randomRotation1: number[] = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));
  randomRotation2: number[] = Array.from({ length: 4 }, () => Math.floor(Math.random() * 4));

  leftCount = 0;
  rightCount = 0;

  left = environment.left;
  right = environment.right;
  sortQuestion = environment.sortQuestion;
  categoryExplanation = environment.categoryExplanation;
  leftExplanation = environment.leftExplanation;
  rightExplanation = environment.rightExplanation;
  showDefaultImage = environment.showDefaultImage;

  @ViewChild('template1', { static: false }) template1: any;
  @ViewChild('template2', { static: false }) template2: any;

  modalRef1: BsModalRef;
  public modalRef1Clicked = false;
  modalRef2: BsModalRef;
  public modalRef2Clicked = false;

  @ViewChildren(CdkDropList) dropLists: QueryList<any>;

  public piramidcolors = ['#F626F0', '#F535CA', '#F55AA5', '#F55AA5', '#F5A25D', '#F5C737', '#F5EC33']

  private piramid = [
    { order: [1, 1, 2, 2, 3, 3, 4], neutral: 7 },
    { order: [1, 1, 2, 3, 4, 4, 1], neutral: 6 },
    { order: [1, 2, 3, 4, 4, 1, 1], neutral: 5 },
    { order: [1, 1, 3, 4, 4, 2, 1], neutral: 5 },
    { order: [1, 1, 2, 4, 4, 2, 2], neutral: 5 },
    { order: [1, 1, 2, 3, 4, 3, 2], neutral: 5 },
    { order: [1, 2, 3, 4, 3, 2, 1], neutral: 4 },
    { order: [1, 2, 3, 3, 4, 2, 1], neutral: 4 },
    // { order: [1, 2, 2, 3, 4, 3, 1], neutral: 4 },
    { order: [1, 3, 4, 3, 2, 2, 1], neutral: -1 },
    { order: [1, 2, 4, 3, 3, 2, 1], neutral: 3 },
    { order: [1, 2, 3, 4, 3, 2, 1], neutral: 3 },
    { order: [2, 3, 4, 3, 2, 1, 1], neutral: 2 },
    { order: [2, 2, 4, 4, 2, 1, 1], neutral: 2 },
    { order: [1, 2, 4, 4, 3, 1, 1], neutral: 2 },
    { order: [1, 1, 4, 4, 3, 2, 1], neutral: 2 },
    { order: [1, 4, 4, 3, 2, 1, 1], neutral: 1 },
    { order: [4, 3, 3, 2, 2, 1, 1], neutral: 0 }
  ]
  currentStatement: StatementWithResponseAndImage;
  processDropping = false;

  constructor(
    private modalService: BsModalService,
    private backendService: BackendService,
    route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private _ngZone: NgZone) {
    this.routeSubscription = route.params.pipe(mergeMap(() => {
      return this.backendService.getCurrentItem();
    })).subscribe(item => {
      this.currentItem = item;
      this.statements = item.statements.filter(i => !i.category);
      this.currentStatement = this.statements.length > 0 ? this.statements[0] : null;
      this.categories.forEach((category: string) => {
        const lowerCategory = category;
        this.statementsLists.set(lowerCategory, item.statements.filter(i => i.category === category && !i.value)); // !value matches value === 0 true
      });
      this.setStateAndInitPiramid();
      this.changeDetectorRef.markForCheck();
    });
  }


  ngAfterViewInit(): void {
    this.showTemplate(this.state);
    this.afterviewInit = true;
  }

  showTemplate(state: 'stack' | 'sort' | 'done') {
    if (state === 'stack') {
      if (!this.hasCategorized()) {
        this.modalRef1 = this.modalService.show(this.template1);
        this.modalService.onHide.pipe(take(1)).subscribe(() => {
          this.modalRef1Clicked = true;
          this.changeDetectorRef.markForCheck();
        });
      }

    } else if (state === 'sort') {
      if (!this.hasPlaceInPyramid()) {
        this.modalRef2 = this.modalService.show(this.template2);
        this.modalService.onHide.pipe(take(1)).subscribe(()  => {
          this.modalRef2Clicked = true;
          this.changeDetectorRef.markForCheck();
        });
      }
    }
  }

  private hasPlaceInPyramid() {
    return this.gridTiles.find(g => !!g.find(t => t.statements.length > 0));
  }

  private hasCategorized() {
    return (Array.from(this.statementsLists.values()) as Array<Array<any>>).find(a => a.length > 0);
  }

  private setStateAndInitPiramid() {
    const newState = this.determineState();
    if (newState !== this.state) {
      if (newState === 'sort' || (newState === 'done' && this.state !== 'sort')) {
        this.leftCount = this.currentItem.statements.filter(i => i.category === this.categories[0]).length;
        this.rightCount = this.currentItem.statements.filter(i => i.category === this.categories[1]).length;
        if (this.afterviewInit) {
          this.showTemplate(newState);
        }
        this.currentPiramid = environment.differSortLayout ?
          this.piramid[this.currentItem.statements.filter(s => s.category === this.categories[this.categories.length - 1]).length] :
          { order: [1, 2, 3, 4, 3, 2, 1], neutral: -1 };
        for (let rowIndex = 0; rowIndex < this.currentPiramid.order.length; rowIndex++) {
          this.gridTiles[rowIndex] = new Array(this.currentPiramid.order[rowIndex]);
          for (let index = 0; index < this.gridTiles[rowIndex].length; index++) {
            const id = `${rowIndex}_${index}`;
            this.gridTiles[rowIndex][index] = { id, statements: this.currentItem.statements.filter(s => s.value === id), category: '', value: id };
          }
        }
        this.allDropLists = flatten(this.gridTiles.map(gt => gt.map(s => s.id)));
      }
      this.state = newState;
    }

  }

  private determineState() {
    return this.statements.length > 0 ? 'stack' :
      this.currentItem.statements.find(s => !s.value) ? 'sort' : 'done';

  }


  dropStack(event: CdkDragDrop<string[]>, categories: string[]) {
    moveItemInArray(this.statementsLists.get(categories[0]), event.previousIndex, event.currentIndex);
  }

  dropListEmptyPredicate(categories: string[]) {
    return function (drag: CdkDrag, drop: CdkDropList) {
      const isEmpty = (drop.data.length === 0);
      const isFromStack = (drag.dropContainer.id as string) === categories[0] ||
        (drag.dropContainer.id as string) === categories[1];
      return !(isFromStack && !isEmpty);
    };
  }

  getCardContainerWidth(category: string) {
    const minimalsize = 24;
    if (this.state === 'sort') {
      const totalVw = 90;

      const statementcount = 16;
      if (this.categories.indexOf(category) === 0) {
        // left
        return minimalsize + (((totalVw - (2 * minimalsize)) / statementcount) * this.leftCount);
      } else {
        //right
        return  minimalsize + (((totalVw - (2 * minimalsize)) / statementcount) * this.rightCount);
      }
    }
    return minimalsize;
  }

  getCardLeftPostion(i: number, category: string) {
    //return 0;
    //this.categories.indexOf(category) === 0
    if (this.state === 'sort') {
      const containerLenght = this.getCardContainerWidth(category);
      const statementWidth = 24;
      const overlappingSpace = containerLenght - statementWidth;
      const cardCount =  this.categories.indexOf(category) === 0 ? this.leftCount : this.rightCount;

      const leftStep = overlappingSpace / (cardCount - 1);
      return i * leftStep;
    }
    return 0;
  }
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  statementSelected(statement: StatementWithResponseAndImage) {
    this.selectedStatement = statement;
  }
  choiceMade($event: { choice: 'left' | 'right', statement: StatementWithResponseAndImage }) {
    if ($event.choice === 'right') {
      this.statementsLists.get(this.categories[1]).push($event.statement);
    } else {
      this.statementsLists.get(this.categories[0]).push($event.statement);
    }

    this.store();
  }

  currentCardChanged(statementId: string) {
    this.currentStatement = this.currentItem.statements.find(s => s.id === statementId);
  }
  getRandomRotation1(i: number) {
    let randomRotation = 'rotate(0deg)'; // + ' ' + 'translateY(' + i*10 + 'px)';
    if (this.statements.length > 0) {
      randomRotation = 'rotate(' + (3 - this.randomRotation1[i] * 6) + 'deg)';
    }
    return randomRotation;
  }

  getRandomRotation2(i: number) {
    let randomRotation = 'rotate(0deg)'; // + ' ' + 'translateY(' + i*10 + 'px)';
    if (this.statements.length > 0) {
      randomRotation = 'rotate(' + (3 - this.randomRotation2[i] * 6) + 'deg)';
    }
    return randomRotation;
  }

  async dropSort(e: any) {
    const event = e as  CdkDragDrop<string[]>
    this.draggedId = null;
    this.targetId = null;
    if (event.previousContainer && event.container) {
      transferArrayItem(event.previousContainer.data, event.container.data,
        event.previousIndex, 1);
      if (event.container.data && event.container.data.length == 2) {
        // debugger;
        const dropOfSwappedElement = event.previousContainer.element.nativeElement as HTMLElement;
        const SwapElement = event.container.element.nativeElement.children[0] as HTMLElement;

        const dropOfSwappedElementRect = dropOfSwappedElement.getBoundingClientRect();
        const SwapElementRect = SwapElement.getBoundingClientRect();

        console.log(SwapElement.getBoundingClientRect());
        console.log(dropOfSwappedElementRect);

        this.processDropping = true;
        this.changeDetectorRef.detectChanges();
        SwapElement.style.position = 'absolute';
        SwapElement.classList.add('cdk-drag-animating');
        SwapElement.style.transform = getTransform(dropOfSwappedElementRect.left - SwapElementRect.left, dropOfSwappedElementRect.top - SwapElementRect.top);

        await this._ngZone.runOutsideAngular(() => {
          return new Promise(resolve => {
            const handler = ((event: TransitionEvent) => {
              if (!event || (event.target === SwapElement && event.propertyName === 'transform')) {
                SwapElement.removeEventListener('transitionend', handler);
                clearTimeout(timeout);
                resolve(true);
              }
            }) as EventListenerOrEventListenerObject;

            // If a transition is short enough, the browser might not fire the `transitionend` event.
            // Since we know how long it's supposed to take, add a timeout with a 50% buffer that'll
            // fire if the transition hasn't completed when it was supposed to.
            const timeout = setTimeout(handler as any, 500 * 1.5);
            SwapElement.addEventListener('transitionend', handler);
          });
        });

        SwapElement.style.position = 'auto';
        SwapElement.classList.remove('cdk-drag-animating');
        transferArrayItem(event.container.data, event.previousContainer.data, 0, 0);
      }
      this.store();
      this.processDropping = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  store() {
    if (this.state === 'stack') {
      this.categories.forEach(category => {
        this.statementsLists.get(category).forEach(statementInCategory => {
          this.currentItem.statements.filter(statement => statement.id === statementInCategory.id).forEach(
            statement => {

              statement.category = category;
            }
          )
        })
      });
      // const categorizedStatements = flatten([...this.statementsLists.values()]);
      // this.statements = this.statements.filter(s => !categorizedStatements.find(c => c.id === s.id));
    } else {
      const sortedStatements: StatementWithResponseAndImage[] = getUnique(flatten(flatten(this.gridTiles.map(rowTile =>
        rowTile.map(tile => tile.statements.map(statement => {
          return { ...statement, value: tile.value };
        }))))));
      this.currentItem.statements.forEach(statement => {
        const sortedStatement = sortedStatements.find(sortedStatement => sortedStatement.id === statement.id);
        statement.value = sortedStatement ? sortedStatement.value : null
      })
    }
    this.backendService.storeItem(this.currentItem);
    this.setStateAndInitPiramid();
  }

}

function getTransform(x: number, y: number): string {
  // Round the transforms since some browsers will
  // blur the elements for sub-pixel transforms.
  return `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}