import { getTimeDifferenceInMilliseconds } from '../index'

describe('getTimeDifferenceInMilliseconds', () => {
  it('should return 0 for the current timestamp', () => {
    const currentTimestamp = new Date().toISOString()
    const result = getTimeDifferenceInMilliseconds(currentTimestamp)
    expect(result).toBe(0)
  })

  it('should return the correct time difference for a future timestamp', () => {
    const futureTimestamp = '2023-07-07T12:34:56Z'
    const futureTime = Date.parse(futureTimestamp)
    const currentTime = Date.now()
    const expectedDifference = Math.max(futureTime - currentTime, 0)
    const result = getTimeDifferenceInMilliseconds(futureTimestamp)
    expect(result).toBe(expectedDifference)
  })

  it('should return 0 for a past timestamp', () => {
    const pastTimestamp = '2021-01-01T00:00:00Z'
    const result = getTimeDifferenceInMilliseconds(pastTimestamp)
    expect(result).toBe(0)
  })
})
