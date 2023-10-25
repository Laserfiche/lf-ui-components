// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

/** @internal */
export enum UserFeedbackTrackingEventType {
  Feedback = 'Feedback',
  Suggestion = 'Suggestion',
}

/** @internal */
export interface UserFeedbackDialogData {
  userFeedbackTrackingEventType: UserFeedbackTrackingEventType;
  feedbackText: string;
  canContact: boolean;
  feedbackImageBase64?: string;
}

/**
 * @internal
 * Contains required and custom properties to be tracked.
 * Custom properties are snake_case because camelCase and PascalCase are not respected when sending to tracking service
 */

export interface IUserTrackingEvent {
  /**
   * required property by Product Intelligence
   */
  eventName: UserFeedbackTrackingEventType;
  /**
   * required property by Product Intelligence
   */
  module: string;
  /**
   * required property by Product Intelligence
   */
  accountId: string;
  /**
   * required property by Product Intelligence
   */
  userId: string;
}

/** @internal */
export interface UserFeedbackUserTrackingEvent extends IUserTrackingEvent {
  hosting_module: string;
  hosting_context: string;
  is_willing_to_be_contacted: boolean;
  message: string;
  email_address: string;
  image?: string;
  attachment_entry_id: string;
}
