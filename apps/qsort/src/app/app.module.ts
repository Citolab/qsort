import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SortGridComponent } from './sort-grid/sort-grid.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ArraySortPipe } from './shared/pipes/sort.pipe';
import { HomeComponent } from './home/home.component';
import { EnsureSessionGuard } from './shared/guards/ensure-session.guard';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { BackendService } from './shared/services/backend.service';
import { AngularFireModule } from '@angular/fire';
import { DoneComponent } from './done/done.component';
import { StatementCardComponent } from './shared/statement-card/statement-card.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ChartsModule } from 'ng2-charts';
import { CardStackComponent } from './card-stack-component/card-stack.component';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgxEventHandlerModule } from 'ngx-event-handler';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';

import "hammerjs";

@NgModule({
   declarations: [
      AppComponent,
      SortGridComponent,
      ArraySortPipe,
      HomeComponent,
      DashboardComponent,
      DoneComponent,
      StatementCardComponent,
      CardStackComponent
   ],
   imports: [
      ModalModule.forRoot(),
      BrowserModule,
      NgxEventHandlerModule,
      ChartsModule,
      FormsModule,
      AngularFireModule.initializeApp(environment.firebase),
      AngularFirestoreModule,
      AppRoutingModule,
      HammerModule,
      DragDropModule,
      BrowserAnimationsModule
   ],
   providers: [
      EnsureSessionGuard,
      BackendService
      // { provide: HAMMER_GESTURE_CONFIG, useClass: CustomHammerConfig}
   ],
   bootstrap: [
      AppComponent
   ]
})
export class AppModule { }
