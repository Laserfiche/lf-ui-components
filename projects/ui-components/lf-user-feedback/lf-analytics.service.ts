import { Injectable } from '@angular/core';
import { init } from './business-intelligence-analytics';
import { IUserTrackingEvent } from './lf-user-feedback-types';

/** @internal */
@Injectable({
  providedIn: 'root'
})
export class LfAnalyticsService {

  constructor() {
    const businessIntelligenceInfo = this.getBusinessIntelligenceInfo(window.origin);
    if (businessIntelligenceInfo) {
      init( businessIntelligenceInfo.environment);
    }
  }

  track(event: IUserTrackingEvent): boolean {
    try {
      const analytics = this.getAnalytics();
      if (analytics && event.accountId && event.module && event.userId) {
        console.log(`track ${event.eventName}`);
        const eventWithoutName: Partial<IUserTrackingEvent> = { ...event };
        delete eventWithoutName.eventName;
        analytics.track(event.eventName, eventWithoutName);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Analytics track error: ${error}`);
      return false;
    }
  }

  private getAnalytics(): any {
    const businessIntelligenceInfo = this.getBusinessIntelligenceInfo(window.origin);
    if (!businessIntelligenceInfo) {
      return undefined;
    } else {
      return (window as any).analytics;
    }
  }

  private getBusinessIntelligenceInfo(url: string): BusinessIntelligenceInfo | undefined {
    const _url = new URL(url.toLowerCase());
    if (_url.host.includes('cloudtest.') || _url.host.includes('d3nunhg1m0ng5s.')) {
      return { environment: 'test' };
    } else if (this.isNotProductionUrl(_url)) {
      return { environment: 'development' };
    } else {
      return { environment: 'production' };
    }
  }

  private isNotProductionUrl(_url: URL) {
    if (_url.host != 'app.laserfiche.com'
    && _url.host != 'signin.laserfiche.com'
    && _url.host != 'accounts.laserfiche.com'
    && _url.host != 'app.laserfiche.ca'
    && _url.host != 'signin.laserfiche.ca'
    && _url.host != 'accounts.laserfiche.ca'
    && _url.host != 'app.eu.laserfiche.com'
    && _url.host != 'signin.eu.laserfiche.com'
    && _url.host != 'accounts.eu.laserfiche.com'
    && _url.host != 'lfxstatic.com'
    ) {
      return true; // not production
    } else {
      return false; // production
    }
  }
}

export interface BusinessIntelligenceInfo {
  environment: string;
}
