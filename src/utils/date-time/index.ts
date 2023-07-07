export function getTimeDifferenceInMilliseconds(futureTimestamp: string): number {
  const futureTime = Date.parse(futureTimestamp)
  const currentTime = Date.now()
  return Math.max(futureTime - currentTime, 0)
}
