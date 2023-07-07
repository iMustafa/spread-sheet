export const MATH_ERRORS = {
  INVALID_NON_ALPHANUMERIC_CHARACTER: "Invalid expression: Invalid non-alphanumeric character",
  CONSECUTIVE_OPERATORS: "Invalid expression: Consecutive operators",
  INVALID_EXPRESSION: 'Invalid expression: Expression could not be evaluated',
  INVALID_REFERENCE: (component: string) => `Invalid expression: Invalid reference ${component}`,
  DEPENDENCY_FIELD_OUT_OF_BOUNDS: (component: string) => `Invalid expression: Field ${component} is out of bounds`,
  CIRCULAR_DEPENDENCY: (components: string[]) => `Invalid expression: Circular dependency detected ${components.join(', ')}`,
  DEPENDENCY_FIELD_MISSING_ROW_NUMBER: (component: string) => `Invalid expression: Field ${component} is missing row number`,
  DEPENDENCY_FIELD_EMPTY: (component: string) => `Invalid expression: Field ${component} is empty`,
  DEPENDENCY_FIELD_HAS_ERROR: (component: string) => `Invalid expression: Field ${component} has an error`,
  DEPENDENCY_FIELD_IS_NOT_A_NUMBER: (component: string) => `Invalid expression: Field ${component} is not a number`,
}
