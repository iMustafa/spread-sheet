import { SpreadSheetType } from "@/context/SpreadSheetContext/types"

type EvaluatedResult = {
  result: number
  dependencies: any[]
}

const _isNotOperator = (component: string) =>
  component !== '+' &&
  component !== '-' &&
  component !== '*' &&
  component !== '/' &&
  component !== '(' &&
  component !== ')'

const _detectCircularDependency = (
  id: string,
  components: string[],
  dependencies: Set<string>
) => {
  const circularDepedencyFields: string[] = []

  if (components.includes(id))
    circularDepedencyFields.push(id)

  if (!dependencies.size) return circularDepedencyFields

  for (const component of components) {
    if (dependencies.has(component)) {
      circularDepedencyFields.push(component)
    }
  }

  return circularDepedencyFields
}

export const useEvaluateMathExpression = () => {

  const validateExpression = (expression: string): string => {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().A-Za-z_]/g, '')
    const consecutiveOperatorRegex = /[-+*/]{2}/g
    const alphabeticLetterWithFloatingPointRegex = /[A-Za-z_]\d*\.\d+/g
    const consecutiveLettersRegex = /[A-Za-z_][A-Za-z_]/g

    if (consecutiveOperatorRegex.test(sanitizedExpression))
      return "Invalid expression: Consecutive operators"

    const parenthesesStack: string[] = []

    for (let i = 0; i < sanitizedExpression.length; i++) {
      const char = sanitizedExpression[i]

      if (char === '(') {
        parenthesesStack.push(char)
      } else if (char === ')') {
        if (parenthesesStack.length === 0)
          return "Invalid expression: Unmatched closing parenthesis"
        parenthesesStack.pop()
      }
    }

    if (parenthesesStack.length > 0)
      return "Invalid expression: Unmatched opening parenthesis"

    if (alphabeticLetterWithFloatingPointRegex.test(sanitizedExpression))
      return "Invalid expression: Alphabetic letter followed by a floating point"

    if (consecutiveLettersRegex.test(sanitizedExpression))
      return "Invalid expression: Consecutive letters"

    return ""
  }

  const parseExpression = (expression: string): (number | string)[] => {
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().A-Za-z_]/g, '')

    const components: (number | string)[] = []
    let currentNumber = ''
    let currentVariable = ''

    for (let i = 0; i < sanitizedExpression.length; i++) {
      const char = sanitizedExpression[i]

      if (/[0-9.]/.test(char)) {
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

  const evaluateExpression = (
    id: string,
    expression: string,
    sheet: SpreadSheetType,
    dependencies: Set<string>
  ): EvaluatedResult => {
    const isInValidExpressionException = validateExpression(expression)
    if (isInValidExpressionException) throw new Error(isInValidExpressionException)

    const components = parseExpression(expression)
    const fieldComponents = components
      .filter(component => typeof component === 'string' && _isNotOperator(component)) as string[]

    const circularDepedencyFields = _detectCircularDependency(id, fieldComponents, dependencies)
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
          console.error(`Invalid operator: ${operator}`)
          return NaN
      }

      stack.push(result)
    }

    for (const component of components) {
      if (typeof component === 'string' && _isNotOperator(component)) {
        const [column, row] = component.split(/(\d+)/)
        if (!row)
          throw new Error(`Invalid expression: Field ${component} is missing row number`)

        const fieldValue = sheet[column][row as unknown as number]?.display

        if (!fieldValue && fieldValue != 0)
          throw new Error(`Invalid expression: Field ${component} is empty`)
        if (!parseInt(`${fieldValue}`) && fieldValue != 0)
          throw new Error(`Invalid expression: Field ${component} is not a number`)

        const variableData = [fieldValue]
        stack.push(...variableData)
      } else if (component === '(') {
        stack.push(component)
      } else if (component === ')') {
        while (stack.length > 0 && stack[stack.length - 1] !== '(') {
          applyOperator()
        }
        if (stack[stack.length - 1] === '(') {
          stack.pop()
        } else {
          throw new Error('Invalid expression: Mismatched parentheses')
        }
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
        result: stack[0] as number,
        dependencies: fieldComponents
      }
    } else {
      throw new Error('Invalid expression: Expression could not be evaluated')
    }
  }


  return {
    parseExpression,
    validateExpression,
    evaluateExpression
  }
}
