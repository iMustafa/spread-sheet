export interface SpreadSheetFieldState {
  id: string
  value: string
  display: string
  touched?: boolean
  error?: boolean
}

export type SpreadSheetType = Record<string, SpreadSheetFieldState[]>
