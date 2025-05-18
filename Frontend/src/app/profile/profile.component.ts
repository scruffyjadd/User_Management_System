import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AccountService, AlertService } from '../_services';
import { MustMatch } from '../_helpers';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.component.html',
  styleUrls: ['profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm!: UntypedFormGroup;
  passwordForm!: UntypedFormGroup;
  loading = false;
  submitted = false;
  settings = {
    emailNotifications: false,
    darkMode: false,
    twoFactorAuth: false
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private accountService: AccountService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    // Initialize forms
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: MustMatch('newPassword', 'confirmPassword')
    });

    // Subscribe to account changes
    this.accountService.account.subscribe(account => {
      if (account) {
        this.profileForm.patchValue({
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email
        });
      }
    });
  }

  // Update profile
  updateProfile() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.profileForm.invalid) {
      return;
    }

    this.loading = true;
    this.alertService.clear();

    const currentAccount = this.accountService.currentAccount;
    if (!currentAccount) {
      this.alertService.error('Account not found');
      return;
    }

    this.accountService.update(currentAccount.id as string, this.profileForm.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Profile updated successfully');
          this.loading = false;
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  // Change password
  changePassword() {
    this.submitted = true;

    // Stop here if form is invalid
    if (this.passwordForm.invalid) {
      return;
    }

    this.loading = true;
    this.alertService.clear();

    this.accountService.changePassword(
      this.passwordForm.value.currentPassword,
      this.passwordForm.value.newPassword,
      this.passwordForm.value.confirmPassword
    )
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Password changed successfully');
          this.loading = false;
        },
        error: error => {
          this.alertService.error(error);
          this.loading = false;
        }
      });
  }

  // Update settings
  updateSettings(setting: keyof typeof this.settings, value: boolean) {
    this.settings[setting] = value;
    this.accountService.updateSettings(this.settings)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Settings updated successfully');
        },
        error: error => {
          this.alertService.error(error);
        }
      });
  }

  // Get avatar URL
  getAvatarUrl(): string {
    const account = this.accountService.currentAccount;
    return account?.avatarUrl || 'assets/default-avatar.png';
  }
}
