import { redistributeProfile } from './tripProfileConstraint'

describe('redistributeProfile', () => {
  it('sets reliability to 80 and redistributes 20 equally across safety and speed', () => {
    const result = redistributeProfile('reliability', 80)
    expect(result.reliability).toBe(80)
    expect(result.safety).toBe(10)
    expect(result.speed).toBe(10)
  })

  it('sets safety to 60 and redistributes 40 equally across reliability and speed', () => {
    const result = redistributeProfile('safety', 60)
    expect(result.safety).toBe(60)
    expect(result.reliability).toBe(20)
    expect(result.speed).toBe(20)
  })

  it('sets speed to 100 and others to 0', () => {
    const result = redistributeProfile('speed', 100)
    expect(result.speed).toBe(100)
    expect(result.reliability).toBe(0)
    expect(result.safety).toBe(0)
  })

  it('sets reliability to 100 and others to 0', () => {
    const result = redistributeProfile('reliability', 100)
    expect(result.reliability).toBe(100)
    expect(result.safety).toBe(0)
    expect(result.speed).toBe(0)
  })

  it('sets safety to 100 and others to 0', () => {
    const result = redistributeProfile('safety', 100)
    expect(result.safety).toBe(100)
    expect(result.reliability).toBe(0)
    expect(result.speed).toBe(0)
  })

  it('sets reliability to 0 and redistributes 100 equally across safety and speed', () => {
    const result = redistributeProfile('reliability', 0)
    expect(result.reliability).toBe(0)
    expect(result.safety).toBe(50)
    expect(result.speed).toBe(50)
  })

  it('sets safety to 0 and redistributes 100 equally across reliability and speed', () => {
    const result = redistributeProfile('safety', 0)
    expect(result.safety).toBe(0)
    expect(result.reliability).toBe(50)
    expect(result.speed).toBe(50)
  })

  it('sets speed to 0 and redistributes 100 equally across reliability and safety', () => {
    const result = redistributeProfile('speed', 0)
    expect(result.speed).toBe(0)
    expect(result.reliability).toBe(50)
    expect(result.safety).toBe(50)
  })

  it('output always sums to 100 for various values', () => {
    const values = [0, 10, 33, 50, 67, 80, 100]
    const axes = ['reliability', 'safety', 'speed'] as const
    for (const axis of axes) {
      for (const value of values) {
        const result = redistributeProfile(axis, value)
        const sum = result.reliability + result.safety + result.speed
        expect(sum).toBe(100)
      }
    }
  })

  it('clamps dominant value to 0 minimum', () => {
    const result = redistributeProfile('reliability', -10)
    expect(result.reliability).toBe(0)
    const sum = result.reliability + result.safety + result.speed
    expect(sum).toBe(100)
  })

  it('clamps dominant value to 100 maximum', () => {
    const result = redistributeProfile('reliability', 110)
    expect(result.reliability).toBe(100)
    const sum = result.reliability + result.safety + result.speed
    expect(sum).toBe(100)
  })
})
