import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BackendService } from '../services/backend.service';

@Injectable()
export class EnsureSessionGuard implements CanActivate {
  constructor(private backendService: BackendService, private router: Router) { }

  canActivate(): Observable<boolean> {
    return this.backendService.getCurrentSession().pipe(map(session => {
      if (!session) {
        console.log('no session found');
        this.router.navigate(['']);
      }
      return !!session;
    }));
  }
}
