import { TestBed } from '@angular/core/testing';

import { CapacitorBiometricService } from './capacitor-biometric.service';

describe('CapacitorBiometricService', () => {
  let service: CapacitorBiometricService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CapacitorBiometricService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
