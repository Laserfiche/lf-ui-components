import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LfAnalyticsService } from './lf-analytics.service';
import {
  UserFeedbackDialogData,
  UserFeedbackUserTrackingEvent,
} from './lf-user-feedback-types';
import { UserFeedbackDialogComponent } from './user-feedback-dialog/user-feedback-dialog.component';

@Component({
  selector: 'lf-user-feedback-component',
  template: `<button id="lf-user-feedback-button" [disabled]="disableFeedbackButton" (click)="handleDialogAsync()">
    {{ feedbackText }}
  </button>`,
  styleUrls: ['./lf-user-feedback.component.css'],
})
export class LfUserFeedbackComponent {
  @Input() hosting_module: string = '';
  @Input() hosting_context: string = '';
  @Input() user_id: string = '';
  @Input() account_id: string = '';

  /** @internal */
  feedbackText: string = 'Feedback'; // TODO: localize

  /** @internal */
  dialogRef: MatDialogRef<UserFeedbackDialogComponent> | undefined;

  /** @internal */
  constructor(
    /** @internal */
    public dialog: MatDialog,
    /** @internal */
    public analyticsService: LfAnalyticsService
  ) { }

  /** @internal */
  async handleDialogAsync(): Promise<void> {
    if (!this.dialogRef) {
      this.openDialog();
      await this.closeDialogAsync();
    }
  }

  /** @internal */
  async closeDialogAsync() {
    await this.dialogRef!.afterClosed().toPromise();
    this.dialogRef = undefined;
  }

  /** @internal */
  get disableFeedbackButton(): boolean {
    return !this.user_id || !this.account_id;
  }

  /** @internal */
  openDialog(): void {
    try {
      this.dialogRef = this.dialog.open(UserFeedbackDialogComponent, {
        width: '448px',
        data: {},
        panelClass: 'lf-user-feedback-panel',
        autoFocus: false,
        disableClose: true,
        backdropClass: 'lf-user-feedback-backdrop'
      });
      this.dialogRef.componentInstance.submitFeedback.subscribe(
        (result: UserFeedbackDialogData | undefined) => {
          if (result?.userFeedbackTrackingEventType) {
            const eventTrackingData: UserFeedbackUserTrackingEvent =
              this.createEventTrackingData(result);
            const trackSucceeded =
              this.analyticsService?.track(eventTrackingData);
            if (!trackSucceeded) {
              this.dialogRef?.componentInstance.setError();
            }
          }
        }
      );
    } catch (error: any) {
      console.error(`Could not open User Feedback dialog: ${error.message}`);
    }
  }

  /** @internal */
  private createEventTrackingData(
    dialogData: UserFeedbackDialogData
  ): UserFeedbackUserTrackingEvent {
    const data: UserFeedbackUserTrackingEvent = {
      userId: this.user_id,
      accountId: this.account_id,
      module: 'UserFeedback', // Do not change or localize
      eventName: dialogData.userFeedbackTrackingEventType,
      hosting_module: this.hosting_module ?? 'UserFeedback',
      hosting_context: this.hosting_context,
      is_willing_to_be_contacted: dialogData.canContact,
      message: dialogData.feedbackText,
    };
    return data;
  }
}
