import { SpreadSheetType } from '@/types'
import { _parseRowAndColumnToReference, _parseRefrenceToRowAndColumn } from '../expressions'

export class MathParser {
  private static _isNotOperator(component: string) {
    return component !== '+' &&
      component !== '-' &&
      component !== '*' &&
      component !== '/'
  }

  private static _detectCircularDependency(
    id: string,
    fieldComponents: string[],
    dependencies: Set<string>
  ) {
    const circularDepedencyFields: string[] = []
    const [row, column] = id.split('-').map(i => parseInt(i))
    const refrence = _parseRowAndColumnToReference([row, column])

    if (fieldComponents.includes(refrence))
      circularDepedencyFields.push(refrence)

    if (!dependencies.size)
      return circularDepedencyFields

    for (const component of fieldComponents)
      if (dependencies.has(id))
        circularDepedencyFields.push(component)

    return circularDepedencyFields
  }

  public static validateExpression(expression: string): string {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().A-Za-z_]/g, '')
    const consecutiveOperatorRegex = /[-+*/]{2}/g
    const alphabeticLetterWithFloatingPointRegex = /[A-Za-z_]\d*\.\d+/g
    const consecutiveLettersRegex = /[A-Za-z_][A-Za-z_]/g
    const invalidNonAlphaNumericRegex = /[^a-zA-Z0-9+\-./*]/g

    if (invalidNonAlphaNumericRegex.test(sanitizedExpression))
      return "Invalid expression: Invalid non-alphanumeric character"

    if (consecutiveOperatorRegex.test(sanitizedExpression))
      return "Invalid expression: Consecutive operators"

    if (alphabeticLetterWithFloatingPointRegex.test(sanitizedExpression))
      return "Invalid expression: Alphabetic letter followed by a floating point"

    if (consecutiveLettersRegex.test(sanitizedExpression))
      return "Invalid expression: Consecutive letters"

    return ""
  }

  public static parseExpression(expression: string): (number | string)[] {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().A-Za-z_]/g, '')

    const components: (number | string)[] = []
    let currentNumber = ''
    let currentVariable = ''

    for (let i = 0; i < sanitizedExpression.length; i++) {
      const char = sanitizedExpression[i]
      if (/[0-9.-]/.test(char)) {
        currentNumber += char
        if (i === sanitizedExpression.length - 1 || !/[0-9.]/.test(sanitizedExpression[i + 1])) {
          components.push(parseFloat(currentNumber))
          currentNumber = ''
        }
      } else if (/[A-Za-z_]/.test(char)) {
        currentVariable += char
        let j = i + 1
        while (j < sanitizedExpression.length && /[0-9]/.test(sanitizedExpression[j])) {
          currentVariable += sanitizedExpression[j]
          j++
        }
        components.push(currentVariable)
        currentVariable = ''
        i = j - 1
      } else {
        components.push(char)
      }
    }
    return components
  }


  public static evaluateExpression(
    id: string,
    expression: string,
    sheet: SpreadSheetType,
    dependencies: Set<string>
  ): { result: number, dependencies: any[] } {
    const isInValidExpressionException = this.validateExpression(expression)
    if (isInValidExpressionException) throw new Error(isInValidExpressionException)

    const components = this.parseExpression(expression)
    const fieldComponents = components
      .filter(component => typeof component === 'string' && this._isNotOperator(component)) as string[]

    const circularDepedencyFields = this._detectCircularDependency(id, fieldComponents, dependencies)
    if (circularDepedencyFields.length)
      throw new Error(`Invalid expression: Circular dependency ${circularDepedencyFields.join(', ')}`)

    const stack: (number | string)[] = []

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 }

    const applyOperator = () => {
      const rightOperand = stack.pop() as number
      const operator = stack.pop() as string
      const leftOperand = stack.pop() as number

      let result: number

      switch (operator) {
        case '+':
          result = leftOperand + rightOperand
          break
        case '-':
          result = leftOperand - rightOperand
          break
        case '*':
          result = leftOperand * rightOperand
          break
        case '/':
          result = leftOperand / rightOperand
          break
        default:
          return NaN
      }

      stack.push(result)
    }

    for (const component of components) {
      if (typeof component === 'string' && this._isNotOperator(component)) {
        const [column, row] = _parseRefrenceToRowAndColumn(component)

        if (!row && row != 0)
          throw new Error(`Invalid expression: Field ${component} is missing row number`)

        const fieldValue = sheet[row][column]?.display

        if (!fieldValue && fieldValue != '0')
          throw new Error(`Invalid expression: Field ${component} is empty`)
        if (sheet[row][column].hasError)
          throw new Error(`Invalid expression: Field ${component} has error`)
        if (isNaN(Number(fieldValue)) && +fieldValue != 0)
          throw new Error(`Invalid expression: Field ${component} is not a number`)

        const variableData = [+fieldValue]
        stack.push(...variableData)
      } else {
        while (
          stack.length >= 2 &&
          typeof stack[stack.length - 1] === 'number' &&
          // @ts-ignore
          precedence[component] <= precedence[stack[stack.length - 2] as string]
        ) {
          applyOperator()
        }
        stack.push(component)
      }
    }

    while (stack.length > 1)
      applyOperator()

    if (stack.length === 1 && typeof stack[0] === 'number') {
      return {
        result: Math.round(stack[0] * 100) / 100,
        dependencies: fieldComponents
      }
    } else {
      throw new Error('Invalid expression: Expression could not be evaluated')
    }
  }
}
