import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LfToastMessageComponent, LfMessageToastTypes, LfToastMessage } from './lf-toast-message.component';

describe('LfToastMessageComponent', () => {
  let component: LfToastMessageComponent;
  let fixture: ComponentFixture<LfToastMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LfToastMessageComponent]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LfToastMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add message to the messages array when passed in', () => {
    const message: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Error,
      timeToShow: 100,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [message];
    expect(component.allMessages.length).toBe(1);
  });

  it('should add multiple messages to the messages array when passed in', () => {
    const message: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Error,
      timeToShow: 100,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [message, message, message];
    expect(component.allMessages.length).toBe(3);
  });

  it('should remove validation and informational after the alloted time', (done) => {
    const timeToShow = 100;
    const validationMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Validation,
      timeToShow: timeToShow,
      noIcon: false,
      hideMessage: false,
    };
    const informationalMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Informational,
      timeToShow: timeToShow,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [validationMessage, informationalMessage];
    window.setTimeout(() => {
      expect(component.allMessages.length).toBe(0);
      done();
    }, timeToShow + 100);
    return;
  });

  it('should not remove error or warning messages after alloted time', (done) => {
    const timeToShow = 100;
    const errorMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Error,
      timeToShow: timeToShow,
      noIcon: false,
      hideMessage: false,
    };

    const warningMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Warning,
      timeToShow: timeToShow,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [errorMessage, warningMessage];
    window.setTimeout(() => {
      expect(component.allMessages.length).toBe(2);
      done();
    }, timeToShow + 100);
    return;
  });

  it('should remove all messages when clearToasts is called', () => {
    const message: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Error,
      timeToShow: 100,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [message, message, message, message];
    expect(component.allMessages.length).toBe(4);
    component.clearToasts();
    expect(component.allMessages.length).toBe(0);
  });

  it('should only clear the messages of toastFilter type when clearToasts is called', () => {
    const errorMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Error,
      timeToShow: 100,
      noIcon: false,
      hideMessage: false,
    };
    const validMessage: LfToastMessage = {
      message: 'Test',
      type: LfMessageToastTypes.Validation,
      timeToShow: 100,
      noIcon: false,
      hideMessage: false,
    };
    component.messages = [errorMessage, validMessage, validMessage, validMessage];
    expect(component.allMessages.filter(message => message.type === LfMessageToastTypes.Error).length).toBe(1);
    expect(component.allMessages.filter(message => message.type === LfMessageToastTypes.Validation).length).toBe(3);
    component.clearToasts(LfMessageToastTypes.Validation);
    expect(component.allMessages.length).toBe(1);
    expect(component.allMessages[0].type).toBe(LfMessageToastTypes.Error);
  });
});
