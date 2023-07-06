import { _parseRefrenceToRowAndColumn, _parseRowAndColumnToReference } from '../index'

describe('ExpressionsParser', () => {
  describe('_parseRefrenceToRowAndColumn', () => {
    it('should return [0, 0] for input "A0"', () => {
      expect(_parseRefrenceToRowAndColumn('A0')).toEqual([0, 0])
    })

    it('should return [2, 0] for input "C0"', () => {
      expect(_parseRefrenceToRowAndColumn('C0')).toEqual([2, 0])
    })

    it('should return [25, 10] for input "Z10"', () => {
      expect(_parseRefrenceToRowAndColumn('Z10')).toEqual([25, 10])
    })

    it('should return [26, 0] for input "AA0"', () => {
      expect(_parseRefrenceToRowAndColumn('AA0')).toEqual([26, 0])
    })
  })

  describe('_parseRowAndColumnToReference', () => {
    it('should return "A0" for input "0-0"', () => {
      expect(_parseRowAndColumnToReference('0-0')).toBe('A0')
    })

    it('should return "C0" for input [0, 2]', () => {
      expect(_parseRowAndColumnToReference([0, 2])).toBe('C0')
    })

    it('should return "Z10" for input [10, 25]', () => {
      expect(_parseRowAndColumnToReference([10, 25])).toBe('Z10')
    })

    it('should return "AA0" for input [0, 26]', () => {
      expect(_parseRowAndColumnToReference([0, 26])).toBe('AA0')
    })

    it('should return "AZ0" for input [0, 51]', () => {
      expect(_parseRowAndColumnToReference([0, 51])).toBe('AZ0')
    })
  })
})
