import { SpreadSheetType } from '@/types'
import { parseRowAndColumnToReference, parseReferenceToRowAndColumn, parseReferenceToId } from '../expressions'
import { MATH_ERRORS } from './errors'

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
    const reference = parseRowAndColumnToReference([row, column])

    if (fieldComponents.includes(reference))
      circularDepedencyFields.push(reference)

    if (!dependencies.size)
      return circularDepedencyFields

    for (const component of fieldComponents)
      if (dependencies.has(id))
        circularDepedencyFields.push(component)

    return circularDepedencyFields
  }

  public static sanatizeExpression(expression: string): string {
    return expression.replace(/[^0-9+\-*/().A-Za-z_]/g, '')
  }

  public static validateExpression(sanitizedExpression: string): string {
    const consecutiveOperatorRegex = /[-+*/]{2}/g
    const nonAlphaNumericLetterRegex = /[A-Za-z_]\D*(?![A-Za-z0-9])/g
    const invalidNonAlphaNumericRegex = /[^a-zA-Z0-9+\-./*]/g

    if (invalidNonAlphaNumericRegex.test(sanitizedExpression))
      return MATH_ERRORS.INVALID_NON_ALPHANUMERIC_CHARACTER

    if (consecutiveOperatorRegex.test(sanitizedExpression))
      return MATH_ERRORS.CONSECUTIVE_OPERATORS

    const invalidMatches = sanitizedExpression.match(nonAlphaNumericLetterRegex)
    if (invalidMatches?.length) {
      return MATH_ERRORS.INVALID_REFERENCE(invalidMatches.join(', '))
    }

    return ""
  }

  public static parseExpression(sanitizedExpression: string): (number | string)[] {
    const components: (number | string)[] = []
    let currentNumber = ''
    let currentVariable = ''

    for (let i = 0; i < sanitizedExpression.length; i++) {
      const char = sanitizedExpression[i]

      if (
        /[0-9.]/.test(char) ||
        (i === 0 && char === '-' && /[0-9A-Za-z]/.test(sanitizedExpression[i + 1]))
      ) {
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
    dependencies: Set<string>,
    handleUpdateDepenciesMap: (reference: string, dependencies?: string[]) => void
  ): { result: number, dependencies: any[] } {
    const sanatizedExpression = this.sanatizeExpression(expression)
    const hasError = this.validateExpression(sanatizedExpression)
    if (hasError)
      throw new Error(hasError)

    const reference = parseRowAndColumnToReference(id)
    const components = this.parseExpression(sanatizedExpression)
    const fieldComponents = components
      .filter(component => typeof component === 'string' && this._isNotOperator(component)) as string[]

    const circularDepedencyFields = this._detectCircularDependency(id, fieldComponents, dependencies)
    if (circularDepedencyFields.length) {
      handleUpdateDepenciesMap(
        reference,
        fieldComponents.map(ref => parseReferenceToId(ref))
      )
      throw new Error(MATH_ERRORS.CIRCULAR_DEPENDENCY(circularDepedencyFields))
    }

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
        const [row, column] = parseReferenceToRowAndColumn(component)
        if (column > sheet[0].length - 1 || row > sheet.length - 1)
          throw new Error(MATH_ERRORS.DEPENDENCY_FIELD_OUT_OF_BOUNDS(component))

        const fieldValue = sheet[row][column]?.display

        if (!fieldValue && fieldValue != '0') {
          handleUpdateDepenciesMap(reference, fieldComponents.map(ref => parseReferenceToId(ref)))
          throw new Error(MATH_ERRORS.DEPENDENCY_FIELD_EMPTY(component))
        }

        if (sheet[row][column].hasError) {
          handleUpdateDepenciesMap(
            reference,
            fieldComponents.map(ref => parseReferenceToId(ref))
          )
          throw new Error(MATH_ERRORS.DEPENDENCY_FIELD_HAS_ERROR(component))
        }

        if (isNaN(Number(fieldValue)) && +fieldValue != 0) {
          handleUpdateDepenciesMap(
            reference,
            fieldComponents.map(ref => parseReferenceToId(ref))
          )
          throw new Error(MATH_ERRORS.DEPENDENCY_FIELD_IS_NOT_A_NUMBER(component))
        }

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
      handleUpdateDepenciesMap(
        reference,
        fieldComponents.map(ref => parseReferenceToId(ref))
      )
      return {
        result: Math.round(stack[0] * 100) / 100,
        dependencies: fieldComponents
      }
    } else {
      throw new Error(MATH_ERRORS.INVALID_EXPRESSION)
    }
  }
}
