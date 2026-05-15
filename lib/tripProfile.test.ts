import { isValidTripProfile } from './tripProfile'

describe('isValidTripProfile', () => {
  it('valid balanced profile passes', () => {
    expect(isValidTripProfile({ reliability: 34, safety: 33, speed: 33 })).toBe(true)
  })

  it('valid unequal profile summing to 100 passes', () => {
    expect(isValidTripProfile({ reliability: 80, safety: 10, speed: 10 })).toBe(true)
  })

  it('profile summing to less than 100 fails', () => {
    expect(isValidTripProfile({ reliability: 30, safety: 30, speed: 30 })).toBe(false)
  })

  it('profile summing to more than 100 fails', () => {
    expect(isValidTripProfile({ reliability: 50, safety: 50, speed: 50 })).toBe(false)
  })

  it('profile with negative values fails', () => {
    expect(isValidTripProfile({ reliability: -10, safety: 60, speed: 50 })).toBe(false)
  })
})
