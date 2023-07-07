import { SpreadSheetType } from '@/types'
import { MathParser } from '../index'

describe('MathParser', () => {
  describe('validateExpression', () => {
    it('Should return an empty string for a valid expression', () => {
      const expression = '2 + 3 * 4'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('')
    })

    it('Should not accept non-alphanumeric', () => {
      const expression = '2 + _'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('Invalid expression: Invalid non-alphanumeric character')
    })

    it('Should not accept consecutive operators', () => {
      const expression = '2 ++ 3'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('Invalid expression: Consecutive operators')
    })

    it('Should not accept floating point after an alphabetic letter', () => {
      const expression = 'A.5 + 3'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('Invalid expression: Alphabetic letter followed by a floating point')
    })

    it('Should return an error message for expressions with consecutive letters', () => {
      const expression = '2AB + 3'
      const result = MathParser.validateExpression(expression)
      expect(result).toBe('Invalid expression: Consecutive letters')
    })
  })

  describe('parseExpression', () => {
    it('Should parse a valid expression into components', () => {
      const expression = '2 + 3 * 4'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual([2, '+', 3, '*', 4])
    })

    it('Should handle refrences in the expression', () => {
      const expression = 'A1 + B2'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual(['A1', '+', 'B2'])
    })

    it('Should handle negative numbers in the expression', () => {
      const expression = '-5 + 3'
      const components = MathParser.parseExpression(expression)
      expect(components).toEqual([-5, '+', 3])
    })
  })

  describe('evaluateExpression', () => {
    const sheet: SpreadSheetType = [
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
    const dependencies = new Set<string>()

    it('Should evaluate a valid expression correctly', () => {
      const id = '1-2'
      const expression = '2 + 3 * A1'
      const result = MathParser.evaluateExpression(id, expression, sheet, dependencies)
      expect(result.result).toBe(5)
      expect(result.dependencies).toEqual(['A1'])
    })

    it('Should throw an error for an expression with a missing row number', () => {
      const id = '1-2'
      const expression = '2 + B'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Field B is missing row number')
    })

    it('Should throw an error for an expression with an empty field', () => {
      const id = '1-2'
      const expression = '2 + A0'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Field A0 is empty')
    })

    it('Should throw an error for an expression with a field that has an error', () => {
      const id = '1-2'
      const expression = '2 + B1'
      sheet[1][1].hasError = true
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Field B1 has error')
    })

    it('Should throw an error for an expression with a field that is not a number', () => {
      const id = '1-2'
      const expression = '2 + B0'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Field B0 is not a number')
    })

    it('Should throw an error for an invalid expression with circular dependency', () => {
      const id = '1-2'
      const expression = 'A1 + B2'
      dependencies.add('1-2')
      dependencies.add('2-2')
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Circular dependency A1, B2')
    })

    it('Should throw an error for an expression that could not be evaluated', () => {
      const id = '1-2'
      const expression = '2 +'
      expect(() => {
        MathParser.evaluateExpression(id, expression, sheet, dependencies)
      }).toThrowError('Invalid expression: Expression could not be evaluated')
    })
  })
})
