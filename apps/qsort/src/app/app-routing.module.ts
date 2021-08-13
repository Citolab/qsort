import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SortGridComponent } from './sort-grid/sort-grid.component';
import { HomeComponent } from './home/home.component';
import { EnsureSessionGuard } from './shared/guards/ensure-session.guard';
import { DoneComponent } from './done/done.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'sort/:id',
        component: SortGridComponent,
        canActivate: [EnsureSessionGuard]
    },
    {
        path: 'done',
        component: DoneComponent,
        canActivate: [EnsureSessionGuard]
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    }
]
@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
