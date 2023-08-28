import { TestBed } from '@angular/core/testing';
import { LfAnalyticsService } from './lf-analytics.service';

describe('LfAnalyticsService', () => {
  let service: LfAnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LfAnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getBusinessIntelligenceInfo should return test env for test cdn url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://d3nunhg1m0ng5s.cloudfront.net/Site/laserfiche-ui-components/2.0.2/index.html#/');
    expect(biInfo?.environment).toEqual('test');
  });

  it('getBusinessIntelligenceInfo should return test env for cloudtest url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://accounts.cloudtest.laserfiche.com/WebSTS/Login?originalPathAndQuery=%2fWebSTS%2f%3fwa%3dwsignin1.0%26wtrealm%3dhttps%253a%252f%252fapp.cloudtest.laserfiche.com%252flaserfiche%252f%26wctx%3drm%253d1%2526id%253dpassive%2526ru%253d%25252flaserfiche%26wct%3d2021-07-19T21%253a37%253a41Z%26wreply%3dhttps%253a%252f%252fapp.cloudtest.laserfiche.com%252flaserfiche%252f');
    expect(biInfo?.environment).toEqual('test');
  });

  it('getBusinessIntelligenceInfo should return dev env for dev cdn url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://d28op2mbfuf5hv.cloudfront.net/Site/laserfiche-ui-components/beta/index.html#/');
    expect(biInfo?.environment).toEqual('development');
  });

  it('getBusinessIntelligenceInfo should return dev env for developers PC', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://watsonville.laserfiche.com/lf-cdn/index.html#/');
    expect(biInfo?.environment).toEqual('development');
  });

  it('getBusinessIntelligenceInfo should return dev env for localhost', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('http://localhost:4200/');
    expect(biInfo?.environment).toEqual('development');
  });

  it('getBusinessIntelligenceInfo should return dev env for clouddev url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://accounts.a.clouddev.laserfiche.com/WebSTS/Login?originalPathAndQuery=%2fWebSTS%2f%3fwa%3dwsignin1.0%26wtrealm%3dhttps%253a%252f%252fsignin.a.clouddev.laserfiche.com%252fCustomerPortal%252f%26wctx%3drm%253d1%2526id%253dpassive%2526ru%253d%25252fCustomerPortal%25252fAdministration%26wct%3d2021-07-14T21%253a18%253a01Z%26wreply%3dhttps%253a%252f%252fsignin.a.clouddev.laserfiche.com%252fCustomerPortal%252f%26iepolicyaware%3d1#/internal/customers');
    expect(biInfo?.environment).toEqual('development');
  });

  it('getBusinessIntelligenceInfo should return prod env for prod url us', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://app.laserfiche.com/documents/');
    expect(biInfo?.environment).toEqual('production');
  });

  it('getBusinessIntelligenceInfo should return prod env for prod url eu', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://accounts.eu.laserfiche.com/WebSTS/Login?originalPathAndQuery=%2fWebSTS%2f%3fwa%3dwsignin1.0%26wtrealm%3dhttps%253a%252f%252fsignin.eu.laserfiche.com%252fCustomerPortal%252f%26wctx%3drm%253d1%2526id%253dpassive%2526ru%253d%25252fCustomerPortal%25252fSignin%26wct%3d2022-02-14T20%253a02%253a16Z%26wreply%3dhttps%253a%252f%252fsignin.eu.laserfiche.com%252fCustomerPortal%252f%26iepolicyaware%3d1');
    expect(biInfo?.environment).toEqual('production');
  });

  it('getBusinessIntelligenceInfo should return prod env for prod url ca', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://signin.laserfiche.ca/CustomerPortal/Administration#/internal/customers');
    expect(biInfo?.environment).toEqual('production');
  });

  it('getBusinessIntelligenceInfo should return prod env for prod cdn url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://lfxstatic.com/Site/laserfiche-ui-components/2.0.2/index.html#/');
    expect(biInfo?.environment).toEqual('production');
  });

  it('getBusinessIntelligenceInfo should return production env for empower url', () => {
    const biInfo = service['getBusinessIntelligenceInfo']('https://app.clouddemo.laserfiche.com/home');
    expect(biInfo?.environment).toEqual('production');
  });

  it('isHostEmpower should return true for empower url', () => {
    const isEmpower = service['isHostEmpower']('https://app.clouddemo.laserfiche.com/home');
    expect(isEmpower).toBeTrue();
  });

  it('isHostEmpower should return false for not empower url', () => {
    const isEmpower = service['isHostEmpower']('https://lfxstatic.com/Site/laserfiche-ui-components/2.0.2/index.html#/');
    expect(isEmpower).toBeFalse();
  });
});
