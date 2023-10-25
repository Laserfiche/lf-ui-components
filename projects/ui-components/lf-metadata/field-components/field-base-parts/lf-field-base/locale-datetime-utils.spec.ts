// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { LocaleDatetimeUtils } from './locale-datetime-utils';

describe('LocaleDatetimeUtils', () => {

  it('should create an instance', () => {
    expect(new LocaleDatetimeUtils()).toBeTruthy();
  });

  it('should get en-gb date pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleDatePattern('en-gb')).toEqual('DD/MM/YYYY');
  });

  it('should get en-us date pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleDatePattern('en-us')).toEqual('MM/DD/YYYY');
  });

  it('should get en-gb time pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleTimePattern('en-gb')).toEqual('HH:mm:ss');
  });

  it('should get en-us time pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleTimePattern('en-us')).toEqual('HH:mm:ss');
  });

  it('should get en-gb datetime pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleDateTimePattern('en-gb')).toEqual('DD/MM/YYYY, HH:mm:ss');
  });

  it('should get en-us datetime pattern', () => {
    expect(LocaleDatetimeUtils.getLocaleDateTimePattern('en-us')).toEqual('MM/DD/YYYY, HH:mm:ss');
  });

});
