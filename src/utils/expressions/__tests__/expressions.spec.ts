import { parseReferenceToRowAndColumn, parseRowAndColumnToReference } from '../index'

describe('ExpressionsParser', () => {
  describe('parseReferenceToRowAndColumn', () => {
    it('should return [0, 0] for input "A0"', () => {
      expect(parseReferenceToRowAndColumn('A0')).toEqual([0, 0])
    })

    it('should return [0, 2] for input "C0"', () => {
      expect(parseReferenceToRowAndColumn('C0')).toEqual([0, 2])
    })

    it('should return [10, 25] for input "Z10"', () => {
      expect(parseReferenceToRowAndColumn('Z10')).toEqual([10, 25])
    })

    it('should return [0, 26] for input "AA0"', () => {
      expect(parseReferenceToRowAndColumn('AA0')).toEqual([0, 26])
    })
  })

  describe('parseRowAndColumnToReference', () => {
    it('should return "A0" for input "0-0"', () => {
      expect(parseRowAndColumnToReference('0-0')).toBe('A0')
    })

    it('should return "C0" for input [0, 2]', () => {
      expect(parseRowAndColumnToReference([0, 2])).toBe('C0')
    })

    it('should return "Z10" for input [10, 25]', () => {
      expect(parseRowAndColumnToReference([10, 25])).toBe('Z10')
    })

    it('should return "AA0" for input [0, 26]', () => {
      expect(parseRowAndColumnToReference([0, 26])).toBe('AA0')
    })

    it('should return "AZ0" for input [0, 51]', () => {
      expect(parseRowAndColumnToReference([0, 51])).toBe('AZ0')
    })
  })
})
