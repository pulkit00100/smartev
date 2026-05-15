import { createTripProfileStore } from './tripProfileStore'

const BALANCED = { reliability: 34, safety: 33, speed: 33 }

describe('TripProfileStore', () => {
  it('initialises defaultProfile as balanced', () => {
    const store = createTripProfileStore()
    expect(store.defaultProfile).toEqual(BALANCED)
  })

  it('activeProfile equals defaultProfile when no override is set', () => {
    const store = createTripProfileStore()
    expect(store.activeProfile).toEqual(store.defaultProfile)
  })

  it('setOverride changes activeProfile without changing defaultProfile', () => {
    const store = createTripProfileStore()
    const override = { reliability: 80, safety: 10, speed: 10 }
    store.setOverride(override)
    expect(store.activeProfile).toEqual(override)
    expect(store.defaultProfile).toEqual(BALANCED)
  })

  it('resetOverride restores activeProfile to defaultProfile', () => {
    const store = createTripProfileStore()
    store.setOverride({ reliability: 80, safety: 10, speed: 10 })
    store.resetOverride()
    expect(store.activeProfile).toEqual(store.defaultProfile)
  })

  it('setDefault updates defaultProfile and activeProfile when no override is active', () => {
    const store = createTripProfileStore()
    const newDefault = { reliability: 50, safety: 30, speed: 20 }
    store.setDefault(newDefault)
    expect(store.defaultProfile).toEqual(newDefault)
    expect(store.activeProfile).toEqual(newDefault)
  })

  it('setDefault updates defaultProfile but not activeProfile when override is active', () => {
    const store = createTripProfileStore()
    const override = { reliability: 80, safety: 10, speed: 10 }
    store.setOverride(override)
    store.setDefault({ reliability: 50, safety: 30, speed: 20 })
    expect(store.activeProfile).toEqual(override)
  })
})
