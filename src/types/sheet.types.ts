export interface SpreadSheetFieldState {
  id: string
  value: string
  display: string
  row: number
  column: number
  touched?: boolean
  hasError?: boolean
  hasFormula?: boolean
}

export type SpreadSheetType = SpreadSheetFieldState[][]

