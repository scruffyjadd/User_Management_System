import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from '../_services';
import { Account } from '../_models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.scss']
})
export class HomeComponent implements OnInit {
    account$!: Observable<Account | null>;
    recentActivities = [
      {
        description: 'Account created successfully',
        timestamp: new Date('2025-05-18T00:00:00'),
        iconClass: 'text-success'
      },
      {
        description: 'Password updated',
        timestamp: new Date('2025-05-17T15:30:00'),
        iconClass: 'text-info'
      },
      {
        description: 'Profile information updated',
        timestamp: new Date('2025-05-17T14:45:00'),
        iconClass: 'text-primary'
      },
      {
        description: 'Account verified',
        timestamp: new Date('2025-05-17T14:30:00'),
        iconClass: 'text-success'
      }
    ];

    constructor(private accountService: AccountService, private router: Router) { }

    ngOnInit() {
        this.account$ = this.accountService.account;
    }
}
