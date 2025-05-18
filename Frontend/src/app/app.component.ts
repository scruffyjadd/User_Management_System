import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit {
    title = 'user-management-system';
    Role = Role;
    account$!: Observable<Account | null>;

    constructor(private accountService: AccountService) {
        // Initialize account from localStorage if available
        const storedAccount = localStorage.getItem('account');
        if (storedAccount) {
            try {
                const account = JSON.parse(storedAccount);
                // Use the login method to properly initialize the account
                this.accountService.login(account.email, account.password)
                    .subscribe({
                        next: () => {
                            console.log('Account restored from localStorage');
                        },
                        error: (error) => {
                            console.error('Error restoring account:', error);
                            localStorage.removeItem('account');
                            // Clear any existing token to prevent unauthorized token revocation attempts
                            this.accountService.logout();
                        }
                    });
            } catch (error) {
                console.error('Error parsing stored account:', error);
                localStorage.removeItem('account');
                // Clear any existing token to prevent unauthorized token revocation attempts
                this.accountService.logout();
            }
        }
    }

    ngOnInit() {
        this.account$ = this.accountService.account;
    }

    logout() {
        this.accountService.logout();
    }
}
