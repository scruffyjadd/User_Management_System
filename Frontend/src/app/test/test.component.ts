import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  message = '';
  isSuccess = false;
  isLoading = false;

  constructor(public accountService: AccountService) {}

  ngOnInit() {
    // Check if user is logged in
    this.accountService.account.subscribe(account => {
      if (account) {
        this.message = `Logged in as ${account.email}`;
        this.isSuccess = true;
      }
    });
  }

  testPublicEndpoint() {
    this.isLoading = true;
    this.message = '';
    
    this.accountService.getAll().subscribe({
      next: (users) => {
        this.isSuccess = true;
        this.message = `Success! Retrieved ${users.length} users from the backend.`;
        this.isLoading = false;
      },
      error: (error) => {
        this.isSuccess = false;
        this.message = `Error: ${error.status} - ${error.statusText || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }

  testProtectedEndpoint() {
    if (!this.accountService.accountValue || !this.accountService.accountValue.id) {
      this.isSuccess = false;
      this.message = 'No user is currently logged in or user ID is missing';
      return;
    }
    
    this.isLoading = true;
    this.message = '';
    
    // Test getting current user's profile
    this.accountService.getById(String(this.accountService.accountValue.id)).subscribe({
      next: (user) => {
        this.isSuccess = true;
        this.message = `Success! Retrieved user profile for ${user.email}`;
        this.isLoading = false;
      },
      error: (error) => {
        this.isSuccess = false;
        this.message = `Error: ${error.status} - ${error.statusText || 'Unknown error'}`;
        this.isLoading = false;
      }
    });
  }
}
