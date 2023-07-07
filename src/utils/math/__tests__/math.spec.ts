import { SpreadSheetType } from '@/types'
import { MathParser } from '../index'
import { MATH_ERRORS } from '../errors'

describe('MathParser', () => {
  describe('sanatizeExpression', () => {
    it('Should sanatize an expression', () => {
      const expression = '2 + 3 * 4'
      const result = MathParser.sanatizeExpression(expression)
      expect(result).toBe('2+3*4')
    })
  })

  describe('validateExpression', () => {
    it('Should return an empty string for a valid expression', () => {
      const expression = '2+3*4'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('')
    })

    it('Should not accept non-alphanumeric', () => {
      const expression = '2+_'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe(MATH_ERRORS.INVALID_NON_ALPHANUMERIC_CHARACTER)
    })

    it('Should not accept consecutive operators', () => {
      const expression = '2++3'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe(MATH_ERRORS.CONSECUTIVE_OPERATORS)
    })

    it('Should not accept floating point after an alphabetic letter', () => {
      const expression = 'A.5+3'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe(MATH_ERRORS.INVALID_REFERENCE('A'))
    })
  })

  describe('parseExpression', () => {
    it('Should parse a valid expression into components', () => {
      const expression = '2+3*4-1'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual([2, '+', 3, '*', 4, '-', 1])
    })

    it('Should handle refrences in the expression', () => {
      const expression = 'A1+B2'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual(['A1', '+', 'B2'])
    })

    it('Should handle negative numbers in the beginning of the expression', () => {
      const expression = '-5+3'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual([-5, '+', 3])
    })

    it('Should handle floating point numbers in the expression', () => {
      const expression = '5.1+3.5+A0'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual([5.1, '+', 3.5, '+', 'A0'])
    })
  })

  describe('evaluateExpression', () => {
    let mockUpdateDependenciesMap: jest.Mock
    let sheet: SpreadSheetType
    let dependencies: Set<string>
    beforeEach(() => {
      mockUpdateDependenciesMap = jest.fn()
      sheet = [
        [
          { id: '0-0', value: '', display: '', row: 0, column: 0 }, // A0
          { id: '0-1', value: 'abc', display: 'abc', row: 0, column: 1 }, // B0
          { id: '0-2', value: '3', display: '3', row: 0, column: 2 } // C0
        ],
        [
          { id: '1-0', value: '1', display: '1', row: 1, column: 0 }, // A1
          { id: '1-1', value: '4', display: '4', row: 1, column: 1 }, // B1
          { id: '1-2', value: '', display: '', row: 1, column: 2 } // C1
        ]
      ]
      dependencies = new Set<string>()
    })


    it('Should evaluate a valid expression correctly', () => {
      const id = '1-2'
      const expression = '2 + 3 * A1'
      const result = MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      expect(result.result).toBe(5)
      expect(result.dependencies).toEqual(['A1'])
      expect(mockUpdateDependenciesMap).toBeCalledTimes(1)
      expect(mockUpdateDependenciesMap).toBeCalledWith('C1', ['1-0'])
    })

    it('Should throw an error for an expression with a missing row number', () => {
      const id = '1-2'
      const expression = '2+AB'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.INVALID_REFERENCE('AB'))
      expect(mockUpdateDependenciesMap).toBeCalledTimes(0)
    })

    it('Should throw an error for an expression with an empty field', () => {
      const id = '1-2'
      const expression = '2+A0'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.DEPENDENCY_FIELD_EMPTY('A0'))
      expect(mockUpdateDependenciesMap).toBeCalledTimes(1)
      expect(mockUpdateDependenciesMap).toBeCalledWith('C1', ['0-0'])
    })

    it('Should throw an error for an expression with a field that has an error', () => {
      const id = '1-2'
      const expression = '2+B1'
      sheet[1][1].hasError = true
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.DEPENDENCY_FIELD_HAS_ERROR('B1'))
      expect(mockUpdateDependenciesMap).toBeCalledTimes(1)
      expect(mockUpdateDependenciesMap).toBeCalledWith('C1', ['1-1'])
    })

    it('Should throw an error for an expression with a field that is not a number', () => {
      const id = '1-2'
      const expression = '2+B0'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.DEPENDENCY_FIELD_IS_NOT_A_NUMBER('B0'))
      expect(mockUpdateDependenciesMap).toBeCalledTimes(1)
      expect(mockUpdateDependenciesMap).toBeCalledWith('C1', ['0-1'])
    })

    it('Should throw an error for an invalid expression with circular dependency', () => {
      const id = '1-2'
      const expression = 'A1+B2'
      dependencies.add('1-2')
      dependencies.add('2-2')

      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.CIRCULAR_DEPENDENCY(['A1', 'B2']))
      expect(mockUpdateDependenciesMap).toBeCalledTimes(1)
      expect(mockUpdateDependenciesMap).toBeCalledWith('C1', ['1-0', '2-1'])
    })

    it('Should throw an error for an expression that could not be evaluated', () => {
      const id = '1-2'
      const expression = '2+'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.INVALID_EXPRESSION)
      expect(mockUpdateDependenciesMap).toBeCalledTimes(0)
    })

    it('Should throw an error for an expression with a field that is out of bound', () => {
      const id = '1-2'
      const expression = '2+A3'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies, mockUpdateDependenciesMap)
      }).toThrowError(MATH_ERRORS.DEPENDENCY_FIELD_OUT_OF_BOUNDS('A3'))
    })
  })
})
