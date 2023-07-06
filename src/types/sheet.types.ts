export interface SpreadSheetFieldState {
  id: string
  value: string
  display: string
  row: number
  column: number
  touched?: boolean
  error?: boolean
}

export type SpreadSheetType = SpreadSheetFieldState[][]

